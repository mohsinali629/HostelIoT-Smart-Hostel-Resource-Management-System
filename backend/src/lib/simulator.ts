import { WaterTankStatus, WaterUsageRecord } from "../models/WaterTank";
  import { WaterChillerStatus, ChillerUsageRecord } from "../models/WaterChiller";
  import { LightGroup } from "../models/Lights";
  import { RoomPower, PowerUsageRecord } from "../models/Power";
  import { SystemLog } from "../models/SystemLog";

  function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
// no use for these two variables they are just to avoid heavy data insertion in database
let waterTankCounter = 0;
let waterClillerCounter = 0;
  async function simulateWaterTank() {
    try {
      waterTankCounter++;
      const latest = await WaterTankStatus.findOne().sort({ timestamp: -1 });
      if (!latest) return;
      let level = latest.levelPercent;
      const motorOn = latest.motorStatus === "on";
      if (motorOn) { level = Math.min(98, level + rand(0.5, 1.5)); } else { level = Math.max(0, level - rand(0.1, 0.4)); }
      let motorStatus = latest.motorStatus;
      let warningTriggered = false, autoTriggered = false;
      if (latest.motorMode === "auto") {
        if (level <= 15) { motorStatus = "on"; autoTriggered = true; await SystemLog.create({ module: "water-tank", level: "critical", message: `Auto: Motor turned ON — critically low at ${level.toFixed(1)}%`, details: { level } }); }
        else if (level >= 98) { motorStatus = "off"; await SystemLog.create({ module: "water-tank", level: "info", message: `Auto: Motor turned OFF — tank full at ${level.toFixed(1)}%`, details: { level } }); }
        else if (level <= 25 && !motorOn) { warningTriggered = true; await SystemLog.create({ module: "water-tank", level: "warning", message: `Warning: Water level low at ${level.toFixed(1)}%`, details: { level } }); }
      }
      const capacity = latest.capacityLiters;
      const currentLiters = capacity * level / 100;
      const litersUsed = motorOn ? 0 : Math.max(0, (capacity * latest.levelPercent / 100) - currentLiters);
      await WaterTankStatus.create({ levelPercent: Math.round(level * 10) / 10, motorStatus, motorMode: latest.motorMode, warningTriggered, autoTriggered, capacityLiters: capacity, currentLiters: Math.round(currentLiters), timestamp: new Date() });
      if (waterTankCounter % 3 === 0){
        await WaterUsageRecord.create({ timestamp: new Date(), levelPercent: Math.round(level * 10) / 10, litersUsed: Math.round(litersUsed * 10) / 10, motorStatus });
      }
      // for cleanup
      if (waterTankCounter === 1000) { waterTankCounter = 0; };
    
    } catch (err: any) { console.error("[sim] water tank error:", err.message); }
  }

  async function simulateWaterChiller() {
    try {
      waterClillerCounter++;
      const latest = await WaterChillerStatus.findOne().sort({ timestamp: -1 });
      if (!latest) return;
      let level = latest.levelPercent;
      let temp = latest.temperature;
      const target = latest.targetTemperature;
      const filterOn = latest.filterStatus === "on";
      if (filterOn) { level = Math.min(98, level + rand(0.3, 0.8)); } else { level = Math.max(0, level - rand(0.05, 0.2)); }
      let coolerStatus = latest.coolerStatus;
      if (temp > target + 0.5) { coolerStatus = "on"; temp = Math.max(target, temp - rand(0.1, 0.3)); }
      else if (temp <= target) { coolerStatus = "off"; temp = Math.min(target + 2, temp + rand(0.02, 0.08)); }
      let filterStatus = latest.filterStatus;
      if (latest.filterMode === "auto") {
        if (level <= 20) { filterStatus = "on"; await SystemLog.create({ module: "water-chiller", level: "warning", message: `Auto: Chiller filter turned ON — level low at ${level.toFixed(1)}%`, details: { level } }); }
        else if (level >= 98) { filterStatus = "off"; await SystemLog.create({ module: "water-chiller", level: "info", message: `Auto: Chiller filter turned OFF — tank full at ${level.toFixed(1)}%`, details: { level } }); }
      }
      const litersUsed = Math.max(0, (latest.capacityLiters * latest.levelPercent / 100) - (latest.capacityLiters * level / 100));
      await WaterChillerStatus.create({ levelPercent: Math.round(level * 10) / 10, temperature: Math.round(temp * 10) / 10, targetTemperature: target, filterStatus, filterMode: latest.filterMode, coolerStatus, capacityLiters: latest.capacityLiters, currentLiters: Math.round(latest.capacityLiters * level / 100), timestamp: new Date() });
      if (waterClillerCounter % 3 === 0){
        await ChillerUsageRecord.create({ timestamp: new Date(), levelPercent: Math.round(level * 10) / 10, temperature: Math.round(temp * 10) / 10, litersUsed: Math.round(litersUsed * 10) / 10, filterStatus, coolerStatus });
      }
      // for cleanup
      if (waterClillerCounter === 1000) { waterClillerCounter= 0 };
    } catch (err: any) { console.error("[sim] chiller error:", err.message); }
  }

  async function simulateLights() {
    try {
      const groups = await LightGroup.find();
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      for (const group of groups) {
        if (group.mode === "always-on") { if (!group.isOn) await LightGroup.updateOne({ groupId: group.groupId }, { isOn: true, lastUpdated: now }); continue; }
        if (group.mode === "manual") continue;
        let shouldBeOn = false;
        for (const schedule of group.schedules) {
          const [sh, sm] = schedule.startTime.split(":").map(Number);
          const [eh, em] = schedule.endTime.split(":").map(Number);
          const start = sh * 60 + sm, end = eh * 60 + em;
          if (start <= end) { if (currentTime >= start && currentTime < end) shouldBeOn = true; }
          else { if (currentTime >= start || currentTime < end) shouldBeOn = true; }
        }
        if (shouldBeOn !== group.isOn) {
          await LightGroup.updateOne({ groupId: group.groupId }, { isOn: shouldBeOn, lastUpdated: now });
          await SystemLog.create({ module: "lights", level: "info", message: `Auto: "${group.name}" lights turned ${shouldBeOn ? "ON" : "OFF"} by schedule`, details: { groupId: group.groupId } });
        }
      }
    } catch (err: any) { console.error("[sim] lights error:", err.message); }
  }

  async function simulatePower() {
    try {
      const rooms = await RoomPower.find();
      const isPeakHour = new Date().getHours() >= 18;
      for (const room of rooms) {
        if (room.occupancyStatus === "vacant") {
          const watts = rand(5, 30);
          await RoomPower.updateOne({ roomId: room.roomId }, { currentWatts: Math.round(watts), todayKwh: Math.round((room.todayKwh + watts / 1000) * 100) / 100, monthKwh: Math.round((room.monthKwh + watts / 1000) * 100) / 100, isAnomaly: false, lastUpdated: new Date() });
          await PowerUsageRecord.create({ roomId: room.roomId, watts, kwh: watts / 1000 });
          continue;
        }
        if (room.occupancyStatus === "holiday") {
          const watts = room.currentWatts > 0 ? room.currentWatts : rand(20, 80);
          const isAnomaly = watts > 50;
          await RoomPower.updateOne({ roomId: room.roomId }, { currentWatts: Math.round(watts), todayKwh: Math.round((room.todayKwh + watts / 1000) * 100) / 100, monthKwh: Math.round((room.monthKwh + watts / 1000) * 100) / 100, isAnomaly, anomalyReason: isAnomaly ? "Holiday period — appliance may be left on" : undefined, lastUpdated: new Date() });
          if (isAnomaly) {
            const existing = await SystemLog.findOne({ module: "power", level: "warning", "details.roomId": room.roomId, timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) } });
            if (!existing) await SystemLog.create({ module: "power", level: "warning", message: `Anomaly: Room ${room.roomName} consuming ${Math.round(watts)}W during holiday`, details: { roomId: room.roomId, watts } });
          }
          await PowerUsageRecord.create({ roomId: room.roomId, watts, kwh: watts / 1000 });
          continue;
        }
        const watts = Math.round((isPeakHour ? rand(400, 900) : rand(150, 400)) + rand(-50, 50));
        const isAnomaly = watts > 1500;
        await RoomPower.updateOne({ roomId: room.roomId }, { currentWatts: watts, todayKwh: Math.round((room.todayKwh + watts / 1000) * 100) / 100, monthKwh: Math.round((room.monthKwh + watts / 1000) * 100) / 100, isAnomaly, anomalyReason: isAnomaly ? "Unusually high power draw" : undefined, lastUpdated: new Date() });
        await PowerUsageRecord.create({ roomId: room.roomId, watts, kwh: watts / 1000 });
      }
    } catch (err: any) { console.error("[sim] power error:", err.message); }
  }

  export function startSimulator() {
    console.log("[sim] IoT simulator started");
    setInterval(simulateWaterTank, 30000);
    setInterval(simulateWaterChiller, 30000);
    setInterval(simulateLights, 60000);
    setInterval(simulatePower, 3600000);
    simulateWaterTank();
    simulateWaterChiller();
    simulateLights();
    simulatePower();
  }
  