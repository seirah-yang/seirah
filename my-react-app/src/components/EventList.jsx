import React, { useMemo, useState } from "react";
import EventModal from "./EventModal";

export default function EventList({ events = [], onAdd, onEdit, onDelete, logs = [] }) {
  const sorted = useMemo(
    () => [...events].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)),
    [events]
  );
  const fmt = (iso) => {
    const d = new Date(iso); if (isNaN(d)) return "날짜 오류";
    const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
    const hh=String(d.getHours()).padStart(2,"0"), mm=String(d.getMinutes()).padStart(2,"0");
    return `${y}.${m}.${day} ${hh}:${mm}`;
  };

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showLog, setShowLog] = useState(false);

  const handleAdd = () => { setEditing(null); setOpen(true); };
  const handleEdit = (item) => { setEditing(item); setOpen(true); };

  return (
    <>
      <section className="eventlist-mini">
        <header className="eventlist-mini__header">
          <h3 className="eventlist-mini__title">이벤트 목록</h3>
          <button className="eventlist-mini__add" onClick={handleAdd} aria-label="이벤트 추가">＋</button>
        </header>

        <div className="eventlist-mini__body">
          {sorted.length === 0 ? (
            <div className="eventlist-mini__empty">등록된 이벤트가 없습니다.</div>
          ) : (
            <ul className="eventlist-mini__ul">
              {sorted.map(ev => (
                <li key={ev.id} className="eventlist-mini__item">
                  <div className="eventlist-mini__row1">{fmt(ev.dateTime)}</div>
                  <div className="eventlist-mini__row2">{ev.title}</div>
                  <div className="eventlist-mini__actions">
                    <button onClick={() => handleEdit(ev)} title="수정">✏️</button>
                    <button onClick={() => onDelete(ev.id)} title="삭제">🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="eventlist-mini__footer">
          <button className="log-toggle" onClick={()=>setShowLog(v=>!v)}>
            활동 로그 {showLog ? "▲" : "▼"}
          </button>
        </footer>
      </section>

      {showLog && (
        <section className="log-mini">
          <div className="log-mini__body">
            {logs.length === 0 ? (
              <div className="log-empty">로그가 없습니다.</div>
            ) : (
              <ul className="log-ul">
                {logs.slice().reverse().map((l, i) => (
                  <li key={i}>
                    <span className={`log-badge log-${l.type}`}>{l.type}</span>{" "}
                    {l.title} <small>({new Date(l.at).toLocaleString()})</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* 모달 */}
      <EventModal
        open={open}
        initial={editing}
        onClose={()=>setOpen(false)}
        onSubmit={(payload)=>{
          if (editing) onEdit(editing.id, payload);
          else onAdd(payload);
          setOpen(false);
        }}
      />
    </>
  );
}