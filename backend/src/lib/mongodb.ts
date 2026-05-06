import mongoose from "mongoose";
  import "dotenv/config";

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required. Copy .env.example to .env and fill it in.");
  }

  let isConnected = false;

  export async function connectMongoDB() {
    if (isConnected) return;
    await mongoose.connect(MONGODB_URI!, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    isConnected = true;
    console.log("[db] Connected to MongoDB Atlas");
  }

  export { mongoose };
  