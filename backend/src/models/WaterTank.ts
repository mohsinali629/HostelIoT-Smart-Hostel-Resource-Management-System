import { mongoose } from "../lib/mongodb";

  const waterTankStatusSchema = new mongoose.Schema({
    levelPercent: { type: Number, required: true },
    motorStatus: { type: String, enum: ["on", "off", "auto"], default: "auto" },
    motorMode: { type: String, enum: ["manual", "auto"], default: "auto" },
    warningTriggered: { type: Boolean, default: false },
    autoTriggered: { type: Boolean, default: false },
    capacityLiters: { type: Number, default: 5000 },
    currentLiters: { type: Number },
    timestamp: { type: Date, default: Date.now },
  });

  const waterUsageSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    levelPercent: { type: Number, required: true },
    litersUsed: { type: Number, required: true },
    motorStatus: { type: String, required: true },
  });

  export const WaterTankStatus = mongoose.model("WaterTankStatus", waterTankStatusSchema);
  export const WaterUsageRecord = mongoose.model("WaterUsageRecord", waterUsageSchema);
  