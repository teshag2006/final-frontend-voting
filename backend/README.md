# NestJS Backend Scaffold

This folder contains a Nest.js backend scaffold aligned to the frontend API contracts in this repository.

## Run

1. `cd backend`
2. `npm install`
3. `npm run start:dev`

Server starts on `http://localhost:3001` with global prefix `/api`.

## Frontend Integration

Set frontend env:

`NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api`

## Implemented Route Groups

- `/api/auth/*`
- `/api/public/*`
- `/api/voter/*`
- `/api/contestant/*`
- `/api/sponsor/*`
- `/api/admin/*`
- `/api/analytics`, `/api/analytics/events`
- `/api/leaderboard`
- `/api/contestants/search`
- `/api/upload/media`
- `/api/errors`

## Notes

- Uses in-memory storage (`DataStoreService`) for development.
- Auth is header-based in this scaffold (`x-user-id`, `x-role`).
- Replace with JWT guards, DB (Prisma/TypeORM), and real services for production.
