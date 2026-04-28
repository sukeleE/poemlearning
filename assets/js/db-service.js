(function () {
  var KEYS = {
    users: "poetry.db.users.v1",
    currentUser: "poetry.db.currentUser.v1",
    articles: "poetry.db.articles.v1",
    likes: "poetry.db.likes.v1",
    favorites: "poetry.db.favorites.v1",
    comments: "poetry.db.comments.v1"
  };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function uid(prefix) {
    return prefix + "_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
  }

  function ensureSeedData() {
    var users = read(KEYS.users, []);
    if (!users.length) {
      users = [{ id: "u_guest", username: "游客", password: "", createdAt: nowISO() }];
      write(KEYS.users, users);
    }

    var current = read(KEYS.currentUser, null);
    if (!current) {
      write(KEYS.currentUser, { id: "u_guest", username: "游客" });
    }
  }

  function getCurrentUser() {
    ensureSeedData();
    return read(KEYS.currentUser, { id: "u_guest", username: "游客" });
  }

  function setCurrentUser(user) {
    write(KEYS.currentUser, user);
  }

  function allArticles() {
    return read(KEYS.articles, []);
  }

  function allLikes() {
    return read(KEYS.likes, []);
  }

  function allFavorites() {
    return read(KEYS.favorites, []);
  }

  function allComments() {
    return read(KEYS.comments, []);
  }

  function withStats(article) {
    var likes = allLikes().filter(function (x) { return x.articleId === article.id; }).length;
    var comments = allComments().filter(function (x) { return x.articleId === article.id; }).length;
    var favorites = allFavorites().filter(function (x) { return x.articleId === article.id; }).length;
    return Object.assign({}, article, {
      likes: likes,
      commentCount: comments,
      favoriteCount: favorites
    });
  }

  var DBService = {
    getCurrentUser: getCurrentUser,
    logout: function () {
      setCurrentUser({ id: "u_guest", username: "游客" });
    },
    register: async function (username, password) {
      ensureSeedData();
      var users = read(KEYS.users, []);
      if (!username || !password) return { success: false, message: "用户名和密码不能为空" };
      if (users.some(function (u) { return u.username === username; })) {
        return { success: false, message: "用户名已存在" };
      }
      var user = { id: uid("u"), username: username, password: password, createdAt: nowISO() };
      users.push(user);
      write(KEYS.users, users);
      return { success: true, user: { id: user.id, username: user.username } };
    },
    login: async function (username, password) {
      ensureSeedData();
      var users = read(KEYS.users, []);
      var user = users.find(function (u) { return u.username === username && u.password === password; });
      if (!user) return { success: false, message: "用户名或密码错误" };
      setCurrentUser({ id: user.id, username: user.username });
      return { success: true, user: { id: user.id, username: user.username } };
    },
    createArticle: async function (article) {
      ensureSeedData();
      var items = allArticles();
      var payload = Object.assign({}, article, {
        id: article.id || uid("a"),
        createdAt: article.createdAt || nowISO(),
        updatedAt: nowISO(),
        published: !!article.published
      });
      items.unshift(payload);
      write(KEYS.articles, items);
      return { success: true, data: withStats(payload) };
    },
    updateArticle: async function (articleId, patch) {
      var items = allArticles();
      var idx = items.findIndex(function (a) { return a.id === articleId; });
      if (idx < 0) return { success: false, message: "文章不存在" };
      items[idx] = Object.assign({}, items[idx], patch, { updatedAt: nowISO() });
      write(KEYS.articles, items);
      return { success: true, data: withStats(items[idx]) };
    },
    deleteArticle: async function (articleId) {
      write(KEYS.articles, allArticles().filter(function (a) { return a.id !== articleId; }));
      write(KEYS.likes, allLikes().filter(function (x) { return x.articleId !== articleId; }));
      write(KEYS.favorites, allFavorites().filter(function (x) { return x.articleId !== articleId; }));
      write(KEYS.comments, allComments().filter(function (x) { return x.articleId !== articleId; }));
      return { success: true };
    },
    getArticle: async function (articleId) {
      var a = allArticles().find(function (x) { return x.id === articleId; });
      return a ? withStats(a) : null;
    },
    getArticles: async function (publishedOnly, userId) {
      var list = allArticles();
      if (publishedOnly) list = list.filter(function (a) { return !!a.published; });
      if (userId) list = list.filter(function (a) { return a.userId === userId; });
      return list.map(withStats);
    },
    toggleLike: async function (articleId) {
      var user = getCurrentUser();
      var likes = allLikes();
      var i = likes.findIndex(function (x) { return x.articleId === articleId && x.userId === user.id; });
      if (i >= 0) likes.splice(i, 1);
      else likes.push({ articleId: articleId, userId: user.id, createdAt: nowISO() });
      write(KEYS.likes, likes);
      return { success: true };
    },
    toggleFavorite: async function (articleId) {
      var user = getCurrentUser();
      var favorites = allFavorites();
      var i = favorites.findIndex(function (x) { return x.articleId === articleId && x.userId === user.id; });
      if (i >= 0) favorites.splice(i, 1);
      else favorites.push({ articleId: articleId, userId: user.id, createdAt: nowISO() });
      write(KEYS.favorites, favorites);
      return { success: true };
    },
    isFavorited: async function (articleId) {
      var user = getCurrentUser();
      return allFavorites().some(function (x) { return x.articleId === articleId && x.userId === user.id; });
    },
    addComment: async function (articleId, content) {
      var user = getCurrentUser();
      var comments = allComments();
      comments.push({
        id: uid("c"),
        articleId: articleId,
        userId: user.id,
        username: user.username,
        content: content,
        createdAt: nowISO()
      });
      write(KEYS.comments, comments);
      return { success: true };
    },
    getComments: async function (articleId) {
      return allComments()
        .filter(function (c) { return c.articleId === articleId; })
        .sort(function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });
    },
    getFavoriteArticles: async function () {
      var user = getCurrentUser();
      var favIds = allFavorites()
        .filter(function (x) { return x.userId === user.id; })
        .map(function (x) { return x.articleId; });
      return allArticles().filter(function (a) { return favIds.indexOf(a.id) >= 0; }).map(withStats);
    }
  };

  ensureSeedData();

  // Remote-first API bridge: by default require backend SQLite.
  var API_BASE = (window.__POETRY_API_BASE__ || "http://127.0.0.1:3000/api").replace(/\/$/, "");
  var remoteAvailable = null;
  var remoteCheckedAt = 0;
  var ALLOW_LOCAL_FALLBACK = !!window.__POETRY_ALLOW_LOCAL_FALLBACK__;
  var REMOTE_CACHE_MS = 10000;

  async function pingRemote() {
    if (remoteAvailable !== null && Date.now() - remoteCheckedAt < REMOTE_CACHE_MS) return remoteAvailable;
    try {
      var r = await fetch(API_BASE + "/health", { method: "GET" });
      remoteAvailable = !!(r && r.ok);
    } catch (e) {
      remoteAvailable = false;
    }
    remoteCheckedAt = Date.now();
    return remoteAvailable;
  }

  async function apiFetch(path, options) {
    var response = await fetch(API_BASE + path, Object.assign({
      headers: { "Content-Type": "application/json" }
    }, options || {}));
    var text = await response.text();
    var payload = text ? JSON.parse(text) : null;
    if (!response.ok) {
      var msg = payload && payload.message ? payload.message : ("HTTP " + response.status);
      throw new Error(msg);
    }
    return payload;
  }

  async function remoteOrLocal(remoteFn, localFn) {
    var ok = await pingRemote();
    if (!ok) {
      if (ALLOW_LOCAL_FALLBACK) return localFn();
      throw new Error("数据库服务不可用，请确认后端已启动");
    }
    try {
      return await remoteFn();
    } catch (e) {
      remoteAvailable = false;
      remoteCheckedAt = Date.now();
      if (ALLOW_LOCAL_FALLBACK) return localFn();
      throw e;
    }
  }

  function emitUserSync(user) {
    try {
      window.dispatchEvent(new CustomEvent("db:user-sync", { detail: user || null }));
    } catch (e) {}
  }

  var localDB = DBService;
  var remoteDB = {
    getCurrentUser: async function () { return apiFetch("/current-user"); },
    logout: async function () { return apiFetch("/logout", { method: "POST", body: "{}" }); },
    register: async function (username, password) {
      return apiFetch("/register", { method: "POST", body: JSON.stringify({ username: username, password: password }) });
    },
    login: async function (username, password) {
      return apiFetch("/login", { method: "POST", body: JSON.stringify({ username: username, password: password }) });
    },
    createArticle: async function (article) {
      return apiFetch("/articles", { method: "POST", body: JSON.stringify(article || {}) });
    },
    updateArticle: async function (articleId, patch) {
      return apiFetch("/articles/" + encodeURIComponent(articleId), { method: "PATCH", body: JSON.stringify(patch || {}) });
    },
    deleteArticle: async function (articleId) {
      return apiFetch("/articles/" + encodeURIComponent(articleId), { method: "DELETE" });
    },
    getArticle: async function (articleId) {
      return apiFetch("/articles/" + encodeURIComponent(articleId), { method: "GET" });
    },
    getArticles: async function (publishedOnly, userId) {
      var params = [];
      if (publishedOnly) params.push("publishedOnly=1");
      if (userId) params.push("userId=" + encodeURIComponent(userId));
      var qs = params.length ? ("?" + params.join("&")) : "";
      return apiFetch("/articles" + qs, { method: "GET" });
    },
    toggleLike: async function (articleId) {
      return apiFetch("/articles/" + encodeURIComponent(articleId) + "/like", { method: "POST", body: "{}" });
    },
    toggleFavorite: async function (articleId) {
      return apiFetch("/articles/" + encodeURIComponent(articleId) + "/favorite", { method: "POST", body: "{}" });
    },
    isFavorited: async function (articleId) {
      var res = await apiFetch("/articles/" + encodeURIComponent(articleId) + "/favorited", { method: "GET" });
      return !!(res && res.favorited);
    },
    addComment: async function (articleId, content) {
      return apiFetch("/articles/" + encodeURIComponent(articleId) + "/comments", {
        method: "POST",
        body: JSON.stringify({ content: content })
      });
    },
    getComments: async function (articleId) {
      return apiFetch("/articles/" + encodeURIComponent(articleId) + "/comments", { method: "GET" });
    },
    getFavoriteArticles: async function () {
      return apiFetch("/favorites/articles", { method: "GET" });
    }
  };

  window.DBService = {
    // Keep this sync for existing callers, and refresh from backend in background.
    getCurrentUser: function () {
      var localUser = localDB.getCurrentUser();
      pingRemote().then(function (ok) {
        if (!ok) return;
        remoteDB.getCurrentUser().then(function (u) {
          if (u && u.id) {
            var next = { id: u.id, username: u.username || "游客" };
            setCurrentUser(next);
            emitUserSync(next);
          }
        }).catch(function () {});
      });
      return localUser;
    },
    logout: function () {
      return remoteOrLocal(
        function () { return remoteDB.logout(); },
        function () { return localDB.logout(); }
      ).then(function (res) {
        setCurrentUser({ id: "u_guest", username: "游客" });
        emitUserSync({ id: "u_guest", username: "游客" });
        return res;
      });
    },
    register: function (username, password) {
      return remoteOrLocal(
        function () { return remoteDB.register(username, password); },
        function () { return localDB.register(username, password); }
      ).then(function (res) {
        return res;
      });
    },
    login: function (username, password) {
      return remoteOrLocal(
        function () { return remoteDB.login(username, password); },
        function () { return localDB.login(username, password); }
      ).then(function (res) {
        if (res && res.success && res.user && res.user.id) {
          var next = { id: res.user.id, username: res.user.username || username };
          setCurrentUser(next);
          emitUserSync(next);
        }
        return res;
      });
    },
    createArticle: function (article) { return remoteOrLocal(function () { return remoteDB.createArticle(article); }, function () { return localDB.createArticle(article); }); },
    updateArticle: function (articleId, patch) { return remoteOrLocal(function () { return remoteDB.updateArticle(articleId, patch); }, function () { return localDB.updateArticle(articleId, patch); }); },
    deleteArticle: function (articleId) { return remoteOrLocal(function () { return remoteDB.deleteArticle(articleId); }, function () { return localDB.deleteArticle(articleId); }); },
    getArticle: function (articleId) { return remoteOrLocal(function () { return remoteDB.getArticle(articleId); }, function () { return localDB.getArticle(articleId); }); },
    getArticles: function (publishedOnly, userId) { return remoteOrLocal(function () { return remoteDB.getArticles(publishedOnly, userId); }, function () { return localDB.getArticles(publishedOnly, userId); }); },
    toggleLike: function (articleId) { return remoteOrLocal(function () { return remoteDB.toggleLike(articleId); }, function () { return localDB.toggleLike(articleId); }); },
    toggleFavorite: function (articleId) { return remoteOrLocal(function () { return remoteDB.toggleFavorite(articleId); }, function () { return localDB.toggleFavorite(articleId); }); },
    isFavorited: function (articleId) { return remoteOrLocal(function () { return remoteDB.isFavorited(articleId); }, function () { return localDB.isFavorited(articleId); }); },
    addComment: function (articleId, content) { return remoteOrLocal(function () { return remoteDB.addComment(articleId, content); }, function () { return localDB.addComment(articleId, content); }); },
    getComments: function (articleId) { return remoteOrLocal(function () { return remoteDB.getComments(articleId); }, function () { return localDB.getComments(articleId); }); },
    getFavoriteArticles: function () { return remoteOrLocal(function () { return remoteDB.getFavoriteArticles(); }, function () { return localDB.getFavoriteArticles(); }); }
  };
})();
