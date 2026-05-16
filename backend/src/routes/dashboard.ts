import { Router } from "express";
  import { WaterTankStatus } from "../models/WaterTank";
  import { WaterChillerStatus } from "../models/WaterChiller";
  import { LightGroup } from "../models/Lights";
  import { RoomPower } from "../models/Power";
  import { SystemLog } from "../models/SystemLog";

  const router = Router();

  router.get("/dashboard/summary", async (req, res) => {
    try {
      const [waterTank, waterChiller, lights, rooms, recentLogs] = await Promise.all([
        WaterTankStatus.findOne().sort({ timestamp: -1 }),
        WaterChillerStatus.findOne().sort({ timestamp: -1 }),
        LightGroup.find(),
        RoomPower.find(),
        SystemLog.find().sort({ timestamp: -1 }).limit(5),
      ]);
      const activeGroups = lights.filter((g) => g.isOn).length;
      const totalCurrentWatts = rooms.reduce((s, r) => s + r.currentWatts, 0);
      const anomalyCount = rooms.filter((r) => r.isAnomaly).length;
      return res.json({
        waterTank: { level: waterTank?.levelPercent ?? 72, motorStatus: waterTank?.motorStatus ?? "off", lastUpdated: waterTank?.timestamp ?? new Date() },
        waterChiller: { level: waterChiller?.levelPercent ?? 65, temperature: waterChiller?.temperature ?? 19.5, targetTemperature: waterChiller?.targetTemperature ?? 20, filterStatus: waterChiller?.filterStatus ?? "auto", coolerStatus: waterChiller?.coolerStatus ?? "off", lastUpdated: waterChiller?.timestamp ?? new Date() },
        lights: { totalGroups: lights.length, activeGroups, lastUpdated: new Date() },
        power: { totalConsumptionKwh: Math.round(totalCurrentWatts / 1000 * 100) / 100, activeRooms: rooms.filter((r) => r.occupancyStatus === "occupied").length, anomalyCount, lastUpdated: new Date() },
        recentAlerts: recentLogs.filter((l) => l.level === "warning" || l.level === "error" || l.level === "critical").map((l) => ({ id: l._id.toString(), timestamp: l.timestamp, module: l.module, level: l.level, message: l.message, details: l.details })),
      });      
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  export default router;
  