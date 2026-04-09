const db = require('./config/db');

async function initRoles() {
    try {
        await db.query('INSERT IGNORE INTO Role (role_name) VALUES (?)', ['customer']);
        await db.query('INSERT IGNORE INTO Role (role_name) VALUES (?)', ['employee']);
        await db.query('INSERT IGNORE INTO Role (role_name) VALUES (?)', ['admin']);
        console.log('Roles initialized');
    } catch (error) {
        console.error('Error initializing roles:', error);
    } finally {
        process.exit();
    }
}

initRoles();