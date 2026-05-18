# Smart Leads Dashboard

Smart Leads Dashboard is a MERN internship assignment project for managing sales leads with authentication, role-based access, filtering, pagination, and CSV export.

## Objective

Build a full-stack lead management dashboard where authenticated users can manage sales leads. Admin users can access all leads, while sales users can access only their own leads.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- React Router
- Axios

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing

### DevOps

- Docker
- Docker Compose

## Features

- User registration and login
- JWT-based authentication
- Protected frontend routes
- Role-based UI indicators for `admin` and `sales`
- Lead CRUD operations
- Lead filtering by status and source
- Debounced search by name or email
- Sorting by latest or oldest
- Backend pagination
- CSV export using current filters
- Centralized backend error handling
- Docker setup with frontend, backend, and MongoDB services

## Folder Structure

```text
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── types/
│   │   └── utils/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── API_DOCUMENTATION.md
├── docker-compose.yml
└── README.md
```

## Setup Instructions

Clone the repository and install dependencies separately for backend and frontend.

```bash
git clone <github-repository-url>
cd smart-leads-dashboard
```

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/smart-leads-dashboard
JWT_SECRET=replace-with-a-secure-secret
```

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:5001
```

Build backend:

```bash
npm run build
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

Build frontend:

```bash
npm run build
```

## Docker Setup

Run the full application stack with Docker Compose:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
- MongoDB: `localhost:27017`

In Docker, the backend connects to MongoDB using:

```text
mongodb://mongodb:27017/smart-leads-dashboard
```

## API Documentation

Full API documentation is available in:

[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

It includes authentication endpoints, lead CRUD endpoints, query parameters, CSV export, request bodies, success responses, and error responses.

## Development Workflow

1. Start MongoDB locally or with Docker.
2. Start the backend server.
3. Start the frontend development server.
4. Register or log in from the frontend.
5. Manage leads from the dashboard.
6. Use filters, sorting, pagination, and CSV export as needed.

Recommended validation before submission:

```bash
cd backend
npm run build

cd ../frontend
npm run build
```

## Test Credentials

Placeholder for evaluator-created accounts:

```text
Admin:
Email:
Password:

Sales:
Email:
Password:
```

## Deployment Link

```text
Deployment URL: <deployment-link-placeholder>
```

## GitHub Repository

```text
Repository URL: <github-repository-placeholder>
```

## Author

Suhail Kataria  
B.Tech AI&DS  
Chandigarh Group of Colleges, Landran
