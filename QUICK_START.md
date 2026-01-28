# CodeBound - Quick Start Guide 🚀

This guide will help you get the **CodeBound** project (Frontend, Backend, and Unity Game) up and running quickly.

---

## Prerequisites ✅

Before you start, ensure you have the following installed:

- **Node.js** 16+ (with npm)
- **MySQL** 8.0+ (for database)
- **Redis** (for caching) - optional for development
- **Unity** 2021.3+ with Universal Render Pipeline
- **Git** (for version control)

---

## 📁 Project Structure

```
d:\projects\6-codebound\
├── codebound-frontend/     # React + Vite frontend
├── codebound-backend/      # Node.js + Express + Prisma backend
├── codebound-game/         # Unity 2D educational game
├── INSTALLATION_SUMMARY.md # Detailed installation report
└── QUICK_START.md         # This file
```

---

## 🔧 Step 1: Backend Setup

### 1.1 Navigate to Backend Directory
```bash
cd d:\projects\6-codebound\codebound-backend
```

### 1.2 Configure Environment Variables
Create or update your `.env` file:

```env
PORT=3000
VERSION=v1
BASEROUTE=api
NODE_ENV=development

# Database (MySQL)
DATABASE_URL="mysql://root:password@localhost:3306/codebound_db"

# Redis (optional for development)
REDIS_URL=redis://localhost:6379

# Security Keys (generate your own)
ENC_KEY_SECRET="your-encryption-key-32-chars-long"
CIPHER_KEY_SECRET="your-cipher-key-32-chars-long"
API_KEY_SECRET="your-api-key-secret"
API_KEY="your-api-key-for-clients"

# CORS
WHITELIST="http://localhost:5173"
```

### 1.3 Create MySQL Database
```bash
# Using MySQL CLI
mysql -u root -p
CREATE DATABASE codebound_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 1.4 Run Prisma Migrations
```bash
npm run prisma:migrate
```

### 1.5 Generate Prisma Client (Already Done ✅)
```bash
npm run prisma:generate
```

### 1.6 Start Backend Server
```bash
npm run dev
```

**Expected output:**
```
Server running on http://localhost:3000
API available at http://localhost:3000/api/v1
```

---

## 🎨 Step 2: Frontend Setup

### 2.1 Navigate to Frontend Directory
```bash
cd d:\projects\6-codebound\codebound-frontend
```

### 2.2 Configure Environment Variables
Create or update your `.env` file:

```env
# Backend API URLs
VITE_BACKEND_BASE_URL="http://localhost:3000/api/v1"
VITE_BACKEND_WS_BASE_URL="ws://localhost:3000"

# API Configuration
VITE_API_KEY="your-api-key-for-clients"

# Branding
VITE_BRAND_NAME="CodeBound"
VITE_TOKEN_NAME="codebound_token"

# Development Server
PROD_SERVER_HOST="127.0.0.1"
PROD_SERVER_ALLOWED_HOST="localhost"
```

### 2.3 Start Frontend Development Server
```bash
npm run dev
```

**Expected output:**
```
  VITE v4.4.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 2.4 Open in Browser
Navigate to: **http://localhost:5173**

---

## 🎮 Step 3: Unity Game Setup

### 3.1 Open Unity Hub

### 3.2 Add Project
- Click "Add" in Unity Hub
- Navigate to: `d:\projects\6-codebound\codebound-game`
- Select the folder

### 3.3 Configure Unity Version
- Ensure Unity 2021.3+ is installed
- Open the project with Unity 2021.3+

### 3.4 Configure API Endpoint

Edit: `Assets/Scripts/Services/APIConfig.cs`

```csharp
public static class APIConfig
{
    public const string BASE_URL = "http://localhost:3000/api/v1"; 
}
```

### 3.5 Build and Run
- Open Unity
- Select your main scene
- Click Play button to test in Unity Editor
- Or Build to create standalone executable

---

## 🔄 Development Workflow

### Running All Services Together

**Terminal 1 - Backend:**
```bash
cd d:\projects\6-codebound\codebound-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd d:\projects\6-codebound\codebound-frontend
npm run dev
```

**Unity Editor:**
- Keep Unity open with the game project
- Press Play to test

---

## 🧪 Testing the Setup

### 1. Test Backend API
```bash
# Test health endpoint
curl http://localhost:3000/api/v1/health
```

### 2. Test Frontend
- Open browser: http://localhost:5173
- Check for any console errors (F12)
- Verify API connection

### 3. Test Unity Integration
- Open Unity
- Run game in Play mode
- Check Unity Console for API connection logs

---

## 📦 Available NPM Scripts

### Frontend Scripts
```bash
npm run dev        # Start dev server (Vite)
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Backend Scripts
```bash
npm run dev              # Start dev server (ts-node)
npm run build            # Compile TypeScript
npm start                # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio GUI
```

---

## 🐛 Troubleshooting

### Backend Won't Start
- ✅ Check MySQL is running
- ✅ Verify DATABASE_URL in `.env`
- ✅ Run `npm run prisma:migrate`
- ✅ Check port 3000 is not in use

### Frontend Won't Start
- ✅ Check backend is running
- ✅ Verify VITE_BACKEND_BASE_URL in `.env`
- ✅ Clear node_modules and reinstall: `npm install`
- ✅ Check port 5173 is not in use

### Unity Game Can't Connect
- ✅ Verify backend is running
- ✅ Check APIConfig.cs has correct URL
- ✅ Look for errors in Unity Console
- ✅ Ensure CORS is configured correctly in backend

### Database Connection Issues
```bash
# Test MySQL connection
mysql -u root -p -e "SHOW DATABASES;"

# Reset Prisma
npx prisma migrate reset
npx prisma migrate dev
```

---

## 🔍 Verification Checklist

- [ ] Backend server running on http://localhost:3000
- [ ] Frontend dev server running on http://localhost:5173
- [ ] MySQL database created and migrations run
- [ ] Prisma Client generated
- [ ] Unity project opens without errors
- [ ] API endpoints accessible
- [ ] Frontend can communicate with backend
- [ ] Unity game can communicate with backend

---

## 📚 Additional Resources

- **Backend Documentation:** `codebound-backend/.github/backend.md`
- **Frontend Documentation:** `codebound-frontend/.cursor/code.md`
- **Unity Game Design:** `codebound-game/game.md`
- **Installation Report:** `INSTALLATION_SUMMARY.md`

---

## 🆘 Need Help?

Check the documentation files or:
1. Review console logs (browser/terminal/Unity)
2. Check network tab in browser DevTools
3. Verify all environment variables are set
4. Ensure all services are running

---

**Happy Coding! 🎉**

Last updated: January 28, 2026
