require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { loadConfig } = require('./src/config');
const { mapDatabaseStartupError } = require('./src/db-errors');

const app = express();
const config = loadConfig();

let pool;

async function initializeDatabase() {
  const bootstrapConnection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    connectTimeout: config.mysqlConnectTimeout
  });

  await bootstrapConnection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
  await bootstrapConnection.end();

  pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: config.mysqlConnectTimeout
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

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.get('/api/health', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ ok: false, message: 'DB pool not initialized' });
    }

    await pool.query('SELECT 1');
    return res.status(200).json({ ok: true, database: config.database });
  } catch (error) {
    return res.status(503).json({ ok: false, message: 'DB not reachable', detail: error.code || error.message });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ message: 'Username must be 3-30 characters.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please use a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username.trim(), email.toLowerCase(), passwordHash]
    );

    req.session.user = {
      id: result.insertId,
      username: username.trim(),
      email: email.toLowerCase()
    };

    await pool.query(
      'INSERT INTO activity_log (user_id, event_type, event_text) VALUES (?, ?, ?)',
      [result.insertId, 'signup', 'Created a new account']
    );

    return res.status(201).json({ message: 'Account created!', user: req.session.user });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }

    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Could not create account.' });
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

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];
    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    await pool.query(
      'INSERT INTO activity_log (user_id, event_type, event_text) VALUES (?, ?, ?)',
      [user.id, 'login', 'Logged into dashboard']
    );

    return res.status(200).json({ message: 'Login successful!', user: req.session.user });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Could not login.' });
  }
});

app.post('/api/logout', isAuthenticated, (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: 'Could not logout.' });
    }

    return res.status(200).json({ message: 'Logout successful.' });
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
       LIMIT 10`,
      [req.session.user.id]
    );

    return res.status(200).json({
      profile: req.session.user,
      stats: {
        rank: 'Neon Captain',
        xp: 2450,
        credits: 1320,
        streak: 9
      },
      activity
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ message: 'Could not load dashboard.' });
  }
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(config.portApp, () => {
      console.log(`Nebulla is running at http://localhost:${config.portApp}`);
      console.log(`Using MySQL at ${config.host}:${config.port} with timeout ${config.mysqlConnectTimeout}ms`);
    });
  } catch (error) {
    const friendlyMessage = mapDatabaseStartupError(error, config);
    console.error('Startup failed:', friendlyMessage);
    process.exit(1);
  }
}

startServer();
