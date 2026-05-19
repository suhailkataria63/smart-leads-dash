# GigFlow – Smart Leads Dashboard

GigFlow – Smart Leads Dashboard is a full-stack lead management application built for the final assignment submission. It allows authenticated users to create, view, update, filter, search, sort, paginate, and export sales leads, with role-based access for Admin and Sales users.

## Live Deployment

- Frontend: https://smart-leads-dash.vercel.app
- Backend API: https://smart-leads-dash.onrender.com
- Backend health check: https://smart-leads-dash.onrender.com/api/health

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
- MongoDB Atlas
- Mongoose
- JWT authentication
- bcrypt password hashing

### Deployment and DevOps

- Frontend hosted on Vercel
- Backend hosted on Render
- MongoDB Atlas database
- Docker and Docker Compose for local containerized setup

## Core Features

- User registration and login
- JWT-based authentication
- Protected frontend routes
- Role-based lead visibility
- Lead CRUD operations
- Lead detail view
- Backend validation and centralized error handling
- Responsive dashboard UI

## Bonus Features

- Debounced lead search
- Filtering by lead status and source
- Sorting by latest or oldest leads
- Backend pagination
- CSV export with active filters applied
- Dark mode with persisted theme preference
- Dockerized local development setup

## User Roles

### Admin

- Can view all leads in the system.
- Can create leads.
- Can edit and delete accessible leads.
- Can export leads to CSV.

### Sales User

- Can view only leads created by their own account.
- Can create, edit, and delete their own leads.
- Can export their accessible leads to CSV.

## Authentication Flow

1. A user registers with name, email, password, and role.
2. The backend validates the request and hashes the password before storing the user.
3. On successful registration or login, the backend returns a JWT and user profile.
4. The frontend stores the auth state and sends the JWT in the `Authorization` header for protected API calls.
5. Protected frontend routes require a valid logged-in user.
6. The backend verifies the JWT before serving protected lead and profile endpoints.

## Lead Management

The dashboard supports:

- Create a new lead
- View all accessible leads
- View a single lead detail page
- Edit lead information
- Delete leads with confirmation
- Track lead status and source

Supported lead statuses:

- `New`
- `Contacted`
- `Qualified`
- `Lost`

Supported lead sources:

- `Website`
- `Instagram`
- `Referral`

## Filtering, Search, Sort, and Pagination

Implemented dashboard controls include:

- Search leads by name or email
- Filter leads by status
- Filter leads by source
- Sort leads by latest or oldest
- Paginate through lead results
- Reset active filters

Search is debounced on the frontend and handled by the backend query API.

## CSV Export

Users can export accessible leads as a CSV file from the dashboard. The export respects the currently selected filters, search term, and sort order.

## Dark Mode

The frontend includes a light/dark theme toggle. The selected theme is persisted locally and applied across the dashboard, authentication pages, forms, and lead views.

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
│   ├── .env.example
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
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── API_DOCUMENTATION.md
├── docker-compose.yml
└── README.md
```

## Environment Variables

Environment files are intentionally not committed. Use the provided `.env.example` files as references and create local `.env` files as needed.

### Backend

Create `backend/.env`:

```env
PORT=5001
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

For local MongoDB, `MONGODB_URI` can point to a local MongoDB instance. For production, it should point to MongoDB Atlas.

### Frontend

Create `frontend/.env` for local development:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

For the deployed frontend on Vercel:

```env
VITE_API_BASE_URL=https://smart-leads-dash.onrender.com/api
```

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend runs locally at:

```text
http://localhost:5001
```

Build and start the backend:

```bash
npm run build
npm start
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs locally at:

```text
http://localhost:5173
```

Build the frontend:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Docker Setup

Run the complete local stack with Docker Compose:

```bash
docker compose up --build
```

Docker services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
- MongoDB: `localhost:27017`

The backend Docker service connects to MongoDB using:

```text
mongodb://mongodb:27017/smart-leads-dashboard
```

Optional environment overrides for Docker:

```bash
JWT_SECRET=<your_jwt_secret> VITE_API_BASE_URL=http://localhost:5001/api docker compose up --build
```

## API Documentation

Full API details are available in:

[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

The API documentation includes:

- Authentication endpoints
- Profile endpoint
- Lead CRUD endpoints
- Lead query parameters
- CSV export endpoint
- Request and response examples
- Error response format

## Deployment Information

- Frontend is deployed on Vercel.
- Backend API is deployed on Render.
- Database is hosted on MongoDB Atlas.
- The deployed frontend uses the Render backend API URL:

```env
VITE_API_BASE_URL=https://smart-leads-dash.onrender.com/api
```

## Testing and Demo Workflow

Recommended demo flow:

1. Open the deployed frontend.
2. Register a Sales user and create a few leads.
3. Register or log in as an Admin user.
4. Confirm Admin can view all leads.
5. Confirm Sales user can view only their own leads.
6. Test lead create, edit, view, and delete flows.
7. Test search, status filter, source filter, sort, and pagination.
8. Export CSV and confirm the exported data matches the active filters.
9. Toggle dark mode and refresh to confirm the theme persists.
10. Open the health check URL to confirm the backend is running.

## Repository Notes

- `.env` files are not committed to the repository.
- `backend/.env.example` and `frontend/.env.example` are provided as setup references.
- No real secrets, passwords, or production credentials should be committed.
- `API_DOCUMENTATION.md` contains the detailed backend API reference.

## Author

Suhail Kataria  
B.Tech AI&DS  
Chandigarh Group of Colleges, Landran
