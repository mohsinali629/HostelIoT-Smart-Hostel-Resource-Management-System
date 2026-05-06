# HostelIoT — Smart Hostel Resource Management System

  A full-stack IoT simulation platform for managing hostel electric and water resources.

  ## Prerequisites

  - Node.js 18+ (https://nodejs.org)
  - npm (comes with Node.js)
  - MongoDB Atlas account (free tier works fine)

  ## Setup

  ### 1. MongoDB Atlas

  1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free cluster
  2. Create a database user with username/password
  3. In **Network Access**, add IP `0.0.0.0/0` to allow connections from anywhere
  4. Get your connection string: click Connect → Connect your application
     - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/`

  ### 2. Backend Setup

  ```bash
  cd backend
  npm install
  cp .env.example .env
  ```

  Edit `.env` and fill in your values:
  ```
  MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/hostel-iot?retryWrites=true&w=majority
  SESSION_SECRET=any-random-secret-string-here
  PORT=5000
  ```

  Start the backend:
  ```bash
  npm run dev
  ```

  The backend will start on http://localhost:5000, connect to MongoDB, seed the database, and start the IoT simulator.

  ### 3. Frontend Setup

  ```bash
  cd frontend
  npm install
  npm run dev
  ```

  The frontend will start on http://localhost:5173

  ### 4. Login

  Open http://localhost:5173 in your browser.


  ## Project Structure

  ```
  backend/
    src/
      index.ts          — Entry point (port binding)
      app.ts            — Express app setup
      models/           — Mongoose models (Admin, WaterTank, etc.)
      routes/           — API route handlers
      lib/
        mongodb.ts      — Database connection
        seed.ts         — Initial data seeding
        simulator.ts    — IoT simulation (runs every 10-15s)
      services/
        cleanupService.ts -- run cleanup job to reduce memory leaks
      jobs/ 
        dbCleanup.job.ts  -- trigger cleanup every 24 hours if 50MB<
      scripts/
        createIndexes.ts  -- ts-node scripts/createIndexes.ts run it once to add indexes into database

  frontend/
    src/
      App.tsx           — Router + providers
      pages/            — 8 page components
      components/       — Layout + shadcn/ui components
      context/          — Auth state management
      lib/
        api.ts          — Generated React Query hooks (all API calls)
        custom-fetch.ts — Fetch wrapper with error handling
  ```

  ## Features

  | Module | Description |
  |--------|-------------|
  | Water Tank | Ultrasonic sensor simulation, auto motor control at 15%/25%/98% |
  | Water Chiller | Temperature monitoring, auto cooling, filter control |
  | Lights | 3 groups (Critical/Common/Support) with schedules |
  | Power | 72 rooms monitored, anomaly detection for holiday periods |
  | Logs | Full event history for all modules |

  ## CLEANUP feature 
    Every 24 hours:
    Checks DB size
    If > 50MB → cleanup runs
    Keeps:
    last 100 records (most collections)
    last 50 for status tables
    latest per room (power usage)
    Deletes:
    all older junk data
  ## Notes

  - Sessions are stored in memory — they reset when the backend restarts
  - The IoT simulator updates all sensors automatically in the background
  - All data persists in MongoDB Atlas between restarts
  