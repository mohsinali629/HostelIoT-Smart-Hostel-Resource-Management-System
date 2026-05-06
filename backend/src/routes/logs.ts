import { Router } from "express";
  import { SystemLog } from "../models/SystemLog";

  const router = Router();

  router.get("/logs", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
      const module = req.query.module as string;
      const filter: any = {};
      if (module) filter.module = module;
      const logs = await SystemLog.find(filter).sort({ timestamp: -1 }).limit(limit);
      return res.json(logs.map((l) => ({ id: l._id.toString(), timestamp: l.timestamp, module: l.module, level: l.level, message: l.message, details: l.details })));
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  export default router;
  