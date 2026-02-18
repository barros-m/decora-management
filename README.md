## DeCora Florida – Management App

## Getting Started

### 1) Configure environment

- Copy `.env.example` to `.env`
- Fill in:
  - `DATABASE_URL` (Neon Postgres)
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (e.g. `http://localhost:3000`)

### 2) Prisma setup

```bash
npm run db:generate
npm run db:migrate
```

### 3) Seed the first manager user

```bash
export SEED_MANAGER_EMAIL="manager@decoraflorida.com"
export SEED_MANAGER_PASSWORD="change-me"
export SEED_MANAGER_NAME="Manager"
npm run db:seed
```

### 4) Run the app

```bash
npm run dev
```

Open `http://localhost:3000` and sign in at `/login`.

## Notes

- Auth is credentials-based (email + password) and restricted to manager users.
- `Budget Requests` exists as a placeholder page with “Coming soon”.
