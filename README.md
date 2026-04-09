# Nebulla Arcade (Node.js + MySQL/XAMPP)

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

## 2) Configure environment

Copy `.env.example` into `.env` and update values as needed:

```bash
cp .env.example .env
```

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

