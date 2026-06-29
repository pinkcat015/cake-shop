const db = require('./config/db');

(async () => {
  try {
    console.log('Altering Order table to add cancel_requested column...');
    await db.query('ALTER TABLE `Order` ADD COLUMN cancel_requested TINYINT(1) DEFAULT 0');
    console.log('Successfully altered Order table.');
  } catch (err) {
    console.log('Altering failed or column already exists:', err.message);
  } finally {
    await db.end();
  }
})();
