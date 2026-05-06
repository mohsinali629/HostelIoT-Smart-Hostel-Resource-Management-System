import { connectMongoDB, mongoose } from "../lib/mongodb";

async function createIndexes() {
  await connectMongoDB();

  const db = mongoose.connection.db!;

  await db.collection("powerusagerecords").createIndex({ timestamp: -1 });
  await db.collection("chillerusagerecords").createIndex({ timestamp: -1 });
  await db.collection("waterusagerecords").createIndex({ timestamp: -1 });
  await db.collection("systemlogs").createIndex({ timestamp: -1 });

  console.log("Indexes created");
  process.exit(0);
}

createIndexes();