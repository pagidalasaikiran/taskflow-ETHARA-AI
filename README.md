# Team Task Manager

A full-stack collaborative project management SaaS application. Streamline your team's workflow with role-based access control, task tracking, and real-time dashboard analytics.

## Features

- **Authentication System**: Secure JWT-based auth with auto-login and session persistence.
- **Role-Based Access Control (RBAC)**: Admin and Member roles with specific permissions on both frontend and backend.
- **Project Management**: Create, edit, and delete projects. Track overall progress visually.
- **Task Management**: Create and assign tasks. View tasks in a Kanban board or a detailed List view.
- **Dashboard Analytics**: Real-time statistics, task distribution charts (via Recharts), recent activities, and upcoming deadlines.
- **Activity Log**: Timeline tracking for project and task updates.
- **Responsive Design**: Modern, glassmorphism-inspired UI with Tailwind CSS v4, skeletons, and toast notifications.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, React Router v6, Zustand (State Management), Axios, React Hook Form, Recharts, Lucide React, react-hot-toast.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose ODM), JWT, bcryptjs, Joi, Helmet, express-rate-limit.
- **Deployment**: Configured for Railway deployment (Monorepo setup with `Procfile` and built-in static serving).

## Folder Structure

```text
team-task-manager/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI elements
│   │   ├── constants/      # Shared enums and paths
│   │   ├── hooks/          # Custom React hooks (debounce, RBAC)
│   │   ├── layouts/        # Dashboard and Auth layouts
│   │   ├── pages/          # Feature pages (Auth, Dashboard, Projects, Tasks, Profile)
│   │   ├── routes/         # React Router config
│   │   ├── services/       # Axios API clients
│   │   ├── store/          # Zustand global state
│   │   ├── utils/          # Helper functions (dates)
│   │   ├── App.jsx         # App root
│   │   ├── index.css       # Global styles & Tailwind config
│   │   └── main.jsx        # React entry point
│   ├── .env.example
│   └── package.json
├── server/                 # Backend Express Application
│   ├── config/             # DB connection
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, Error, and Validation middlewares
│   ├── models/             # Mongoose schemas (User, Project, Task, Activity)
│   ├── routes/             # Express API routes
│   ├── seeds/              # Database seeder script
│   ├── utils/              # API response formatters, Token generation
│   ├── .env.example
│   ├── index.js            # Server entry point
│   └── package.json
├── .gitignore
├── package.json            # Root scripts for monorepo
├── Procfile                # Railway deployment config
└── README.md
```

## Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (or local MongoDB instance)

### 1. Clone the repository
```bash
git clone <repository-url>
cd team-task-manager
```

### 2. Install Dependencies
Installs packages for both client and server:
```bash
npm run install:all
```

### 3. Environment Variables & Configuration
This application uses a centralized configuration architecture. You only need to set up `.env` files; the application handles the rest securely.

**Backend Configuration:**
Rename `server/.env.example` to `server/.env` and add your values:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend Configuration:**
Rename `client/.env.example` to `client/.env` and verify the API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

> **Note:** The entire project reads from centralized configuration loaders (`server/config/config.js` and `client/src/config/config.js`). There are no scattered `process.env` calls or hardcoded secrets in the codebase.

### 4. Seed the Database
Populate the database with demo accounts, projects, and tasks:
```bash
npm run seed
```

### 5. Run the Application
Start both the backend server and frontend Vite development server concurrently:
```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)

## Demo Credentials (from Seed Script)

- **Admin Account**:
  - Email: `admin@demo.com`
  - Password: `admin123`

- **Member Account**:
  - Email: `member@demo.com`
  - Password: `member123`

## API Routes Overview

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- **Projects**: `GET /api/projects`, `POST /api/projects`, `GET /api/projects/:id`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`, `POST /api/projects/:id/members`, `DELETE /api/projects/:id/members/:userId`
- **Tasks**: `GET /api/tasks`, `POST /api/tasks`, `GET /api/tasks/:id`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`, `GET /api/tasks/project/:projectId`, `GET /api/tasks/stats`
- **Users**: `GET /api/users`, `GET /api/users/team`
- **Activities**: `GET /api/activities/recent`

## Deployment (Railway)

This application is configured for a unified deployment on Railway. The backend serves the compiled frontend static files.

1. Create a new project on Railway.
2. Connect your GitHub repository.
3. Railway will detect the `package.json` at the root and run `npm install`.
4. It will run `npm run build` to compile the React frontend.
5. Provide the necessary Environment Variables (specifically `MONGODB_URI`, `JWT_SECRET`, and set `NODE_ENV=production`).
6. Railway will use the `Procfile` (`web: npm start`) to launch the server, which serves both the API and the React App on the assigned port.

## Screenshots

*(Add your screenshots here)*

- **Dashboard**: `![Dashboard](./docs/dashboard.png)`
- **Projects**: `![Projects](./docs/projects.png)`
- **Task Kanban**: `![Kanban](./docs/kanban.png)`

## Future Improvements
- Task attachments and file uploads.
- Real-time notifications via WebSockets.
- Task drag-and-drop integration in the Kanban board.
- Integration with calendar apps (Google Calendar, Outlook).
