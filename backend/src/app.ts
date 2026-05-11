import express from "express";
  import cors from "cors";
  import session from "express-session";
  import { connectMongoDB } from "./lib/mongodb";
  import { seedDatabase } from "./lib/seed";
  import { startSimulator } from "./lib/simulator";
  import { startCleanupJob } from "./jobs/dbCleanup.job";
  import authRouter from "./routes/auth";
  import waterTankRouter from "./routes/waterTank";
  import waterChillerRouter from "./routes/waterChiller";
  import lightsRouter from "./routes/lights";
  import powerRouter from "./routes/power";
  import logsRouter from "./routes/logs";
  import dashboardRouter from "./routes/dashboard";

  if (!process.env.SESSION_SECRET) {
    console.warn("[warn] SESSION_SECRET not set — using insecure default");
  }

  const app = express();

  app.use(cors({ origin: ["http://localhost:3000", "https://smarthosteliot.vercel.app"] , credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(session({
    secret: process.env.SESSION_SECRET || "hostel-iot-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 },
  }));

  app.get("/api/healthz", (_req, res) => res.json({ status: "ok" }));
  app.use("/api", authRouter);
  app.use("/api", waterTankRouter);
  app.use("/api", waterChillerRouter);
  app.use("/api", lightsRouter);
  app.use("/api", powerRouter);
  app.use("/api", logsRouter);
  app.use("/api", dashboardRouter);

  connectMongoDB()
    .then(() => {
      seedDatabase();
      startCleanupJob();
    })
    .then(() => startSimulator())
    .catch((err) => {
      console.error("[error] Failed to connect to MongoDB:", err.message);
      console.error("Make sure MONGODB_URI is set in your .env file and the IP is whitelisted in Atlas.");
    });

  export default app;
  