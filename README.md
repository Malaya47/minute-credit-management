# 🕒 Minute-Credit Management System

A **real-time credit management system** that tracks live session time and deducts credits at a fixed rate of **10 credits per minute** (1 credit every 6 seconds).  
Built with **Next.js, Node.js, PostgreSQL, Redis, and WebSockets** for real-time updates.  

---

## 🌟 Features
- ✅ User authentication (Signup/Login)  
- ✅ Real-time credit deduction (**10 credits/minute = 1 credit/6 seconds**)  
- ✅ WebSocket live updates for credit balance  
- ✅ PostgreSQL for persistent storage  
- ✅ Redis for real-time session management  
- ✅ Auto-stop sessions at **zero credits**  
- ✅ Clean, responsive **Next.js + Tailwind** UI  
- ✅ Persistent credit balance across refreshes  

---

## 🛠️ Tech Stack
**Backend:** Node.js, Express, PostgreSQL, Redis, JWT, WebSocket  
**Frontend:** Next.js 14, React, Tailwind CSS, Axios  
**Database:** PostgreSQL (persistent), Redis (real-time sessions)  
**Authentication:** JWT tokens  
**Real-time Communication:** WebSocket  

---

## 🚀 Setup Instructions

### 1. Prerequisites

- **Install Node.js (v16 or higher)**  
  [Download here](https://nodejs.org/en/download)  
  ```bash
  node --version
  npm --version
  ```

- **Install PostgreSQL**  
  [Download here](https://www.postgresql.org/download/)  
  ```bash
  psql --version
  ```

- **Install Redis**  
  [Redis Install Docs](https://redis.io/download)  
  ```bash
  redis-server --version
  ```

### 2. Application Setup

**Clone repository & install dependencies**

```bash
git clone <your-repository-url>
cd minute-credit-app

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

**Environment variables**  
Create `backend/.env`:

```env
DB_USER=your_postgres_username
DB_HOST=localhost
DB_NAME=minute_credit
DB_PASSWORD=your_postgres_password
DB_PORT=5432
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_here
PORT=8000
```

**Database setup**

*Option A: Automated setup (recommended)*

```bash
# Create database first (if it doesn't exist)
createdb -U postgres minute_credit

# Run the setup script
psql -U postgres -f backend/setup.sql
```

*Option B: Single command setup*

```bash
# Creates database and runs setup in one go
psql -U postgres -c "CREATE DATABASE IF NOT EXISTS minute_credit;" && psql -U postgres -f backend/setup.sql
```

*Option C: Manual setup (if you prefer step-by-step)*

```sql
CREATE DATABASE minute_credit;

\c minute_credit;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  credits INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  credits_consumed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
```

> **Note:** The `backend/setup.sql` file includes additional optimizations like indexes, triggers for auto-updating timestamps, and proper constraints.

**Start the app**

Terminal 1:
```bash
redis-server
```

Terminal 2:
```bash
cd backend
npm run dev
```

Terminal 3:
```bash
cd frontend
npm run dev
```

**Access**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

---

## 📋 API Documentation
Base URL: `http://localhost:8000/api`

### 🔑 Authentication

#### POST `/auth/signup`
Create a new account.

**Request:**
```json
{ "email": "user@example.com", "password": "password123" }
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "<jwt_token>",
  "user": { "id": 1, "email": "user@example.com", "credits": 100 }
}
```

#### POST `/auth/login`
Authenticate user.

**Request:**
```json
{ "email": "user@example.com", "password": "password123" }
```

### 🎮 Sessions

#### POST `/sessions/start`
Start a session.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{ "message": "Session started", "sessionId": 123 }
```

#### POST `/sessions/stop`
Stop session and return final credits.

**Response:**
```json
{ "message": "Session stopped", "creditsConsumed": 15, "finalCredits": 85 }
```

#### GET `/sessions/active`
Check if user has an active session.

**Response:**
```json
{ "active": true }
```

#### GET `/sessions/credits`
Fetch current credits.

**Response:**
```json
{ "credits": 88 }
```

### 🔌 WebSocket

**URL:**
```
ws://localhost:8000?token=<jwt_token>
```

**Update format:**
```json
{
  "type": "credit_update",
  "credits": 95
}
```

---

## 🐛 Troubleshooting

### PostgreSQL
```bash
sudo service postgresql start   # Linux
brew services start postgresql  # macOS
```

### Redis
```bash
redis-cli ping   # Expect "PONG"
```

### Port Conflicts
```bash
lsof -i :3000   # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

### Reinstall Node Modules
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Usage Guide

1. **Register/Login** → get 100 starting credits
2. **Start Session** → deducts 1 credit every 6 seconds
3. **Dashboard updates** via WebSocket
4. **Stop Session** → balance saved in DB
5. **Auto-stop** when credits reach 0

**Rate Breakdown:**
- 10 credits = 1 minute
- 100 credits = 10 minutes

---

## 🏗️ Project Structure

```
minute-credit-app/
├── backend/
│   ├── models/        # DB models
│   ├── routes/        # API routes
│   ├── services/      # Redis, WebSocket, credit logic
│   ├── config/        # Database config
│   ├── middleware/    # JWT auth
│   ├── setup.sql      # DB schema
│   └── index.js       # Main server
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx       # Login/Signup
│   │   └── dashboard/     # Real-time dashboard
│   │       └── page.tsx
│   ├── public/            # Assets
│   └── package.json
└── README.md
```

---
