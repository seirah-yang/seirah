// app.js
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('✅ Hello, Express server is working!');
});

app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:3000`);
});

app.get('/gallery', (req, res) => {
    res.send ('
        <h1> 갤러리페이지</h1>
        <div>
        <img src="https://placekittem.com/200/300" alt="ketten1" />
        <img src="https://placekitten.com/250/300" alt="kitten2" />
        </div>
        <a href="/">홈으로</a>
    );
});

app.get('/profile', (req, res) => {
    res.send ('
        <h1> 프로필페이지</h1>
        <p>소라의 페이지</p>
        <img src="https://placekittem.com/200/300" alt="ketten1" />
        <img src="https://placekitten.com/250/300" alt="kitten2" />
        </div>
        <a href="/">홈으로</a>
    );
});