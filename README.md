# 할 일 & 습관 Tracker HabiDo 
![HabiDo]Ohttps://github.com/seirah-yang/seirah/blob/habido/habido_logo.png)
	홈페이지에 보이는 HabiDo 로고는 습관을 뜻하는 Habit의 H에 트래킹 할 때 완료하면 체크하라는 의미의 ✔️표시를 더해 만들었습니다. 
    본 서비스는 할 일 또는 일정 목록을 관리하고 습관화 하고자 하는 일을 트랰킹 하는 웹 애플리케이션 입니다. 
    사용자는 할일을 등록, 수정, 삭제할 수 있으며, 목록을 생성한 후 세부 속성을 추가하여 진행 상태를 관리 할 수 있습니다. 
 
## 개요 
  1. 할일 목록 관리와 습관 트래킹 기능이 포함된 웹 서비스
  2. 할 일 또는 매일 해야할 일 목록을 등록, 수정, 삭제하고 진행상태(완료여부, 일정 변경 등)을 관리
  3. 달력으로 일정을 확인하며 시각적으로 관리


## 주요 기능
    • 할 일 등록 / 수정 / 삭제 (AJAX 기반 삭제기능 지원)
    • 체크박스로 완료 여부 표시
    • 속성에서 반복적으로 수행하는 요일 표시
    • 태그, 마감일, 메모, 진행기간 관리
    • Tracking 속성:
      - 진행 상태(완료, 진행중, 일정변경, 기타 등)
      - 속성별 메모 입력 및 요일과 진행기간 입력 가능
      - 항목별 내용 변경사항 저장 및 삭제 가능 
    • 리스트 UI: 선택/체크박스 + 태그 + 날짜 
    • 반응형 레이아웃 및 애니메이션을 적용하여 삭제 시 자연스럽게 사라지게 함


## 기술 스택
	• Frontend: EJS, CSS (flexbox 레이아웃, 애니메이션)
	• Backend: Node.js, Express.js
	• Database: MongoDB 
	• 기타: Fetch API (AJAX 비동기 처리), RESTful API구조 

  ## 주요 API 라우트 
    • 목록: GET /todo/list → todoList.ejs
    • 입력폼: GET /todo/input → todoInput.ejs
    • 상세: GET /todo/detail?_id=... → todoDetail.ejs
    • 트래킹 항목:
      - 추가 POST /todo/props/add
      - 수정 POST /todo/props/update
      - 삭제 POST /todo/props/delete
    • 완료 토글: POST /todo/toggle
    • 할 일 목록 삭제: POST /todo/delete
    • 달력: GET /calendar

## 파일 구조
      HabiDo_Application/
      ├── app.js
      ├── package.json
      ├── .env
      ├── .gitignore
      ├── public/
      │   ├── styles.css
      │   └── images/
      │       └── logo.PNG
      └── views/
          └── partials/
          │    ├── _head.ejs
          │    ├── _header.ejs
          │    └── _footer.ejs
          ├── home.ejs
          ├── calendar.ejs
          ├── todoInput.ejs
          ├── todoList.ejs
          └── todoDetail.ejs
    ---------------------

## 설치 & 실행 방법
    1) 저장소 클론
      |bash|
      |git clone https://github.com/seirah-yang/HbiDo.git
      |cd todo-tracker-app
    2) 패키지 설치 
      |npm install
    3) 환경변수 설정
      : 프로젝트 루트에 .env 파일생성 
      |.env
      |MONGO_URI=mongodb://localhost:27017/tododb
      |PORT=3030
    4) 서버 실행 
      |bash 
      |npm start
 ---------------------

## 페이지 리뷰 
• 홈 뷰 : 
![home](https://github.com/seirah-yang/seirah/blob/habido/wepages/home.png)

- 메인 페이지에는 사용자를 동기부여할 수 있는 문구와 함께, 할 일 목록 및 습관 트래킹을 시작할 수 있는 버튼을 배치했습니다.
- 지난달의 목록 설정 현황과 완료 현황은 스테이지 바를 통해 시각적으로 확인할 수 있도록 구성했습니다.
- ‘목록을 기록하고 관리하면 약 66일째부터 추진력이 붙고, 100일 이후 습관이 형성된다’는 근거를 반영하여, 스테이지 바에 66일과 100일 지점을 표시하고 100일 단위의 진행 단계를 제공했습니다. 
- Iframe을 통해 작은달력을 제공하여 월 별 일정을 확인하고, 월간 이동이 가능한 네비게이션 버튼을 부착했습니다. 


• 달력 :
![calendar](https://github.com/seirah-yang/seirah/blob/habido/wepages/calendar.png)

- 메인 페이지와 동일한 달력을 큰 화면에서 볼 수 있으며, 월별·일별 일정이 시각화됩니다. 
- 일정은 점(dot)으로 구분되며, 회색은 진행 중 또는 미완료, 초록색은 완료를 의미합니다.
- 일정 목록을 선택하면 일정 세부내역으로 이동하여 속성관리가 가능합니다. 


• 할 일 추가:
![todoInput](https://github.com/seirah-yang/seirah/blob/habido/wepages/todoInput.png)

- 할 일 추가 페이지에서 제목과 내용을 입력해 새 항목을 만들 수 있습니다.
- 태그와 마감일은 선택 사항이며, 마감일을 입력하면 달력에 표시됩니다.

  
• 할 일 목록
![todoList](https://github.com/seirah-yang/seirah/blob/habido/wepages/todoList.png)

- 추가된 목록을 확인할 수 있으며, 키워드와 태그로 검색 가능합니다. 
- 생성한 목록은 속성 관리 및 삭제가 가능합니다.


• 속성관리: 기간선정
![속성:기간설정](https://github.com/seirah-yang/seirah/blob/habido/wepages/todoDetail1.png)

- 속성 관리 페이지에서는 할 일이나 습관 트래킹의 기간을 설정할 수 있습니다. 
- 속성은 ‘1주차’, ‘2주차’, ‘1회성’, 특정 날짜 등 자유롭게 기재할 수 있으며, 진행 상태나 세부 속성은 드롭다운에서 선택하거나 ‘기타’를 선택해 직접 입력할 수 있습니다. 
- 기간은 자유롭게 설정 가능합니다.


• 속성관리: 요일 트래킹
![속성:요일트래킹](https://github.com/seirah-yang/seirah/blob/habido/wepages/todoDetai2.png)

- 속성을 추가하면 요일 목록이 생성되며, 해당 목록을 통해 요일별 수행 내역을 트래킹할 수 있습니다. 
- 이는 습관 관리에 유용하며, 개인 목적에 맞게 활용할 수 있습니다. 
- 예를 들어 운동은 월·수·금 완료 여부를 기록해 월 단위로 관리할 수 있습니다.

 ---------------------
 
## 👩‍💻 제작자
	• 양소라 (@Yang Sora)
	  : 디자인 기획, 프론트엔드, 백엔드, 데이터 설계

## 참고문헌
Singh, B., Bishop, D. T., Thirlaway, K., & Glover, E. I. (2022). How long does it take to form a habit? A systematic review and meta-analysis of the evidence. Health Psychology Review, 16(4), 527–548. https://doi.org/10.1080/17437199.2021.1942063
