import { Router } from "express";
  import { WaterTankStatus, WaterUsageRecord } from "../models/WaterTank";
  import { SystemLog } from "../models/SystemLog";

  const router = Router();

  router.get("/water-tank/status", async (req, res) => {
    try {
      let status = await WaterTankStatus.findOne().sort({ timestamp: -1 });
      if (!status) {
        status = await WaterTankStatus.create({ levelPercent: 72, motorStatus: "off", motorMode: "auto", warningTriggered: false, autoTriggered: false, capacityLiters: 5000, currentLiters: 3600 });
      }
      const d = status.toObject();
      return res.json({ levelPercent: d.levelPercent, motorStatus: d.motorStatus, motorMode: d.motorMode, warningTriggered: d.warningTriggered, autoTriggered: d.autoTriggered, capacityLiters: d.capacityLiters, currentLiters: Math.round(d.capacityLiters * d.levelPercent / 100), lastUpdated: d.timestamp });
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  router.post("/water-tank/motor", async (req, res) => {
    try {
      const { action } = req.body;
      if (!["on", "off", "auto"].includes(action)) return res.status(400).json({ error: "Invalid action" });
      const latest = await WaterTankStatus.findOne().sort({ timestamp: -1 });
      const level = latest?.levelPercent ?? 72;
      await WaterTankStatus.create({ levelPercent: level, motorStatus: action, motorMode: action === "auto" ? "auto" : "manual", warningTriggered: level < 25, autoTriggered: false, capacityLiters: latest?.capacityLiters ?? 5000, currentLiters: Math.round((latest?.capacityLiters ?? 5000) * level / 100), timestamp: new Date() });
      await SystemLog.create({ module: "water-tank", level: "info", message: `Motor ${action} command issued`, details: { action, triggeredBy: "manual" } });
      return res.json({ success: true, message: `Motor set to ${action}` });
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  router.get("/water-tank/history", async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      const records = await WaterUsageRecord.find({ timestamp: { $gte: since } }).sort({ timestamp: 1 }).limit(200);
      return res.json(records.map((r) => ({ timestamp: r.timestamp, levelPercent: r.levelPercent, litersUsed: r.litersUsed, motorStatus: r.motorStatus })));
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  export default router;
  