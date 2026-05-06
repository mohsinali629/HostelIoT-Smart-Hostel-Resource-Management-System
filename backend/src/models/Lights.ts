import { mongoose } from "../lib/mongodb";

  const lightScheduleSchema = new mongoose.Schema({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    days: [{ type: String }],
  }, { _id: false });

  const lightGroupSchema = new mongoose.Schema({
    groupId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["critical", "common", "support"], required: true },
    isOn: { type: Boolean, default: false },
    mode: { type: String, enum: ["auto", "manual", "always-on"], default: "auto" },
    schedules: [lightScheduleSchema],
    lightCount: { type: Number, required: true },
    description: { type: String },
    locations: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now },
  });

  export const LightGroup = mongoose.model("LightGroup", lightGroupSchema);
  