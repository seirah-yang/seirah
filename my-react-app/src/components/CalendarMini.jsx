import React, { useMemo } from "react";

export default function CalendarMini() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0~11

  const { title, grid } = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const firstWeekday = first.getDay(); // 0(일)~6(토)
    const daysInMonth = last.getDate();

    const cells = [];
    // 앞 공백
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    // 날짜 채우기
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // 7x6 맞추기
    while (cells.length < 42) cells.push(null);

    const title = `${year}.${String(month + 1).padStart(2, "0")}`;
    return { title, grid: cells };
  }, [year, month]);

  const today = now.getDate();

  return (
    <section className="calendar-mini">
      <header className="calendar-mini__header">
        <span className="calendar-mini__icon">🗓</span>
        <h3 className="calendar-mini__title">{title}</h3>
      </header>

      <div className="calendar-mini__weekdays">
        {["일","월","화","수","목","금","토"].map((w) => (
          <div key={w} className="calendar-mini__weekday">{w}</div>
        ))}
      </div>

      <div className="calendar-mini__grid">
        {grid.map((d, idx) => {
          const isToday = d === today;
          return (
            <div
              key={idx}
              className={"calendar-mini__cell" + (isToday ? " is-today" : "")}
            >
              {d ?? ""}
            </div>
          );
        })}
      </div>
    </section>
  );
}