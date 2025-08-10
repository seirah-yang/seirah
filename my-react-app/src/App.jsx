// src/App.jsx
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CalendarMini from "./components/CalendarMini";
import EventList from "./components/EventList";
import Calculator from "./components/Calculator";
import ToDoBoard from "./components/ToDoBoard";
import "./App.css";

export default function App() {
  const [events, setEvents] = useState([]);

  // 로컬스토리지에서 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("events");
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, []);

  // 로컬스토리지에 저장
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const addEvent = (event) => {
    setEvents([...events, event]);
  };

  const updateEvent = (index, updated) => {
    const newEvents = [...events];
    newEvents[index] = updated;
    setEvents(newEvents);
  };

  const deleteEvent = (index) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  return (
    <div className="homepage">
      {/* 상단 네비게이션 + X-pace 애니메이션 제목 */}
      <Navbar />

      <div id="logo">
        <h1 className="xpace-title">X-pace</h1>
      </div>
      <div className="left-column">
        <CalendarMini />
        <EventList events={events} onAdd={addEvent} onUpdate={updateEvent} onDelete={deleteEvent} />
        <Calculator />
      </div>
      <div className="container content-grid">
        
        {/* 오른쪽 메인 */}
        <div style={{ flex: 1 }}>
          <ToDoBoard />
        </div>
      </div>
    </div>
  );
}