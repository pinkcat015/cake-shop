const express = require('express');
const app = express();
const db = require('./config/db');

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
    res.send('Hello Cake Shop');
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});