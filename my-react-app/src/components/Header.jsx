import React from "react";

export default function Header() {
  return (
    <>
      <nav className="navbar">
        <a href="#home">HOME</a>
        <a href="#profile">PROFILE</a>
        <a href="#bootcamp">BootCamp</a>
        <a href="#share">실습과제 공유</a>
        <a href="#notion">[공유]NOTION사용</a>
      </nav>
      <h1 className="title">X-pace</h1>
    </>
  );
}