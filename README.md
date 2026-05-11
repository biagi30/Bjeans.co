# BJeans.co

Your Denim, Your Way

This repository contains:

- A Next.js frontend in the project root.
- An Express + MongoDB backend in the `backend` folder.

## Frontend

Run the frontend with:

```bash
npm run dev
```

## Backend

The backend uses `mongoose` and reads its connection string from `backend/.env`.

Run the backend with:

```bash
npm install --prefix backend
npm run dev:backend
```

## MongoDB setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGODB_URI` to your local or hosted MongoDB connection string.
3. Start the backend and confirm `GET /health` returns a success response.
