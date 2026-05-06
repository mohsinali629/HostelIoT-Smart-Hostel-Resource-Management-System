import { Router } from "express";
  import { RoomPower, PowerUsageRecord } from "../models/Power";

  const router = Router();

  router.get("/power/rooms", async (req, res) => {
    try {
      const rooms = await RoomPower.find().sort({ floor: 1, wing: 1, roomName: 1 });
      return res.json(rooms.map((r) => ({ roomId: r.roomId, roomName: r.roomName, floor: r.floor, wing: r.wing, currentWatts: r.currentWatts, todayKwh: r.todayKwh, monthKwh: r.monthKwh, isAnomaly: r.isAnomaly, anomalyReason: r.anomalyReason, occupancyStatus: r.occupancyStatus, lastUpdated: r.lastUpdated })));
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  router.get("/power/rooms/:roomId/history", async (req, res) => {
    try {
      const { roomId } = req.params;
      const hours = parseInt(req.query.hours as string) || 24;
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      const records = await PowerUsageRecord.find({ roomId, timestamp: { $gte: since } }).sort({ timestamp: 1 }).limit(200);
      return res.json(records.map((r) => ({ timestamp: r.timestamp, watts: r.watts, kwh: r.kwh })));
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  router.get("/power/anomalies", async (req, res) => {
    try {
      const anomalyRooms = await RoomPower.find({ isAnomaly: true });
      return res.json(anomalyRooms.map((r) => ({ roomId: r.roomId, roomName: r.roomName, reason: r.anomalyReason || "Unusual power consumption detected", currentWatts: r.currentWatts, detectedAt: r.lastUpdated, severity: r.currentWatts > 2000 ? "high" : r.currentWatts > 1000 ? "medium" : "low" })));
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  router.get("/power/summary", async (req, res) => {
    try {
      const rooms = await RoomPower.find();
      const totalRooms = rooms.length;
      const occupiedRooms = rooms.filter((r) => r.occupancyStatus === "occupied").length;
      const totalCurrentWatts = rooms.reduce((sum, r) => sum + r.currentWatts, 0);
      const todayTotalKwh = rooms.reduce((sum, r) => sum + r.todayKwh, 0);
      const monthTotalKwh = rooms.reduce((sum, r) => sum + r.monthKwh, 0);
      const anomalyRooms = rooms.filter((r) => r.isAnomaly).length;
      const averagePerRoom = totalRooms > 0 ? totalCurrentWatts / totalRooms : 0;
      return res.json({ totalRooms, occupiedRooms, totalCurrentWatts: Math.round(totalCurrentWatts), todayTotalKwh: Math.round(todayTotalKwh * 100) / 100, monthTotalKwh: Math.round(monthTotalKwh * 100) / 100, anomalyRooms, peakUsageTime: "19:00 - 22:00", averagePerRoom: Math.round(averagePerRoom) });
    } catch (err) { return res.status(500).json({ error: "Internal server error" }); }
  });

  export default router;
  