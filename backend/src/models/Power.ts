import { mongoose } from "../lib/mongodb";

  const roomPowerSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    roomName: { type: String, required: true },
    floor: { type: Number, required: true },
    wing: { type: String, required: true },
    currentWatts: { type: Number, default: 0 },
    todayKwh: { type: Number, default: 0 },
    monthKwh: { type: Number, default: 0 },
    isAnomaly: { type: Boolean, default: false },
    anomalyReason: { type: String },
    occupancyStatus: { type: String, enum: ["occupied", "vacant", "holiday"], default: "occupied" },
    lastUpdated: { type: Date, default: Date.now },
  });

  const powerUsageSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    watts: { type: Number, required: true },
    kwh: { type: Number, required: true },
  });
  powerUsageSchema.index({ roomId: 1, timestamp: -1 });

  export const RoomPower = mongoose.model("RoomPower", roomPowerSchema);
  export const PowerUsageRecord = mongoose.model("PowerUsageRecord", powerUsageSchema);
  