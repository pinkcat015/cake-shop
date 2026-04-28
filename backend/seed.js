const db = require('./config/db');

const seedCategories = [
    'Cakes',
    'Cupcakes',
    'Mousse & Cheesecakes',
    'Pastries',
    'Cookies',
    'Bread'
];

const categoryImages = {
    Cakes: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
    Cupcakes: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=1200&q=80',
    'Mousse & Cheesecakes': 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&w=1200&q=80',
    Pastries: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
    Cookies: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=80',
    Bread: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1200&q=80'
};

const categoryBasePrices = {
    Cakes: 45000,
    Cupcakes: 25000,
    'Mousse & Cheesecakes': 43000,
    Pastries: 30000,
    Cookies: 18000,
    Bread: 22000
};

const catalog = [
    {
        category: 'Cakes',
        items: [
            'Strawberry Shortcake',
            'Chocolate Fudge Cake',
            'Vanilla Sponge Cake',
            'Red Velvet Cake',
            'Tiramisu Cake',
            'Black Forest Cake',
            'Matcha Cake',
            'Mango Cream Cake',
            'Blueberry Yogurt Cake',
            'Pineapple Cake',
            'Coconut Cake',
            'Carrot Cake',
            'Opera Cake',
            'Mille Crepe Cake',
            'Burnt Basque Cheesecake',
            'Japanese Cheesecake',
            'Ice Cream Cake',
            'Mocha Cake',
            'Durian Cake',
            'Lychee Rose Cake'
        ]
    },
    {
        category: 'Cupcakes',
        items: [
            'Vanilla Cupcake',
            'Chocolate Cupcake',
            'Red Velvet Cupcake',
            'Matcha Cupcake',
            'Lemon Cupcake',
            'Strawberry Cupcake',
            'Oreo Cupcake',
            'Salted Caramel Cupcake',
            'Coconut Cupcake',
            'Coffee Cupcake',
            'Blueberry Cupcake',
            'Peanut Butter Cupcake'
        ]
    },
    {
        category: 'Mousse & Cheesecakes',
        items: [
            'Chocolate Mousse',
            'Dark Chocolate Mousse',
            'White Chocolate Mousse',
            'Mango Mousse',
            'Passion Fruit Mousse',
            'Matcha Mousse',
            'Strawberry Mousse',
            'Blueberry Mousse',
            'Tiramisu Mousse',
            'New York Cheesecake',
            'Oreo Cheesecake',
            'Blueberry Cheesecake',
            'Strawberry Cheesecake',
            'Matcha Cheesecake',
            'Chocolate Cheesecake',
            'Japanese Cotton Cheesecake'
        ]
    },
    {
        category: 'Pastries',
        items: [
            'Croissant',
            'Butter Croissant',
            'Chocolate Croissant (Pain au Chocolat)',
            'Almond Croissant',
            'Danish Pastry',
            'Fruit Danish',
            'Apple Turnover',
            'Cinnamon Roll',
            'Palmier',
            'Cream Puff (Choux)',
            'Choux Craquelin',
            'Eclair',
            'Paris-Brest',
            'Mille-feuille',
            'Custard Tart',
            'Egg Tart'
        ]
    },
    {
        category: 'Cookies',
        items: [
            'Chocolate Chip Cookie',
            'Double Chocolate Cookie',
            'Oatmeal Raisin Cookie',
            'Butter Cookie',
            'Matcha Cookie',
            'Almond Cookie',
            'Peanut Butter Cookie',
            'Red Velvet Cookie',
            'White Chocolate Macadamia Cookie',
            'Gingerbread Cookie',
            'Shortbread Cookie'
        ]
    },
    {
        category: 'Bread',
        items: [
            'Milk Bread',
            'Japanese Milk Bread',
            'Butter Bread',
            'Cheese Bread',
            'Garlic Bread',
            'Sausage Bread',
            'Ham & Cheese Bread',
            'Sweet Red Bean Bread',
            'Custard Cream Bread',
            'Chocolate Bread',
            'Raisin Bread',
            'Whole Wheat Bread'
        ]
    }
];

const seedProducts = catalog.flatMap(({ category, items }) => {
    const basePrice = categoryBasePrices[category];
    const image = categoryImages[category];

    return items.map((name, index) => ({
        name,
        price: basePrice + index * 1500,
        description: `${name} is part of the ${category.toLowerCase()} collection.`,
        category,
        image,
        quantity: Math.max(8, 28 - index)
    }));
});

const getCategoryId = async (categoryName) => {
    const [rows] = await db.query('SELECT category_id FROM Category WHERE name = ? LIMIT 1', [categoryName]);

    if (rows[0]) {
        return rows[0].category_id;
    }

    const [result] = await db.query('INSERT INTO Category (name) VALUES (?)', [categoryName]);
    return result.insertId;
};

const upsertInventory = async (productId, quantity) => {
    const [rows] = await db.query('SELECT product_id FROM Inventory WHERE product_id = ? LIMIT 1', [productId]);

    if (rows[0]) {
        await db.query('UPDATE Inventory SET quantity = ? WHERE product_id = ?', [quantity, productId]);
        return;
    }

    await db.query('INSERT INTO Inventory (product_id, quantity) VALUES (?, ?)', [productId, quantity]);
};

const upsertProduct = async (product) => {
    const categoryId = await getCategoryId(product.category);
    const [existingRows] = await db.query('SELECT product_id FROM Product WHERE name = ? LIMIT 1', [product.name]);

    if (existingRows[0]) {
        const productId = existingRows[0].product_id;

        await db.query(
            'UPDATE Product SET price = ?, description = ?, image = ?, category_id = ? WHERE product_id = ?',
            [product.price, product.description, product.image, categoryId, productId]
        );

        await upsertInventory(productId, product.quantity);
        return;
    }

    const [result] = await db.query(
        'INSERT INTO Product (name, price, description, image, category_id) VALUES (?, ?, ?, ?, ?)',
        [product.name, product.price, product.description, product.image, categoryId]
    );

    await upsertInventory(result.insertId, product.quantity);
};

const seed = async () => {
    try {
        for (const category of seedCategories) {
            await db.query('INSERT IGNORE INTO Category (name) VALUES (?)', [category]);
        }

        for (const product of seedProducts) {
            await upsertProduct(product);
        }

        console.log('Seed data created successfully');
    } catch (error) {
        console.error('Seed data error:', error);
        process.exitCode = 1;
    }
};

seed();