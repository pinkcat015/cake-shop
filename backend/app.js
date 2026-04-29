const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const db = require('./config/db');
const storeModel = require('./models/storeModel');

app.use(cors());
app.use(express.json());
// Simple request logger for debugging
app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.originalUrl);
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/stores', require('./routes/stores'));

app.get('/api/stores', async (req, res) => {
    try {
        const stores = await storeModel.getAllStores();
        res.json({ stores });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/stores/nearest', async (req, res) => {
    try {
        const { lat, lng, limit = 3 } = req.query;
        const parsedLat = Number(lat);
        const parsedLng = Number(lng);
        const parsedLimit = Number(limit);

        if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
            return res.status(400).json({ message: 'lat and lng are required' });
        }

        const stores = await storeModel.getNearestStores(parsedLat, parsedLng, parsedLimit || 3);
        res.json({ stores });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/stores/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'store id is required' });
        
        const store = await storeModel.getStoreById(Number(id));
        if (!store) return res.status(404).json({ message: 'Store not found' });
        
        res.json({ store });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.send('Hello Cake Shop');
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});