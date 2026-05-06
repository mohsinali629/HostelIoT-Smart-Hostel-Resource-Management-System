import { Router } from "express";
  import { WaterChillerStatus, ChillerUsageRecord } from "../models/WaterChiller";
  import { SystemLog } from "../models/SystemLog";

  const router = Router();

  router.get("/water-chiller/status", async (req, res) => {
    try {
      let status = await WaterChillerStatus.findOne().sort({ timestamp: -1 });
      if (!status) { status = await WaterChillerStatus.create({ levelPercent: 65, temperature: 19.5, targetTemperature: 20, filterStatus: "auto", filterMode: "auto", coolerStatus: "off", capacityLiters: 500, currentLiters: 325 }); }
      const d = status.toObject();
      return res.json({ levelPercent: d.levelPercent, temperature: d.temperature, targetTemperature: d.targetTemperature, filterStatus: d.filterStatus, filterMode: d.filterMode, coolerStatus: d.coolerStatus, capacityLiters: d.capacityLiters, currentLiters: Math.round(d.capacityLiters * d.levelPercent / 100), lastUpdated: d.timestamp });
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  router.post("/water-chiller/temperature", async (req, res) => {
    try {
      const { temperature } = req.body;
      if (typeof temperature !== "number" || temperature < 5 || temperature > 35) return res.status(400).json({ error: "Temperature must be between 5 and 35" });
      const latest = await WaterChillerStatus.findOne().sort({ timestamp: -1 });
      await WaterChillerStatus.create({ levelPercent: latest?.levelPercent ?? 65, temperature: latest?.temperature ?? 19.5, targetTemperature: temperature, filterStatus: latest?.filterStatus ?? "auto", filterMode: latest?.filterMode ?? "auto", coolerStatus: latest?.temperature !== undefined && latest.temperature > temperature ? "on" : "off", capacityLiters: latest?.capacityLiters ?? 500, timestamp: new Date() });
      await SystemLog.create({ module: "water-chiller", level: "info", message: `Target temperature set to ${temperature}°C`, details: { targetTemperature: temperature } });
      return res.json({ success: true, message: `Temperature set to ${temperature}°C` });
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  router.post("/water-chiller/filter", async (req, res) => {
    try {
      const { action } = req.body;
      if (!["on", "off", "auto"].includes(action)) return res.status(400).json({ error: "Invalid action" });
      const latest = await WaterChillerStatus.findOne().sort({ timestamp: -1 });
      await WaterChillerStatus.create({ levelPercent: latest?.levelPercent ?? 65, temperature: latest?.temperature ?? 19.5, targetTemperature: latest?.targetTemperature ?? 20, filterStatus: action, filterMode: action === "auto" ? "auto" : "manual", coolerStatus: latest?.coolerStatus ?? "off", capacityLiters: latest?.capacityLiters ?? 500, timestamp: new Date() });
      await SystemLog.create({ module: "water-chiller", level: "info", message: `Chiller filter set to ${action}`, details: { action, triggeredBy: "manual" } });
      return res.json({ success: true, message: `Filter set to ${action}` });
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  router.get("/water-chiller/history", async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      const records = await ChillerUsageRecord.find({ timestamp: { $gte: since } }).sort({ timestamp: 1 }).limit(200);
      return res.json(records.map((r) => ({ timestamp: r.timestamp, levelPercent: r.levelPercent, temperature: r.temperature, litersUsed: r.litersUsed, filterStatus: r.filterStatus, coolerStatus: r.coolerStatus })));
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  export default router;
  