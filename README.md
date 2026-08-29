# frontend-admin

E-commerce **admin dashboard** built with **React + Vite + Tailwind CSS v4**.

## Features

- 🔐 Admin-only login (checks JWT `role == "admin"`)
- 📊 Dashboard with stats, revenue, recent orders & low-stock alerts
- 🛍️ Product management — create / edit / delete, search, sale pricing
- 📦 Order management — view all orders & update status
- 🏷️ Promo code management — create & activate/deactivate
- 👥 User management — change roles (user ↔ admin)
- ⚙️ Store settings — site name & logo

## Getting started

```bash
npm install
npm run dev
```

Runs on **http://localhost:5174** and proxies `/api` to the backend at
`http://localhost:8000`. Make sure the backend is running:

```bash
# from the backend/ folder
.venv/bin/uvicorn app.main:app --reload
```

## Making yourself an admin

1. Register an account from the customer storefront (`frontend-user`).
2. Promote it to admin:

```bash
# from the backend/ folder
.venv/bin/python create_admin.py your@email.com
```

3. Log in to the admin panel at http://localhost:5174 with that account.

## Environment variables

| Variable       | Description                                     | Default |
| -------------- | ----------------------------------------------- | ------- |
| `VITE_API_URL` | Backend API base URL. Empty = use Vite proxy.   | *(empty)* |

For production set `VITE_API_URL` to your deployed backend URL.

## Available scripts

```bash
npm run dev      # start dev server (port 5174)
npm run build    # production build
npm run preview  # preview build
npm run lint     # run ESLint
```

# frontend-admin-e-online
