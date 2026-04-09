# Nebulla Arcade (Node.js + MySQL/XAMPP)

Bright retro auth app built with Node.js + Express + MySQL.

## Features

- Separate pages/files for:
  - Login (`public/login.html`, `public/login.js`, `public/login.css`)
  - Signup (`public/signup.html`, `public/signup.js`, `public/signup.css`)
  - Dashboard (`public/dashboard.html`, `public/dashboard.js`, `public/dashboard.css`)
- Shared neon/pixel-inspired styling in `public/shared.css`
- Sprite-style animated character blocks in auth pages
- Session-based auth with signup/login/logout
- Auto-creates MySQL database + tables if missing (XAMPP/phpMyAdmin friendly)

## Setup

1. Install dependencies
Nebulla is a pixel-game themed authentication app with:

- Login + signup flow.
- Session-based auth.
- Protected dashboard.
- Auto database creation in MySQL (works with XAMPP/phpMyAdmin).
- Retro pixel UI style (fonts, neon palette, animations).

## Tech Stack

- Node.js + Express
- MySQL (via `mysql2`)
- Vanilla HTML/CSS/JS frontend
- `express-session` for session management

## 1) Install dependencies

```bash
npm install
```

2. Create env file
## 2) Configure environment

Copy `.env.example` into `.env` and update values as needed:

```bash
cp .env.example .env
```

3. Confirm XAMPP MySQL values in `.env` (default port is 3306)

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=nebulla_arcade
```

4. Start XAMPP MySQL server.

5. Run app
Typical XAMPP values:

- `MYSQL_HOST=localhost`
- `MYSQL_PORT=3306`
- `MYSQL_USER=root`
- `MYSQL_PASSWORD=` (empty)
- `MYSQL_DATABASE=nebulla_arcade`

## 3) Start XAMPP MySQL

Open XAMPP Control Panel and start **MySQL**.

## 4) Run the app

```bash
npm start
```

Open:
- `http://localhost:3000/login.html`
- `http://localhost:3000/signup.html`
- `http://localhost:3000/dashboard.html`
Open: [http://localhost:3000](http://localhost:3000)

## What is auto-created?

At startup, the server automatically:

1. Creates database if it does not exist: `nebulla_arcade`
2. Creates `users` table.
3. Creates `activity_log` table.

So you can inspect the DB right away in phpMyAdmin after first run.

## API Routes

- `POST /api/signup`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `GET /api/dashboard` (auth required)

