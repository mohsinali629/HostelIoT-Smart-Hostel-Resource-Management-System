import { mongoose } from "../lib/mongodb";

function getDB() {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Database not connected yet");
  }

  return db;
}

function bytesToMB(bytes: number) {
  return bytes / (1024 * 1024);
}

// 🔹 Keep last N documents
async function keepLastN(collectionName: string, limit: number) {
  const db = getDB();

  const docs = await db
    .collection(collectionName)
    .find({})
    .sort({ timestamp: -1, _id: -1 })
    .skip(limit)
    .project({ _id: 1 })
    .toArray();

  if (docs.length === 0) return;

  const idsToDelete = docs.map(d => d._id);

  await db.collection(collectionName).deleteMany({
    _id: { $in: idsToDelete },
  });

  console.log(`${collectionName}: deleted ${idsToDelete.length}`);
}

// 🔹 Keep latest record per room
async function cleanupPowerUsage() {
  const db = getDB();

  const latestPerRoom = await db.collection("powerusagerecords").aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$roomId",
        latestId: { $first: "$_id" },
      },
    },
  ]).toArray();

  const keepIds = latestPerRoom.map(d => d.latestId);

  await db.collection("powerusagerecords").deleteMany({
    _id: { $nin: keepIds },
  });

  console.log("powerusagerecords cleaned");
}

// 🔹 MAIN CLEANUP
export async function cleanupDatabase() {
  try {
    const db = getDB();
    const stats = await db.stats();

    const sizeMB = bytesToMB(stats.storageSize);

    console.log(`📊 DB Size: ${sizeMB.toFixed(2)} MB`);

    // ✅ Safety threshold
    if (sizeMB < 50) {
      console.log("No cleanup needed");
      return;
    }

    console.log("🧹 Running cleanup...");

    await keepLastN("chillerusagerecords", 100);
    await keepLastN("waterusagerecords", 100);
    await keepLastN("systemlogs", 200);

    await keepLastN("waterchillerstatuses", 50);
    await keepLastN("watertankstatuses", 50);

    await cleanupPowerUsage();

    console.log("✅ Cleanup complete");
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
  }
}