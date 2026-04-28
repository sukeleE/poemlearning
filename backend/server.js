const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");
const SQLITE_FILE = path.join(DATA_DIR, "app.sqlite");
const DEEPSEEK_API_KEY = (process.env.DEEPSEEK_API_KEY || "").trim();
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

app.use(cors());
app.use(express.json({ limit: "4mb" }));

function nowISO() {
  return new Date().toISOString();
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

const db = new DatabaseSync(SQLITE_FILE);
db.exec("PRAGMA foreign_keys = ON;");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS likes (
  article_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(article_id, user_id),
  FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS favorites (
  article_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(article_id, user_id),
  FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS ai_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  model TEXT NOT NULL,
  messages_json TEXT NOT NULL,
  response_json TEXT,
  error TEXT,
  created_at TEXT NOT NULL
);
`);

const ensureUserStmt = db.prepare(`
INSERT INTO users (id, username, password, created_at)
VALUES (?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  username = excluded.username,
  password = excluded.password
`);
const upsertStateStmt = db.prepare(`
INSERT INTO app_state (key, value) VALUES (?, ?)
ON CONFLICT(key) DO UPDATE SET value = excluded.value
`);

function getCurrentUser() {
  const row = db.prepare(`SELECT value FROM app_state WHERE key = 'current_user'`).get();
  if (!row) return { id: "u_guest", username: "游客" };
  try {
    return JSON.parse(row.value);
  } catch {
    return { id: "u_guest", username: "游客" };
  }
}

function setCurrentUser(user) {
  upsertStateStmt.run("current_user", JSON.stringify(user));
}

function articleWithStatsById(articleId) {
  const row = db.prepare(`
    SELECT a.id, a.title, a.author, a.content, a.user_id AS userId,
           a.published, a.created_at AS createdAt, a.updated_at AS updatedAt,
           (SELECT COUNT(*) FROM likes l WHERE l.article_id = a.id) AS likes,
           (SELECT COUNT(*) FROM comments c WHERE c.article_id = a.id) AS commentCount,
           (SELECT COUNT(*) FROM favorites f WHERE f.article_id = a.id) AS favoriteCount
    FROM articles a
    WHERE a.id = ?
  `).get(articleId);
  if (!row) return null;
  row.published = !!row.published;
  return row;
}

async function migrateFromJsonIfNeeded() {
  const countRow = db.prepare(`SELECT COUNT(*) AS count FROM users`).get();
  if (countRow.count > 0) return;

  let state = null;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    state = JSON.parse(raw);
  } catch {
    state = null;
  }

  if (!state) {
    const guest = { id: "u_guest", username: "游客", password: "", createdAt: nowISO() };
    ensureUserStmt.run(guest.id, guest.username, guest.password, guest.createdAt);
    setCurrentUser({ id: guest.id, username: guest.username });
    return;
  }

  const migrate = (s) => {
    const users = Array.isArray(s.users) ? s.users : [];
    users.forEach((u) => {
      ensureUserStmt.run(
        u.id || uid("u"),
        u.username || "游客",
        u.password || "",
        u.createdAt || nowISO()
      );
    });

    if (!users.some((u) => u.id === "u_guest")) {
      ensureUserStmt.run("u_guest", "游客", "", nowISO());
    }

    setCurrentUser(
      s.currentUser && s.currentUser.id
        ? { id: s.currentUser.id, username: s.currentUser.username || "游客" }
        : { id: "u_guest", username: "游客" }
    );

    const insertArticle = db.prepare(`
      INSERT OR REPLACE INTO articles
      (id, title, author, content, user_id, published, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    (Array.isArray(s.articles) ? s.articles : []).forEach((a) => {
      const userId = a.userId || "u_guest";
      ensureUserStmt.run(userId, userId === "u_guest" ? "游客" : userId, "", nowISO());
      insertArticle.run(
        a.id || uid("a"),
        a.title || "无题",
        a.author || "匿名",
        a.content || "",
        userId,
        a.published ? 1 : 0,
        a.createdAt || nowISO(),
        a.updatedAt || nowISO()
      );
    });

    const insertLike = db.prepare(`INSERT OR IGNORE INTO likes (article_id, user_id, created_at) VALUES (?, ?, ?)`);
    (Array.isArray(s.likes) ? s.likes : []).forEach((x) => {
      if (!x.articleId || !x.userId) return;
      ensureUserStmt.run(x.userId, x.userId === "u_guest" ? "游客" : x.userId, "", nowISO());
      insertLike.run(x.articleId, x.userId, x.createdAt || nowISO());
    });

    const insertFav = db.prepare(`INSERT OR IGNORE INTO favorites (article_id, user_id, created_at) VALUES (?, ?, ?)`);
    (Array.isArray(s.favorites) ? s.favorites : []).forEach((x) => {
      if (!x.articleId || !x.userId) return;
      ensureUserStmt.run(x.userId, x.userId === "u_guest" ? "游客" : x.userId, "", nowISO());
      insertFav.run(x.articleId, x.userId, x.createdAt || nowISO());
    });

    const insertComment = db.prepare(`
      INSERT OR REPLACE INTO comments (id, article_id, user_id, username, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    (Array.isArray(s.comments) ? s.comments : []).forEach((c) => {
      if (!c.articleId || !c.userId) return;
      ensureUserStmt.run(c.userId, c.username || c.userId, "", nowISO());
      insertComment.run(
        c.id || uid("c"),
        c.articleId,
        c.userId,
        c.username || "游客",
        c.content || "",
        c.createdAt || nowISO()
      );
    });
  };

  db.exec("BEGIN");
  try {
    migrate(state);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

app.get("/api/health", (_, res) => {
  res.json({ ok: true, service: "poetry-api", store: "sqlite", time: nowISO() });
});

app.post("/api/ai/chat", async (req, res) => {
  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "服务端未配置 DEEPSEEK_API_KEY",
    });
  }

  const body = req.body || {};
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const temperature = typeof body.temperature === "number" ? body.temperature : 0.7;
  const max_tokens = typeof body.max_tokens === "number" ? body.max_tokens : 900;
  const primaryModel = body.model || "deepseek-v3.2";
  const fallbackModel = "deepseek-chat";
  const currentUser = getCurrentUser();
  const logId = uid("ai");

  async function requestModel(model) {
    const resp = await fetch(DEEPSEEK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({ model, temperature, max_tokens, messages }),
    });
    const text = await resp.text();
    let json = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }
    if (!resp.ok) {
      const msg = (json && json.error && json.error.message) || `DeepSeek 请求失败: ${resp.status}`;
      throw new Error(msg);
    }
    return json;
  }

  try {
    let result;
    let usedModel = primaryModel;
    try {
      result = await requestModel(primaryModel);
    } catch {
      usedModel = fallbackModel;
      result = await requestModel(fallbackModel);
    }
    db.prepare(`
      INSERT INTO ai_logs (id, user_id, model, messages_json, response_json, error, created_at)
      VALUES (?, ?, ?, ?, ?, NULL, ?)
    `).run(logId, currentUser.id, usedModel, JSON.stringify(messages), JSON.stringify(result), nowISO());

    return res.json({ success: true, data: result });
  } catch (e) {
    db.prepare(`
      INSERT INTO ai_logs (id, user_id, model, messages_json, response_json, error, created_at)
      VALUES (?, ?, ?, ?, NULL, ?, ?)
    `).run(logId, currentUser.id, primaryModel, JSON.stringify(messages), e.message || "AI 服务调用失败", nowISO());

    return res.status(502).json({
      success: false,
      message: e.message || "AI 服务调用失败",
    });
  }
});

app.get("/api/current-user", (_, res) => {
  res.json(getCurrentUser());
});

app.post("/api/logout", (_, res) => {
  setCurrentUser({ id: "u_guest", username: "游客" });
  res.json({ success: true });
});

app.post("/api/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "用户名和密码不能为空" });
  }
  const exists = db.prepare(`SELECT id FROM users WHERE username = ?`).get(username);
  if (exists) {
    return res.status(409).json({ success: false, message: "用户名已存在" });
  }
  const user = { id: uid("u"), username, password, createdAt: nowISO() };
  db.prepare(`INSERT INTO users (id, username, password, created_at) VALUES (?, ?, ?, ?)`)
    .run(user.id, user.username, user.password, user.createdAt);
  return res.json({ success: true, user: { id: user.id, username: user.username } });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare(`
    SELECT id, username FROM users WHERE username = ? AND password = ?
  `).get(username, password);
  if (!user) {
    return res.status(401).json({ success: false, message: "用户名或密码错误" });
  }
  setCurrentUser({ id: user.id, username: user.username });
  return res.json({ success: true, user });
});

app.post("/api/articles", (req, res) => {
  const article = req.body || {};
  const payload = {
    id: article.id || uid("a"),
    title: article.title || "无题",
    author: article.author || "匿名",
    content: article.content || "",
    userId: article.userId || getCurrentUser().id || "u_guest",
    published: article.published ? 1 : 0,
    createdAt: article.createdAt || nowISO(),
    updatedAt: nowISO(),
  };
  ensureUserStmt.run(payload.userId, payload.userId === "u_guest" ? "游客" : payload.userId, "", nowISO());
  db.prepare(`
    INSERT INTO articles (id, title, author, content, user_id, published, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.id, payload.title, payload.author, payload.content, payload.userId,
    payload.published, payload.createdAt, payload.updatedAt
  );
  res.json({ success: true, data: articleWithStatsById(payload.id) });
});

app.patch("/api/articles/:articleId", (req, res) => {
  const current = db.prepare(`SELECT * FROM articles WHERE id = ?`).get(req.params.articleId);
  if (!current) return res.status(404).json({ success: false, message: "文章不存在" });
  const patch = req.body || {};
  const next = {
    title: patch.title ?? current.title,
    author: patch.author ?? current.author,
    content: patch.content ?? current.content,
    userId: patch.userId ?? current.user_id,
    published: patch.published === undefined ? current.published : (patch.published ? 1 : 0),
    updatedAt: nowISO(),
  };
  db.prepare(`
    UPDATE articles
    SET title = ?, author = ?, content = ?, user_id = ?, published = ?, updated_at = ?
    WHERE id = ?
  `).run(next.title, next.author, next.content, next.userId, next.published, next.updatedAt, req.params.articleId);
  res.json({ success: true, data: articleWithStatsById(req.params.articleId) });
});

app.delete("/api/articles/:articleId", (req, res) => {
  db.prepare(`DELETE FROM articles WHERE id = ?`).run(req.params.articleId);
  res.json({ success: true });
});

app.get("/api/articles/:articleId", (req, res) => {
  const row = articleWithStatsById(req.params.articleId);
  if (!row) return res.status(404).json(null);
  res.json(row);
});

app.get("/api/articles", (req, res) => {
  const publishedOnly = req.query.publishedOnly === "1" || req.query.publishedOnly === "true";
  const userId = req.query.userId;
  let sql = `
    SELECT a.id, a.title, a.author, a.content, a.user_id AS userId,
           a.published, a.created_at AS createdAt, a.updated_at AS updatedAt,
           (SELECT COUNT(*) FROM likes l WHERE l.article_id = a.id) AS likes,
           (SELECT COUNT(*) FROM comments c WHERE c.article_id = a.id) AS commentCount,
           (SELECT COUNT(*) FROM favorites f WHERE f.article_id = a.id) AS favoriteCount
    FROM articles a
  `;
  const args = [];
  const where = [];
  if (publishedOnly) where.push(`a.published = 1`);
  if (userId) {
    where.push(`a.user_id = ?`);
    args.push(userId);
  }
  if (where.length) sql += ` WHERE ` + where.join(" AND ");
  sql += ` ORDER BY datetime(a.updated_at) DESC`;
  const rows = db.prepare(sql).all(...args).map((r) => ({ ...r, published: !!r.published }));
  res.json(rows);
});

app.post("/api/articles/:articleId/like", (req, res) => {
  const user = getCurrentUser();
  const articleId = req.params.articleId;
  const exists = db.prepare(`SELECT 1 FROM likes WHERE article_id = ? AND user_id = ?`).get(articleId, user.id);
  if (exists) {
    db.prepare(`DELETE FROM likes WHERE article_id = ? AND user_id = ?`).run(articleId, user.id);
  } else {
    db.prepare(`INSERT INTO likes (article_id, user_id, created_at) VALUES (?, ?, ?)`)
      .run(articleId, user.id, nowISO());
  }
  res.json({ success: true });
});

app.post("/api/articles/:articleId/favorite", (req, res) => {
  const user = getCurrentUser();
  const articleId = req.params.articleId;
  const exists = db.prepare(`SELECT 1 FROM favorites WHERE article_id = ? AND user_id = ?`).get(articleId, user.id);
  if (exists) {
    db.prepare(`DELETE FROM favorites WHERE article_id = ? AND user_id = ?`).run(articleId, user.id);
  } else {
    db.prepare(`INSERT INTO favorites (article_id, user_id, created_at) VALUES (?, ?, ?)`)
      .run(articleId, user.id, nowISO());
  }
  res.json({ success: true });
});

app.get("/api/articles/:articleId/favorited", (req, res) => {
  const user = getCurrentUser();
  const exists = db.prepare(`SELECT 1 FROM favorites WHERE article_id = ? AND user_id = ?`)
    .get(req.params.articleId, user.id);
  res.json({ favorited: !!exists });
});

app.get("/api/articles/:articleId/comments", (req, res) => {
  const rows = db.prepare(`
    SELECT id, article_id AS articleId, user_id AS userId, username, content, created_at AS createdAt
    FROM comments
    WHERE article_id = ?
    ORDER BY datetime(created_at) ASC
  `).all(req.params.articleId);
  res.json(rows);
});

app.post("/api/articles/:articleId/comments", (req, res) => {
  const user = getCurrentUser();
  const content = ((req.body || {}).content || "").trim();
  if (!content) return res.status(400).json({ success: false, message: "评论不能为空" });
  db.prepare(`
    INSERT INTO comments (id, article_id, user_id, username, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uid("c"), req.params.articleId, user.id, user.username || "游客", content, nowISO());
  res.json({ success: true });
});

app.get("/api/favorites/articles", (_, res) => {
  const user = getCurrentUser();
  const rows = db.prepare(`
    SELECT a.id, a.title, a.author, a.content, a.user_id AS userId,
           a.published, a.created_at AS createdAt, a.updated_at AS updatedAt,
           (SELECT COUNT(*) FROM likes l WHERE l.article_id = a.id) AS likes,
           (SELECT COUNT(*) FROM comments c WHERE c.article_id = a.id) AS commentCount,
           (SELECT COUNT(*) FROM favorites f WHERE f.article_id = a.id) AS favoriteCount
    FROM articles a
    INNER JOIN favorites fv ON fv.article_id = a.id
    WHERE fv.user_id = ?
    ORDER BY datetime(a.updated_at) DESC
  `).all(user.id).map((r) => ({ ...r, published: !!r.published }));
  res.json(rows);
});

migrateFromJsonIfNeeded().then(() => {
  app.listen(PORT, () => {
    console.log(`[poetry-api] listening on http://127.0.0.1:${PORT}`);
    console.log(`[poetry-api] sqlite file: ${SQLITE_FILE}`);
  });
}).catch((err) => {
  console.error("[poetry-api] init failed:", err);
  process.exit(1);
});
