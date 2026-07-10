const fs = require('fs');
const path = require('path');
const db = require('./config/db');

(async () => {
  console.log('--- KHỞI ĐỘNG SAO LƯU TỰ ĐỘNG CƠ SỞ DỮ LIỆU ---');
  
  const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
  const backupDir = 'C:\\Users\\pinkc\\cake-shop\\database\\backups';
  const backupFile = path.join(backupDir, `cakeshop_backup_${timestamp}.sql`);
  
  try {
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    let sqlContent = `-- Scarlett Cake Shop Database Backup\n`;
    sqlContent += `-- Generated: ${new Date().toLocaleString()}\n`;
    sqlContent += `SET FOREIGN_KEY_CHECKS=0;\n\n`;
    
    // 1. Lấy danh sách các bảng
    const [tables] = await db.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log(`Tìm thấy ${tableNames.length} bảng cần sao lưu:`, tableNames.join(', '));
    
    for (const tableName of tableNames) {
      console.log(`-> Đang sao lưu bảng: ${tableName}`);
      sqlContent += `-- ------------------------------------------------------\n`;
      sqlContent += `-- Cấu trúc bảng cho \`${tableName}\`\n`;
      sqlContent += `-- ------------------------------------------------------\n`;
      sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      
      // Lấy cấu trúc CREATE TABLE
      const [createTableResult] = await db.query(`SHOW CREATE TABLE \`${tableName}\``);
      const createTableSql = createTableResult[0]['Create Table'];
      sqlContent += `${createTableSql};\n\n`;
      
      // Lấy dữ liệu
      const [rows] = await db.query(`SELECT * FROM \`${tableName}\``);
      if (rows.length > 0) {
        sqlContent += `-- Dữ liệu cho bảng \`${tableName}\`\n`;
        
        // Tạo các câu lệnh INSERT
        for (const row of rows) {
          const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (val instanceof Date) {
              // format Date sang MYSQL timestamp string
              return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            }
            if (typeof val === 'string') {
              // Escape string characters để an toàn khi import
              const escaped = val.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
              return `'${escaped}'`;
            }
            if (typeof val === 'boolean') {
              return val ? '1' : '0';
            }
            return `'${val}'`;
          }).join(', ');
          
          sqlContent += `INSERT INTO \`${tableName}\` (${keys}) VALUES (${values});\n`;
        }
        sqlContent += `\n`;
      }
    }
    
    sqlContent += `SET FOREIGN_KEY_CHECKS=1;\n`;
    
    // Ghi nội dung ra file
    fs.writeFileSync(backupFile, sqlContent, 'utf8');
    console.log('\n================================================================');
    console.log('✓ SAO LƯU DỮ LIỆU THÀNH CÔNG!');
    console.log('File backup đã lưu tại:', backupFile);
    console.log('Kích thước:', fs.statSync(backupFile).size, 'bytes');
    console.log('================================================================');
  } catch (error) {
    console.error('Lỗi khi sao lưu cơ sở dữ liệu:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
})();
