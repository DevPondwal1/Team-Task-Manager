TEAM TASK MANAGER - FULL-STACK ASSIGNMENT SUBMISSION
====================================================

Repository URL: https://github.com/jatin-jatin42/Team-Task-Manager
Live Deployment: [Add your Railway URL here once deployed]

1. OVERVIEW
----------------------------------------------------
A production-ready, full-stack web application where teams can create projects, assign tasks, and track progress using a Kanban-style board. The application features secure JWT authentication, rich analytics, and comprehensive Role-Based Access Control (RBAC).


2. KEY FEATURES & BUSINESS LOGIC
----------------------------------------------------
* Authentication & Security: 
  Secure JWT-based authentication using short-lived access tokens and automated refresh token rotation. Passwords are cryptographically hashed using bcrypt.

* Strict Role-Based Access Control (RBAC): 
  - ADMIN: Can create projects, invite members, update project details, delete any task, and change any task status.
  - MEMBER: Can view the project, create tasks, but can ONLY update the status of tasks specifically assigned to them.
  - Implemented securely at the Express.js middleware level to prevent unauthorized API requests.

* Analytics Dashboard: 
  Real-time metrics overview displaying total tasks, pending workload, overdue task flags, and a chronological recent activity feed for all projects the user is a part of.

* Kanban Project Boards: 
  Dynamic task boards organized into TODO, IN_PROGRESS, and DONE statuses with priority tagging (LOW, MEDIUM, HIGH) and due dates.


3. TECHNOLOGY STACK
----------------------------------------------------
Frontend (Client):
- Framework: React + Vite (for fast compilation and optimized builds)
- Language: TypeScript (strict type safety)
- Styling: Tailwind CSS v3 (Custom design system with a premium dark mode, glassmorphism UI)
- State Management: Zustand (lightweight global store)
- Data Fetching: Axios (configured with automatic token refresh interceptors)
- Icons: Lucide React

Backend (API):
- Runtime: Node.js
- Framework: Express.js (RESTful API architecture)
- Language: TypeScript
- Database: PostgreSQL (Relational database perfectly suited for user/project/task relations)
- ORM: Prisma (Type-safe database client and migrations)
- Validation: Zod (Strict schema validation for all incoming POST/PUT/PATCH requests)


4. DATABASE SCHEMA (Entities)
----------------------------------------------------
- USER: id, name, email, password
- PROJECT: id, name, description, ownerId
- PROJECT_MEMBER: id, projectId, userId, role (ADMIN/MEMBER)
- TASK: id, title, description, status, priority, dueDate, assigneeId, projectId


5. CORE API ENDPOINTS
----------------------------------------------------
Auth:
- POST /api/auth/login     -> Authenticate user & receive JWT tokens
- POST /api/auth/refresh   -> Rotate expired access tokens
- POST /api/auth/signup    -> Register new user

Dashboard:
- GET /api/dashboard       -> Fetch aggregated stats for the user's dashboard

Projects:
- GET /api/projects        -> List all projects for authenticated user
- POST /api/projects       -> Create a new project
- GET /api/projects/:id    -> Get specific project details
- PATCH /api/projects/:id  -> Update project (Admin only)
- DELETE /api/projects/:id -> Delete project (Admin only)

Tasks:
- GET /api/projects/:id/tasks            -> List tasks for a project
- POST /api/projects/:id/tasks           -> Create a new task (Admin only)
- PATCH /api/projects/:id/tasks/:tId/status -> Update task status (Admin or Assignee)


6. LOCAL SETUP INSTRUCTIONS
----------------------------------------------------
Prerequisites: Node.js (v18+) and PostgreSQL.

Database Setup:
Create a local PostgreSQL database named `team_task_manager`.

Backend Setup:
1. cd backend
2. npm install
3. cp .env.example .env 
   (Ensure DATABASE_URL matches your local Postgres credentials in the .env file)
4. npx prisma migrate dev (Creates the tables in your database)
5. npm run dev (Starts server on port 5000)

Frontend Setup:
1. cd frontend
2. npm install
3. echo "VITE_API_URL=http://localhost:5000/api" > .env
4. npm run dev (Starts the Vite server)


7. RAILWAY DEPLOYMENT INSTRUCTIONS
----------------------------------------------------
This repository is configured as a monorepo for seamless deployment on Railway.

1. Connect this GitHub repository to your Railway account.
2. Provision a PostgreSQL Database plugin in Railway.
3. Deploy Backend: 
   - Deploy from your GitHub repo, setting the Root Directory to /backend.
   - Set Build Command: npm run build
   - Set Start Command: npx prisma migrate deploy && npm start
   - Add environment variables: DATABASE_URL (from Postgres plugin), JWT_SECRET, JWT_REFRESH_SECRET, PORT=5000.
4. Deploy Frontend:
   - Deploy from the same GitHub repo, setting the Root Directory to /frontend.
   - Add environment variable: VITE_API_URL pointing to your newly created Railway backend's public URL.
   - Railway will automatically detect Vite and host it as a highly optimized static site.
