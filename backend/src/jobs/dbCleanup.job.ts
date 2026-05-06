import cron from "node-cron";
import { cleanupDatabase } from "../services/cleanupService";

export function startCleanupJob() {
  //Run immediately (for testing)
  cleanupDatabase();

  //Run every 24 hours at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Scheduled cleanup running...");
    await cleanupDatabase();
  });
}