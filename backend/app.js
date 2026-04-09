const express = require('express');
const app = express();
const db = require('./config/db');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello Cake Shop');
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});