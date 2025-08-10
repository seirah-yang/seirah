import React, { useEffect, useState } from "react";

export default function EventModal({ open, initial, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState(""); // HTML datetime-local 값
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title || "");
      // ISO → datetime-local (‘YYYY-MM-DDTHH:MM’)
      const d = new Date(initial.dateTime);
      const iso = isNaN(d) ? "" :
        `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}T${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
      setDateTime(iso);
      setLocation(initial.location || "");
      setNote(initial.note || "");
    } else {
      setTitle(""); setDateTime(""); setLocation(""); setNote("");
    }
  }, [open, initial]);

  const submit = (e) => {
    e?.preventDefault();
    if (!title.trim() || !dateTime) return;
    const iso = new Date(dateTime).toISOString();
    onSubmit({
      title: title.trim(),
      dateTime: iso,
      location: location.trim(),
      note: note.trim()
    });
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>{initial ? "이벤트 수정" : "이벤트 추가"}</h3>
        </header>

        <form className="modal-body" onSubmit={submit}>
          <label className="modal-field">
            <span>제목</span>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} required />
          </label>
          <label className="modal-field">
            <span>일시</span>
            <input type="datetime-local" value={dateTime} onChange={(e)=>setDateTime(e.target.value)} required />
          </label>
          <label className="modal-field">
            <span>장소</span>
            <input value={location} onChange={(e)=>setLocation(e.target.value)} />
          </label>
          <label className="modal-field">
            <span>메모</span>
            <textarea rows={3} value={note} onChange={(e)=>setNote(e.target.value)} />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>취소</button>
            <button type="submit" className="btn-primary">{initial ? "수정" : "추가"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}