const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const db = require('./config/db');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));

app.get('/', (req, res) => {
    res.send('Hello Cake Shop');
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});