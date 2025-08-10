import React, { useEffect, useMemo, useState } from "react";
import "./ToDoBoard.css";

/** 월 키: 2025-08 형태 */
const monthKeyOf = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};
const STORAGE_PREFIX = "todoboard_v1_";

/** 기본 템플릿 */
const defaultData = () => ({
  title: "", // 선택 월 타이틀(예: "8월 [To Do List]")
  todos: [
    // { id, text, done }
  ],
  references: [
    // { id, type:"link"|"file"|"note"|"doc", text, url? }
  ],
  checklist: [
    // { id, text, done }
  ],
  memo: "", // 자유 메모
});

export default function ToDoBoard() {
  // 선택된 월 (month input과 동기)
  const [monthKey, setMonthKey] = useState(() => monthKeyOf(new Date()));
  const [data, setData] = useState(defaultData());

  // 선택 월 읽기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + monthKey);
      if (raw) setData(JSON.parse(raw));
      else setData(defaultData());
    } catch {
      setData(defaultData());
    }
  }, [monthKey]);

  // 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + monthKey, JSON.stringify(data));
    } catch {}
  }, [data, monthKey]);

  // ====== 파생 ======
  const prettyMonthTitle = useMemo(() => {
    const [m] = monthKey.split("-").map(Number);
    return `${m}월 [To Do List]`;
  }, [monthKey]);

  // ====== 조작 함수 ======
  const newId = () => crypto.randomUUID();

  // todos
  const addTodo = (text) => {
    if (!text.trim()) return;
    setData((d) => ({ ...d, todos: [...d.todos, { id: newId(), text: text.trim(), done: false }] }));
  };
  const toggleTodo = (id) => {
    setData((d) => ({ ...d, todos: d.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  };
  const editTodo = (id, text) => {
    setData((d) => ({ ...d, todos: d.todos.map(t => t.id === id ? { ...t, text } : t) }));
  };
  const removeTodo = (id) => {
    setData((d) => ({ ...d, todos: d.todos.filter(t => t.id !== id) }));
  };

  // references
  const addRef = (ref) => {
    setData((d) => ({ ...d, references: [...d.references, { id: newId(), ...ref }] }));
  };
  const removeRef = (id) => {
    setData((d) => ({ ...d, references: d.references.filter(r => r.id !== id) }));
  };

  // checklist
  const addCheck = (text) => {
    if (!text.trim()) return;
    setData((d) => ({ ...d, checklist: [...d.checklist, { id: newId(), text: text.trim(), done: false }] }));
  };
  const toggleCheck = (id) => {
    setData((d) => ({ ...d, checklist: d.checklist.map(c => c.id === id ? { ...c, done: !c.done } : c) }));
  };
  const removeCheck = (id) => {
    setData((d) => ({ ...d, checklist: d.checklist.filter(c => c.id !== id) }));
  };

  // memo
  const updateMemo = (v) => setData((d) => ({ ...d, memo: v }));

  // 월 이동
  const goPrevMonth = () => {
    const [y, m] = monthKey.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setMonthKey(monthKeyOf(d));
  };
  const goNextMonth = () => {
    const [y, m] = monthKey.split("-").map(Number);
    const d = new Date(y, m, 1);
    setMonthKey(monthKeyOf(d));
  };

  // ====== 간단 입력 핸들러 ======
  const [todoInput, setTodoInput] = useState("");
  const [refText, setRefText] = useState("");
  const [refType, setRefType] = useState("link");
  const [refUrl, setRefUrl] = useState("");
  const [checkInput, setCheckInput] = useState("");

  return (
    <div className="todo-board">
      {/* 헤더: 월 선택 */}
      <div className="board-header">
        <button className="month-nav" onClick={goPrevMonth}>◀</button>
        <input
          className="month-input"
          type="month"
          value={monthKey}
          onChange={(e) => setMonthKey(e.target.value)}
        />
        <button className="month-nav" onClick={goNextMonth}>▶</button>
      </div>

      {/* 상단 2열: ToDo + 참고 자료 */}
      <div className="board-grid">
        {/* To Do List */}
        <section className="card">
          <h3>{data.title || prettyMonthTitle}</h3>

          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              addTodo(todoInput);
              setTodoInput("");
            }}
          >
            <input
              placeholder="할 일을 입력하고 Enter"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
            />
            <button type="submit">추가</button>
          </form>

          <ul className="list">
            {data.todos.map((item) => (
              <li key={item.id} className="list-item">
                <label className="checkbox-row">
                  <input type="checkbox" checked={item.done} onChange={() => toggleTodo(item.id)} />
                  <span className={item.done ? "done" : ""}>{item.text}</span>
                </label>
                <div className="item-actions">
                  <button
                    onClick={() => {
                      const t = prompt("내용 수정", item.text);
                      if (t !== null) editTodo(item.id, t);
                    }}
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button onClick={() => removeTodo(item.id)} title="삭제">🗑️</button>
                </div>
              </li>
            ))}
            {data.todos.length === 0 && <li className="empty">항목이 없습니다.</li>}
          </ul>
        </section>

        {/* 참고 자료 */}
        <section className="card">
          <h3>참고 자료</h3>

          <form
            className="inline-form refs"
            onSubmit={(e) => {
              e.preventDefault();
              if (!refText.trim()) return;
              if (refType === "link") addRef({ type: "link", text: refText.trim(), url: refUrl.trim() || "#" });
              else addRef({ type: refType, text: refText.trim() });
              setRefText(""); setRefUrl("");
            }}
          >
            <select value={refType} onChange={(e)=>setRefType(e.target.value)}>
              <option value="link">링크</option>
              <option value="file">파일</option>
              <option value="doc">문서</option>
              <option value="note">노트</option>
            </select>
            <input
              placeholder="제목"
              value={refText}
              onChange={(e)=>setRefText(e.target.value)}
            />
            {refType === "link" && (
              <input
                placeholder="URL (https://...)"
                value={refUrl}
                onChange={(e)=>setRefUrl(e.target.value)}
              />
            )}
            <button type="submit">+</button>
          </form>

          <ul className="list refs-list">
            {data.references.map((ref) => (
              <li key={ref.id} className="list-item">
                {ref.type === "link" ? (
                  <a href={ref.url || "#"} target="_blank" rel="noreferrer">🔗 {ref.text}</a>
                ) : (
                  <span>
                    {ref.type === "file" && "📄 "}
                    {ref.type === "doc" && "🗂️ "}
                    {ref.type === "note" && "📝 "}
                    {ref.text}
                  </span>
                )}
                <div className="item-actions">
                  <button onClick={() => removeRef(ref.id)} title="삭제">🗑️</button>
                </div>
              </li>
            ))}
            {data.references.length === 0 && <li className="empty">항목이 없습니다.</li>}
          </ul>
        </section>
      </div>

      {/* 하단 2열: 체크리스트 + 메모 */}
      <div className="board-grid">
        {/* 체크리스트 */}
        <section className="card">
          <h3>체크리스트</h3>

          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              addCheck(checkInput);
              setCheckInput("");
            }}
          >
            <input
              placeholder="체크 항목 입력 후 Enter"
              value={checkInput}
              onChange={(e) => setCheckInput(e.target.value)}
            />
            <button type="submit">추가</button>
          </form>

          <ul className="list">
            {data.checklist.map((item) => (
              <li key={item.id} className="list-item">
                <label className="checkbox-row">
                  <input type="checkbox" checked={item.done} onChange={() => toggleCheck(item.id)} />
                  <span className={item.done ? "done" : ""}>{item.text}</span>
                </label>
                <div className="item-actions">
                  <button onClick={() => removeCheck(item.id)} title="삭제">🗑️</button>
                </div>
              </li>
            ))}
            {data.checklist.length === 0 && <li className="empty">항목이 없습니다.</li>}
          </ul>
        </section>

        {/* 메모 */}
        <section className="card">
          <h3>참고용 메모</h3>
          <textarea
            className="memo"
            rows={8}
            placeholder={`예)\n- VS Code 사용 시 주의 사항\n- conda activate 나의 서버 연결`}
            value={data.memo}
            onChange={(e)=>updateMemo(e.target.value)}
          />
        </section>
      </div>
    </div>
  );
}