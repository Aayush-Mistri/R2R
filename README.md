# R2R

A private personal finance tracker: accounts, transactions, categories, budgets and charts behind a password + PIN.

## Stack

- **Client** — React 19, Vite 8, React Router 7, Tailwind CSS 3.4 (class-based dark mode), Recharts, Motion, Lenis, lucide-react
- **Server** — Node.js (ESM), Express 4, Mongoose 8, JWT, bcrypt, zod
- **Database** — MongoDB Atlas

## Getting started

Requires Node.js 20+ and a MongoDB connection string.

```bash
npm install
npm --prefix server install
npm --prefix client install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB Atlas connection string |
| `MONGO_DB` | Database name (default `r2r`) |
| `JWT_SECRET` | Long random string used to sign tokens |
| `PORT` | API port (default `5001`) |
| `CLIENT_ORIGIN` | Allowed browser origin (default `http://localhost:5173`) |

Start both apps:

```bash
npm run dev
```

- Web app: http://localhost:5173
- API: http://localhost:5001 — Vite proxies `/api` to it, so no CORS setup is needed in development.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | API (watch mode) + Vite dev server together |
| `npm run dev:server` | API only |
| `npm run dev:client` | Vite dev server only |
| `npm run build` | Production build of the client into `client/dist` |
| `npm start` | Run the API in production mode |

## Authentication

1. Register a username and password (username availability is checked as you type).
2. Set a 6-digit PIN. This is the second factor.
3. Signing in asks for the password once, then the PIN.
4. Every reload or new browser session asks for the PIN again. The access token lives in memory only; a short-lived httpOnly challenge cookie tracks whether you've passed the password step.
5. Five incorrect PIN attempts lock the account for 5 minutes. A locked-out user can reset the PIN with their password.

## Features

- Overview dashboard: spending trend, category split, monthly totals, recent activity
- Transactions: add, edit, delete income and expenses with account and category
- Accounts: cash, bank, UPI wallets, credit cards, with live balances
- Categories: custom income/expense categories
- Settings: change PIN, change password, theme toggle
- Light and dark themes, responsive layout, keyboard-friendly forms
- Marketing landing page at `/` for signed-out visitors, with scroll-driven storytelling and its own theme switch

## API

All resource routes require `Authorization: Bearer <token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/auth/username-available` | Check username availability |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Password step |
| GET | `/api/auth/status` | Current session state |
| POST | `/api/auth/pin/setup` | Set PIN after registration |
| POST | `/api/auth/pin/verify` | PIN step |
| POST | `/api/auth/pin/reset` | Reset PIN with password |
| POST | `/api/auth/logout` | Clear challenge cookie |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/change-pin` | Change PIN |
| POST | `/api/auth/change-password` | Change password |
| GET/POST | `/api/accounts` | List / create accounts |
| PATCH/DELETE | `/api/accounts/:id` | Update / delete an account |
| GET/POST | `/api/categories` | List / create categories |
| PATCH/DELETE | `/api/categories/:id` | Update / delete a category |
| GET/POST | `/api/transactions` | List / create transactions |
| PATCH/DELETE | `/api/transactions/:id` | Update / delete a transaction |
| GET | `/api/dashboard` | Aggregated totals and chart data |

## Project structure

```
.
├── server/            Express API (routes, models, middleware)
├── client/            React app
│   └── src/
│       ├── pages/     Auth, dashboard, transactions, accounts, categories, settings, landing
│       ├── components/ Layout, forms, charts, UI primitives, landing bento
│       └── context/   Auth, finance data, theme
└── .env.example
```

## Notes

- `.env` is git-ignored — never commit credentials.
- Amounts are stored as decimal numbers and formatted with `Intl.NumberFormat('en-IN')`.
- Dates are plain `YYYY-MM-DD` strings so time zones can't shift a transaction into the wrong day.
