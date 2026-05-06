import { mongoose } from "../lib/mongodb";

  const waterChillerStatusSchema = new mongoose.Schema({
    levelPercent: { type: Number, required: true },
    temperature: { type: Number, required: true },
    targetTemperature: { type: Number, default: 20 },
    filterStatus: { type: String, enum: ["on", "off", "auto"], default: "auto" },
    filterMode: { type: String, enum: ["manual", "auto"], default: "auto" },
    coolerStatus: { type: String, enum: ["on", "off"], default: "off" },
    capacityLiters: { type: Number, default: 500 },
    currentLiters: { type: Number },
    timestamp: { type: Date, default: Date.now },
  });

  const chillerUsageSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    levelPercent: { type: Number, required: true },
    temperature: { type: Number, required: true },
    litersUsed: { type: Number, required: true },
    filterStatus: { type: String, required: true },
    coolerStatus: { type: String, required: true },
  });

  export const WaterChillerStatus = mongoose.model("WaterChillerStatus", waterChillerStatusSchema);
  export const ChillerUsageRecord = mongoose.model("ChillerUsageRecord", chillerUsageSchema);
  