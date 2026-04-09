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
- Improved startup error handling for DB connection problems (`ETIMEDOUT`, `ECONNREFUSED`, auth errors)

## Setup

1. Install dependencies

```bash
npm install
```

2. Create env file

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
MYSQL_CONNECT_TIMEOUT=10000
```

4. Start XAMPP MySQL server.

5. Run app

```bash
npm start
```

Open:
- `http://localhost:3000/login.html`
- `http://localhost:3000/signup.html`
- `http://localhost:3000/dashboard.html`

## Testing

```bash
npm run check
npm test
```

## Troubleshooting startup timeout (`ETIMEDOUT`)

If you see startup timeout errors:

- Ensure MySQL is started in XAMPP control panel.
- Verify `MYSQL_HOST` and `MYSQL_PORT` are correct (`localhost` and `3306` by default).
- Ensure firewall/antivirus is not blocking the MySQL port.
- Increase `MYSQL_CONNECT_TIMEOUT` to `20000` if startup is slow.

## API Routes

- `POST /api/signup`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `GET /api/dashboard` (requires auth)
- `GET /api/health`
