import { mongoose } from "../lib/mongodb";

  const systemLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    module: {
      type: String,
      enum: ["water-tank", "water-chiller", "lights", "power", "auth", "system"],
      required: true,
    },
    level: {
      type: String,
      enum: ["info", "warning", "error", "critical"],
      default: "info",
    },
    message: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
  });

  systemLogSchema.index({ timestamp: -1 });
  systemLogSchema.index({ module: 1, timestamp: -1 });

  export const SystemLog = mongoose.model("SystemLog", systemLogSchema);
  