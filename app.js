import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== 환경설정 ======
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "local";
const PORT = Number(process.env.PORT || 3000);

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: true },
});

const app = express();
const server = http.createServer(app);

// ====== 앱 공용 ======
app.locals.db = null;
app.locals.todos = null;

// ====== 유틸리티 함수 ======
function toYMD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ====== 뷰/정적 설정 ======
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.locals.active = '';
  next();
});

// ====== 라우트 ======

// 홈
app.get(["/", "/home"], (req, res) => res.render("home", { active: 'home' }));

// 목록
app.get("/todo/list", async (req, res) => {
  try {
    const q = req.query.query?.trim();
    const tag = req.query.tag?.trim();
    const onlyOpen = req.query.onlyOpen === "1";

    const filter = {};
    if (q) filter.title = { $regex: q, $options: "i" };
    if (tag) filter.tags = tag;
    if (onlyOpen) filter.done = { $ne: true };

    const list = await req.app.locals.todos
      .find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .toArray();

    res.render("todoList", { todoList: list, q, tag, onlyOpen, toYMD, active: 'list' });
  }
  catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

// 입력 폼
app.get("/todo/input", (req, res) => res.render("todoInput", { active: 'input' }));

// 입력 저장 (+ Tracking props 조립)
app.post("/todo/input", async (req, res) => {
  try {
    const title = (req.body.title || "").trim();
    if (!title) return res.status(400).send("title is required");

    const done = ["true", "on", "1", true].includes(req.body.done);
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    const tags = (req.body.tags || "").split(",").map(s => s.trim()).filter(Boolean);
    const memo = (req.body.memo || "").trim();

    const names  = [].concat(req.body["prop_name[]"]   || req.body.prop_name   || []);
    const status = [].concat(req.body["prop_status[]"] || req.body.prop_status || []);
    const dates  = [].concat(req.body["prop_date[]"]   || req.body.prop_date   || []);
    const notes  = [].concat(req.body["prop_note[]"]   || req.body.prop_note   || []);

    const len = Math.min(names.length, status.length, dates.length, notes.length);
    const props = [];
    for (let i = 0; i < len; i++) {
      const nm = String(names[i] || "").trim();
      if (!nm) continue;
      props.push({
        _id: new ObjectId(),
        name: nm,
        done: false,
        status: String(status[i] || "진행중").trim(),
        note: String(notes[i] || ""),
        type: "status",
        value: "",
        date: dates[i] ? new Date(dates[i]) : null
      });
    }

    await req.app.locals.todos.insertOne({
      title, done, dueDate, tags, memo,
      props, createdAt: new Date(), updatedAt: new Date(),
    });
    res.redirect("/todo/list");
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

// 상세
app.get("/todo/detail", async (req, res) => {
  try {
    const id = req.query._id;
    if (!id) return res.status(400).send("Missing _id");
    const todo = await req.app.locals.todos.findOne({ _id: new ObjectId(id) });
    if (!todo) return res.status(404).send("Not found");
    res.render("todoDetail", { todo, toYMD });
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

// 개별 prop 추가/수정/삭제 (기존 유지)
app.post("/todo/props/add", async (req, res) => {
  try {
    const { _id } = req.body;
    let { name = "", status = "진행중", note = "" } = req.body;
    if (!_id || !name.trim()) return res.status(400).json({ error: "Missing _id or name" });

    const prop = {
      _id: new ObjectId(),
      name: String(name).trim(),
      done: false,
      status: String(status).trim(),
      note: String(note || ""),
      type: "status",
      value: ""
    };

    await req.app.locals.todos.updateOne(
      { _id: new ObjectId(_id) },
      { $push: { props: prop }, $set: { updatedAt: new Date() } }
    );

    if (req.headers["content-type"]?.includes("application/json")) {
      return res.json({ ok: true, propId: prop._id.toString() });
    }
    res.redirect("/todo/detail?_id=" + _id);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/todo/props/update", async (req, res) => {
  try {
    const { _id, propId } = req.body;
    if (!_id || !propId) return res.status(400).json({ error: "Missing _id or propId" });

    const set = { updatedAt: new Date() };
    if (typeof req.body.done !== "undefined") set["props.$.done"] = !!req.body.done;
    if (typeof req.body.status !== "undefined") set["props.$.status"] = String(req.body.status);
    if (typeof req.body.note !== "undefined") set["props.$.note"] = String(req.body.note);

    const r = await req.app.locals.todos.updateOne(
      { _id: new ObjectId(_id), "props._id": new ObjectId(propId) },
      { $set: set }
    );
    if (r.modifiedCount === 0) return res.status(404).json({ error: "Not found or no changes" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/todo/props/delete", async (req, res) => {
  try {
    const { _id, propId } = req.body;
    if (!_id || !propId) return res.status(400).json({ error: "Missing _id or propId" });

    const r = await req.app.locals.todos.updateOne(
      { _id: new ObjectId(_id) },
      { $pull: { props: { _id: new ObjectId(propId) } }, $set: { updatedAt: new Date() } }
    );

    if (r.modifiedCount === 0) {
      const doc = await req.app.locals.todos.findOne(
        { _id: new ObjectId(_id) },
        { projection: { "props._id": 1, "props.name": 1 } }
      );
      return res.status(404).json({ error: "prop not found", existing: doc?.props || [] });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// todo 수정 저장
app.post("/todo/save", async (req, res) => {
  try {
    const id = req.body._id;
    if (!id) return res.status(400).json({ error: "Missing _id" });

    const patch = {
      title: (req.body.title || "").trim(),
      memo: (req.body.memo || "").trim(),
      tags: (req.body.tags || "").split(",").map(s => s.trim()).filter(Boolean),
      done: ["true", "on", "1", true].includes(req.body.done),
      updatedAt: new Date(),
    };
    if (req.body.dueDate) patch.dueDate = new Date(req.body.dueDate);

    await req.app.locals.todos.updateOne({ _id: new ObjectId(id) }, { $set: patch });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ done 토글
app.post("/todo/toggle", async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) return res.status(400).json({ error: "Missing _id" });

    const done = ["true","1","on",true,"on"].includes(req.body.done) ? true : false;
    const r = await req.app.locals.todos.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { done, updatedAt: new Date() } }
    );
    if (r.matchedCount === 0) return res.status(404).json({ error: "Not found" });

    const wantsJson = req.headers["accept"]?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest";
    if (wantsJson) return res.json({ ok: true, done });
    res.redirect("/todo/list");
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ 삭제 (AJAX/일반 겸용)
app.post("/todo/delete", async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) return res.status(400).json({ error: "Missing _id" });

    const r = await req.app.locals.todos.deleteOne({ _id: new ObjectId(_id) });
    const wantsJson = req.headers["accept"]?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest";

    if (r.deletedCount === 0) {
      return wantsJson ? res.status(404).json({ error: "Todo not found" }) : res.status(404).send("Todo not found");
    }
    if (wantsJson) return res.json({ ok: true, deletedId: _id });
    res.redirect("/todo/list");
  } catch (e) {
    console.error(e);
    const wantsJson = req.headers["accept"]?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest";
    return wantsJson ? res.status(500).json({ error: "Internal Server Error" }) : res.status(500).send("Internal Server Error");
  }
});

// 달력
app.get("/calendar", async (req, res) => {
  const y = Number(req.query.year) || new Date().getFullYear();
  const m = Number(req.query.month) || (new Date().getMonth() + 1);

  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);

  const todos = await req.app.locals.todos.find({
    dueDate: { $gte: first, $lte: new Date(y, m - 1, last.getDate(), 23, 59, 59, 999) },
  }).toArray();

  const map = {};
  for (const t of todos) {
    if (!t.dueDate) continue;
    const k = toYMD(new Date(t.dueDate));
    (map[k] ||= []).push(t);
  }
  res.render("calendar", { year: y, month: m, first, last, map, toYMD, compact: req.query.compact === "1", active: 'cal' });
});

// 차트 페이지
app.get("/monthly/chart", (req, res) => {
    res.render("chart", { active: 'chart' });
});

// 월별 데이터 집계 API
app.get('/api/chart/monthly-completion', async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    const monthlyData = await req.app.locals.todos.aggregate([
      {
        $match: {
          done: true,
          dueDate: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$dueDate' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]).toArray();

    const result = Array(12).fill(0);
    monthlyData.forEach((item) => {
      result[item._id - 1] = item.count;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '데이터를 가져오는 데 실패했습니다.' });
  }
});

// ====== 서버 부팅 ======
(async () => {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    app.locals.db = client.db(dbName);
    app.locals.todos = app.locals.db.collection("todolist");
    console.log("✅ MongoDB connected – DB:", dbName);

    server.listen(PORT, () => console.log(`✅ Server: http://localhost:${PORT}`));
  } catch (e) {
    console.error("❌ DB 연결 실패:", e);
    process.exit(1);
  }
})();

process.on("SIGINT", async () => { await client.close(); process.exit(0); });
process.on("SIGTERM", async () => { await client.close(); process.exit(0); });