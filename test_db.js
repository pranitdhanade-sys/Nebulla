const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing MySQL connection...');
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      connectTimeout: 5000 // 5 seconds timeout to fail faster
    });
    console.log('Connected successfully!');
    await conn.query('SELECT 1');
    await conn.end();
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();
