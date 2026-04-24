const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function nowISO() {
  return new Date().toISOString();
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function withStats(state, article) {
  const likes = state.likes.filter((x) => x.articleId === article.id).length;
  const comments = state.comments.filter((x) => x.articleId === article.id).length;
  const favorites = state.favorites.filter((x) => x.articleId === article.id).length;
  return {
    ...article,
    likes,
    commentCount: comments,
    favoriteCount: favorites,
  };
}

function createInitialData() {
  const guest = { id: "u_guest", username: "游客", password: "", createdAt: nowISO() };
  return {
    users: [guest],
    currentUser: { id: guest.id, username: guest.username },
    articles: [],
    likes: [],
    favorites: [],
    comments: [],
  };
}

async function readState() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    const init = createInitialData();
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(init, null, 2), "utf8");
    return init;
  }
}

async function writeState(nextState) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(nextState, null, 2), "utf8");
}

app.get("/api/health", (_, res) => {
  res.json({ ok: true, service: "poetry-api", time: nowISO() });
});

app.get("/api/current-user", async (_, res) => {
  const state = await readState();
  res.json(state.currentUser || { id: "u_guest", username: "游客" });
});

app.post("/api/logout", async (_, res) => {
  const state = await readState();
  state.currentUser = { id: "u_guest", username: "游客" };
  await writeState(state);
  res.json({ success: true });
});

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "用户名和密码不能为空" });
  }

  const state = await readState();
  if (state.users.some((u) => u.username === username)) {
    return res.status(409).json({ success: false, message: "用户名已存在" });
  }

  const user = { id: uid("u"), username, password, createdAt: nowISO() };
  state.users.push(user);
  await writeState(state);
  return res.json({ success: true, user: { id: user.id, username: user.username } });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body || {};
  const state = await readState();
  const user = state.users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: "用户名或密码错误" });
  }
  state.currentUser = { id: user.id, username: user.username };
  await writeState(state);
  return res.json({ success: true, user: { id: user.id, username: user.username } });
});

app.post("/api/articles", async (req, res) => {
  const state = await readState();
  const article = req.body || {};
  const payload = {
    ...article,
    id: article.id || uid("a"),
    createdAt: article.createdAt || nowISO(),
    updatedAt: nowISO(),
    published: !!article.published,
  };
  state.articles.unshift(payload);
  await writeState(state);
  res.json({ success: true, data: withStats(state, payload) });
});

app.patch("/api/articles/:articleId", async (req, res) => {
  const state = await readState();
  const idx = state.articles.findIndex((a) => a.id === req.params.articleId);
  if (idx < 0) return res.status(404).json({ success: false, message: "文章不存在" });
  state.articles[idx] = { ...state.articles[idx], ...(req.body || {}), updatedAt: nowISO() };
  await writeState(state);
  res.json({ success: true, data: withStats(state, state.articles[idx]) });
});

app.delete("/api/articles/:articleId", async (req, res) => {
  const { articleId } = req.params;
  const state = await readState();
  state.articles = state.articles.filter((a) => a.id !== articleId);
  state.likes = state.likes.filter((x) => x.articleId !== articleId);
  state.favorites = state.favorites.filter((x) => x.articleId !== articleId);
  state.comments = state.comments.filter((x) => x.articleId !== articleId);
  await writeState(state);
  res.json({ success: true });
});

app.get("/api/articles/:articleId", async (req, res) => {
  const state = await readState();
  const article = state.articles.find((a) => a.id === req.params.articleId);
  if (!article) return res.status(404).json(null);
  res.json(withStats(state, article));
});

app.get("/api/articles", async (req, res) => {
  const state = await readState();
  const publishedOnly = req.query.publishedOnly === "1" || req.query.publishedOnly === "true";
  const userId = req.query.userId;
  let list = [...state.articles];
  if (publishedOnly) list = list.filter((a) => !!a.published);
  if (userId) list = list.filter((a) => a.userId === userId);
  res.json(list.map((a) => withStats(state, a)));
});

app.post("/api/articles/:articleId/like", async (req, res) => {
  const state = await readState();
  const user = state.currentUser || { id: "u_guest", username: "游客" };
  const articleId = req.params.articleId;
  const i = state.likes.findIndex((x) => x.articleId === articleId && x.userId === user.id);
  if (i >= 0) state.likes.splice(i, 1);
  else state.likes.push({ articleId, userId: user.id, createdAt: nowISO() });
  await writeState(state);
  res.json({ success: true });
});

app.post("/api/articles/:articleId/favorite", async (req, res) => {
  const state = await readState();
  const user = state.currentUser || { id: "u_guest", username: "游客" };
  const articleId = req.params.articleId;
  const i = state.favorites.findIndex((x) => x.articleId === articleId && x.userId === user.id);
  if (i >= 0) state.favorites.splice(i, 1);
  else state.favorites.push({ articleId, userId: user.id, createdAt: nowISO() });
  await writeState(state);
  res.json({ success: true });
});

app.get("/api/articles/:articleId/favorited", async (req, res) => {
  const state = await readState();
  const user = state.currentUser || { id: "u_guest", username: "游客" };
  const isFavorited = state.favorites.some((x) => x.articleId === req.params.articleId && x.userId === user.id);
  res.json({ favorited: isFavorited });
});

app.get("/api/articles/:articleId/comments", async (req, res) => {
  const state = await readState();
  const comments = state.comments
    .filter((c) => c.articleId === req.params.articleId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json(comments);
});

app.post("/api/articles/:articleId/comments", async (req, res) => {
  const state = await readState();
  const user = state.currentUser || { id: "u_guest", username: "游客" };
  const content = ((req.body || {}).content || "").trim();
  if (!content) return res.status(400).json({ success: false, message: "评论不能为空" });
  state.comments.push({
    id: uid("c"),
    articleId: req.params.articleId,
    userId: user.id,
    username: user.username,
    content,
    createdAt: nowISO(),
  });
  await writeState(state);
  res.json({ success: true });
});

app.get("/api/favorites/articles", async (_, res) => {
  const state = await readState();
  const user = state.currentUser || { id: "u_guest", username: "游客" };
  const favIds = state.favorites.filter((x) => x.userId === user.id).map((x) => x.articleId);
  const list = state.articles.filter((a) => favIds.includes(a.id)).map((a) => withStats(state, a));
  res.json(list);
});

app.listen(PORT, () => {
  console.log(`[poetry-api] listening on http://127.0.0.1:${PORT}`);
});
