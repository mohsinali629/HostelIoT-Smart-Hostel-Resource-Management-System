import { Admin } from "../models/Admin";
  import { LightGroup } from "../models/Lights";
  import { RoomPower } from "../models/Power";
  import { WaterTankStatus } from "../models/WaterTank";
  import { WaterChillerStatus } from "../models/WaterChiller";
  import { SystemLog } from "../models/SystemLog";

  export async function seedDatabase() {
    try {
      if (await Admin.countDocuments() === 0) {
        await Admin.create({ email: "mohsin123@gmail.com", password: "mohsin123", name: "Admin User", role: "admin" });
        console.log("[seed] Admin user seeded: mohsin123@gmail.com / mohsin123");
      }

      if (await WaterTankStatus.countDocuments() === 0) {
        await WaterTankStatus.create({ levelPercent: 72, motorStatus: "off", motorMode: "auto", warningTriggered: false, autoTriggered: false, capacityLiters: 5000, currentLiters: 3600 });
        console.log("[seed] Water tank seeded");
      }

      if (await WaterChillerStatus.countDocuments() === 0) {
        await WaterChillerStatus.create({ levelPercent: 65, temperature: 22.5, targetTemperature: 20, filterStatus: "auto", filterMode: "auto", coolerStatus: "on", capacityLiters: 500, currentLiters: 325 });
        console.log("[seed] Water chiller seeded");
      }

      if (await LightGroup.countDocuments() === 0) {
        await LightGroup.insertMany([
          { groupId: "critical", name: "Critical Lights", type: "critical", isOn: true, mode: "always-on", schedules: [], lightCount: 18, description: "Security lights, entrance gates, and shaded pathway lighting — always on for safety", locations: ["Main Gate", "Parking Area", "Shaded Walkways", "Emergency Exits", "Warden Office"] },
          { groupId: "common", name: "Common Area Lights", type: "common", isOn: false, mode: "auto", schedules: [{ startTime: "18:00", endTime: "06:00", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] }], lightCount: 32, description: "Staircase, corridor corners, and common hall lighting — active evening to morning", locations: ["All Staircases", "Corridor Junctions", "Common Hall", "Laundry Area"] },
          { groupId: "support", name: "Wing Support Lights", type: "support", isOn: false, mode: "auto", schedules: [{ startTime: "19:00", endTime: "23:59", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] }, { startTime: "04:00", endTime: "06:00", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] }], lightCount: 48, description: "Wing corridor lights for A, B, C, D wings — on during peak student activity hours", locations: ["Wing A Corridor", "Wing B Corridor", "Wing C Corridor", "Wing D Corridor"] },
        ]);
        console.log("[seed] Light groups seeded");
      }

      if (await RoomPower.countDocuments() === 0) {
        const wings = ["A", "B", "C", "D"];
        const rooms: any[] = [];
        for (const wing of wings) {
          for (let floor = 1; floor <= 3; floor++) {
            for (let num = 1; num <= 6; num++) {
              const roomId = `${wing}${floor}0${num}`;
              const statuses = ["occupied", "occupied", "occupied", "occupied", "vacant", "holiday"] as const;
              const status = statuses[Math.floor(Math.random() * statuses.length)];
              const baseWatts = status === "occupied" ? Math.floor(Math.random() * 600 + 200) : status === "holiday" ? Math.floor(Math.random() * 100 + 10) : Math.floor(Math.random() * 20 + 5);
              rooms.push({ roomId, roomName: `Room ${wing}${floor}0${num}`, floor, wing, currentWatts: baseWatts, todayKwh: Math.round(baseWatts * 8 / 1000 * 100) / 100, monthKwh: Math.round(baseWatts * 200 / 1000 * 100) / 100, isAnomaly: status === "holiday" && baseWatts > 50, anomalyReason: status === "holiday" && baseWatts > 50 ? "Holiday period — appliance may be left on" : undefined, occupancyStatus: status, lastUpdated: new Date() });
            }
          }
        }
        await RoomPower.insertMany(rooms);
        console.log(`[seed] ${rooms.length} rooms seeded`);
      }

      if (await SystemLog.countDocuments() === 0) {
        await SystemLog.insertMany([
          { module: "system", level: "info", message: "IoT Management System initialized", timestamp: new Date(Date.now() - 3600000) },
          { module: "water-tank", level: "warning", message: "Warning: Water level low at 23.5%", timestamp: new Date(Date.now() - 1800000) },
          { module: "water-tank", level: "info", message: "Auto: Motor turned ON — critically low at 14.8%", timestamp: new Date(Date.now() - 1700000) },
          { module: "water-chiller", level: "info", message: "Target temperature set to 20°C", timestamp: new Date(Date.now() - 1200000) },
          { module: "lights", level: "info", message: 'Auto: "Common Area Lights" turned ON by schedule', timestamp: new Date(Date.now() - 600000) },
          { module: "power", level: "warning", message: "Anomaly: Room B302 consuming 87W during holiday", timestamp: new Date(Date.now() - 300000) },
        ]);
        console.log("[seed] System logs seeded");
      }

      console.log("[seed] Database seeding complete");
    } catch (err: any) {
      console.error("[seed] Error:", err.message);
    }
  }
  