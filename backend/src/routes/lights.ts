import { Router } from "express";
  import { LightGroup } from "../models/Lights";
  import { SystemLog } from "../models/SystemLog";

  const router = Router();

  router.get("/lights/groups", async (req, res) => {
    try {
      const groups = await LightGroup.find().sort({ type: 1 });
      return res.json(groups.map((g) => ({ id: g.groupId, name: g.name, type: g.type, isOn: g.isOn, mode: g.mode, schedules: g.schedules, lightCount: g.lightCount, description: g.description, locations: g.locations, lastUpdated: g.lastUpdated })));
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  router.patch("/lights/groups/:groupId", async (req, res) => {
    try {
      const { groupId } = req.params;
      const { mode, schedules } = req.body;
      const update: any = { lastUpdated: new Date() };
      if (mode) update.mode = mode;
      if (schedules) update.schedules = schedules;
      const group = await LightGroup.findOneAndUpdate({ groupId }, { $set: update }, { new: true });
      if (!group) return res.status(404).json({ error: "Light group not found" });
      await SystemLog.create({ module: "lights", level: "info", message: `Light group "${group.name}" updated`, details: { groupId, mode } });
      return res.json({ id: group.groupId, name: group.name, type: group.type, isOn: group.isOn, mode: group.mode, schedules: group.schedules, lightCount: group.lightCount, description: group.description, locations: group.locations, lastUpdated: group.lastUpdated });
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  router.post("/lights/groups/:groupId/toggle", async (req, res) => {
    try {
      const { groupId } = req.params;
      const { on } = req.body;
      const group = await LightGroup.findOneAndUpdate({ groupId }, { $set: { isOn: on, mode: "manual", lastUpdated: new Date() } }, { new: true });
      if (!group) return res.status(404).json({ error: "Light group not found" });
      await SystemLog.create({ module: "lights", level: "info", message: `Light group "${group.name}" manually turned ${on ? "ON" : "OFF"}`, details: { groupId, on } });
      return res.json({ success: true, message: `Lights ${on ? "on" : "off"}` });
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  export default router;
  