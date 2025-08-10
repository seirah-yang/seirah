import React from "react";
import "./Navbar.css"; // 스타일 따로 관리

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="menu">
        <li><a href="/">HOME</a></li>
        <li><button type="button">PROFILE</button>
          <ul className="submenu">
            <li><a href="/History.html">경력/교육내역</a></li>
            <li><a href="/project.html">프로젝트</a></li>
          </ul>
        </li>
        <li><button type="button">BootCamp</button>
          <ul className="submenu">
            <li><a href="https://www.notion.so/Boot-page-222d44a085da80e9b838cac3e7291740?source=copy_link#225d44a085da80eebab9ec44ce023ed4" target="_blank" rel="noreferrer">이론수업 정리</a></li>
            <li><a href="https://www.notion.so/222d44a085da8099aeb5c444958f16c3?v=222d44a085da81198f1e000c0a15766d&source=copy_link" target="_blank" rel="noreferrer">Code/Colab 정리</a></li>
          </ul>
        </li>
        <li><button type="button">실습과제 공유</button>
          <ul className="submenu">
            <li><a href="https://cafe.naver.com/f-e/cafes/31531408/menus/4?viewType=L" target="_blank" rel="noreferrer">노트정리공유</a></li>
            <li><a href="/todolist.html">To Do List</a></li>
            <li><a href="/game_page.html">짝맞추기 게임</a></li>
            <li><a href="/burgerhouse.html">햄버거하우스</a></li>
          </ul>
        </li>
        <li><button type="button">[공유]NOTION사용</button>
          <ul className="submenu">
            <li><a href="/notion.html">Notion사용</a></li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;