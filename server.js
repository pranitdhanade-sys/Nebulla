require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const app = express();

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'nebulla_arcade',
  portApp: Number(process.env.PORT || 3009),
  sessionSecret: process.env.SESSION_SECRET || 'replace_me'
};

let pool;

async function initializeDatabase() {
  console.log(`[Connecting] Attempting to reach MySQL database at ${config.host}:${config.port}...`);
  const bootstrapConn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    multipleStatements: true
  });

  await bootstrapConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
  await bootstrapConn.end();

  pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(30) NOT NULL UNIQUE,
      email VARCHAR(120) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      event_type VARCHAR(40) NOT NULL,
      event_text VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log(`Database ready: ${config.database}`);
}

app.use(express.json());
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(express.static(path.join(__dirname, 'public')));

function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Please login first.' });
  }

  return next();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ message: 'Username must be 3-30 characters.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please use a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email.toLowerCase(), passwordHash]
    );

    await pool.query(
      'INSERT INTO activity_log (user_id, event_type, event_text) VALUES (?, ?, ?)',
      [result.insertId, 'signup', 'Joined Nebulla Arcade']
    );

    req.session.user = {
      id: result.insertId,
      username,
      email: email.toLowerCase()
    };

    return res.status(201).json({
      message: 'Account created successfully!',
      user: req.session.user
    });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }

    console.error(error);
    return res.status(500).json({ message: 'Failed to create account.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { identity, password } = req.body;

    if (!identity || !password) {
      return res.status(400).json({ message: 'Identity and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash FROM users WHERE email = ? OR username = ? LIMIT 1',
      [identity.toLowerCase(), identity]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    await pool.query(
      'INSERT INTO activity_log (user_id, event_type, event_text) VALUES (?, ?, ?)',
      [user.id, 'login', 'Logged into Nebulla Dashboard']
    );

    return res.json({ message: 'Welcome back!', user: req.session.user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out.' });
    }

    return res.json({ message: 'Logged out.' });
  });
});

app.get('/api/me', (req, res) => {
  if (!req.session.user) {
    return res.status(200).json({ authenticated: false });
  }

  return res.status(200).json({ authenticated: true, user: req.session.user });
});

app.get('/api/dashboard', isAuthenticated, async (req, res) => {
  try {
    const [activity] = await pool.query(
      `SELECT event_type, event_text, created_at
       FROM activity_log
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 8`,
      [req.session.user.id]
    );

    return res.json({
      profile: req.session.user,
      stats: {
        rank: 'Star Ranger',
        xp: 1840,
        credits: 920,
        streak: 6
      },
      activity
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Could not load dashboard.' });
  }
});

async function bootstrap() {
  try {
    await initializeDatabase();
    app.listen(config.portApp, () => {
      console.log(`Nebulla Arcade running on http://localhost:${config.portApp}`);
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

bootstrap();
