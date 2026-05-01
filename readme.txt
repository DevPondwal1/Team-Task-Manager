Team Task Manager - Full-Stack Assignment Submission

Repository URL: https://github.com/jatin-jatin42/Team-Task-Manager
Live Deployment: [Add your Railway URL here once deployed]

---

Overview:
A production-ready, full-stack application for teams to create projects, assign tasks, and track progress using a Kanban-style board. Features secure JWT authentication, rich analytics, and Role-Based Access Control (RBAC).

Tech Stack:
- Frontend: React, Vite, TypeScript, Tailwind CSS (Glassmorphism UI), Zustand, Axios
- Backend: Node.js, Express.js, TypeScript, PostgreSQL, Prisma, Zod
- Deployment: Railway

Key Features:
1. Authentication & Security: JWT-based auth with access and refresh tokens, bcrypt password hashing.
2. Role-Based Access Control: Strict authorization (Admin vs. Member permissions at the API level).
3. Analytics Dashboard: Real-time metrics overview and recent activity feed.
4. Kanban Project Boards: Task boards with To-Do, In Progress, and Done columns.

Local Setup Instructions:
1. Clone the repository and ensure PostgreSQL is running locally.
2. Backend Setup:
   - cd backend
   - npm install
   - cp .env.example .env (update DATABASE_URL with your local Postgres URL)
   - npx prisma migrate dev
   - npm run dev
3. Frontend Setup:
   - cd frontend
   - npm install
   - echo "VITE_API_URL=http://localhost:5000/api" > .env
   - npm run dev

Deployment Instructions (Railway):
1. Connect this GitHub repository to Railway.
2. Add a PostgreSQL database plugin in Railway.
3. Deploy Backend: Set root directory to /backend, Add ENV vars (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET). Build: `npm run build`, Start: `npx prisma migrate deploy && npm start`.
4. Deploy Frontend: Set root directory to /frontend. Add ENV var VITE_API_URL pointing to the Backend URL. Railway will statically host the Vite build.
