# CodeBound Project Setup Guide

This guide will help you set up and connect all three projects: Frontend, Backend, and Game.

## Prerequisites

- **Node.js** (v18 or higher)
- **XAMPP** (for MySQL database)
- **npm** or **yarn**

## Quick Start

### 1. Database Setup (XAMPP)

1. Start XAMPP and ensure MySQL is running
2. Create a database named `cbgame_db`:
   ```sql
   CREATE DATABASE cbgame_db;
   ```
3. Default MySQL credentials:
   - Host: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: (empty)

### 2. Backend Setup

```bash
cd codebound-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials if different
# Default: DATABASE_URL="mysql://root:@localhost:3306/cbgame_db"

# Generate Prisma client
npm run prisma:generate

# Push schema to database (creates tables)
npx prisma db push

# Or run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

Backend will run on: `http://localhost:3000`

### 3. Frontend Setup

```bash
cd codebound-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env if backend runs on different port
# Default: VITE_BACKEND_BASE_URL="http://localhost:3000"

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:5173` (default Vite port)

### 4. Game Setup (Unity)

```bash
cd codebound-game

# Copy environment file
cp .env.example .env

# Update .env with backend API URL
# Default: API_BASE_URL=http://localhost:3000/api
```

## Environment Variables

### Backend (.env)

```env
PORT="3000"
VERSION="v1"
BASEROUTE="api"
NODE_ENV="development"
DATABASE_URL="mysql://root:@localhost:3306/cbgame_db"
ENC_KEY_SECRET="your-secret-key"
CIPHER_KEY_SECRET="your-cipher-key"
API_KEY_SECRET="your-api-key-secret"
API_KEY="your-api-key"
```

### Frontend (.env)

```env
VITE_BACKEND_WS_BASE_URL="ws://localhost:3000"
VITE_BACKEND_BASE_URL="http://localhost:3000"
VITE_BRAND_NAME="CodeBound"
VITE_TOKEN_NAME="codebound_token"
VITE_API_KEY="your-api-key" # Must match backend API_KEY
```

### Game (.env)

```env
API_BASE_URL=http://localhost:3000/api
```

## API Endpoints

### Base URL
- **Backend API**: `http://localhost:3000/api/v1`
- **WebSocket**: `ws://localhost:3000`

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (requires auth)

## Connection Flow

1. **Frontend ↔ Backend**: 
   - Frontend connects to backend API via HTTP
   - WebSocket connection for real-time features
   - API Key authentication via headers

2. **Game ↔ Backend**:
   - Unity game connects to backend API
   - Uses same API endpoints as frontend
   - API Key authentication required

3. **Backend ↔ Database**:
   - Prisma ORM manages database connections
   - MySQL database via XAMPP

## Troubleshooting

### Backend won't start
- Check if MySQL is running in XAMPP
- Verify DATABASE_URL in .env is correct
- Run `npm run prisma:generate` if Prisma errors occur
- Ensure port 3000 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 3000
- Check VITE_BACKEND_BASE_URL in frontend .env
- Ensure API_KEY matches between frontend and backend

### Database connection errors
- Verify MySQL is running in XAMPP
- Check database name matches (cbgame_db)
- Verify username/password in DATABASE_URL
- Run `npx prisma db push` to create tables

### TypeScript errors
- Run `npm install` in both frontend and backend
- Check tsconfig.json exists in backend
- Verify all dependencies are installed

## Development Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run prisma:studio # Open Prisma Studio (database GUI)
npm run prisma:migrate # Run database migrations
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Project Structure

```
codebound/
├── codebound-backend/     # Node.js/Express API
│   ├── src/
│   │   ├── network/      # Routes and controllers
│   │   ├── middleware/    # Auth, CORS, etc.
│   │   ├── db/           # Prisma client
│   │   └── lib/          # Utilities
│   └── prisma/           # Database schema
│
├── codebound-frontend/    # React/Vite frontend
│   └── src/
│       ├── app/          # Pages/routes
│       ├── components/   # UI components
│       ├── db/           # API calls
│       └── hooks/        # React hooks
│
└── codebound-game/        # Unity game
    └── Assets/Scripts/    # C# scripts
```

## Notes

- **Redis has been removed** - Rate limiting now uses in-memory store
- **API Key** must match between frontend and backend
- **Database** uses XAMPP MySQL (localhost:3306)
- **CORS** is configured to allow frontend connections
- **WebSocket** support is available for real-time features

## Next Steps

1. Set up your database and run migrations
2. Start backend server
3. Start frontend server
4. Test API connections
5. Configure Unity game to connect to backend

For more details, check individual project README files.
