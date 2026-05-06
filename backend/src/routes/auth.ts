import { Router } from "express";
  import { Admin } from "../models/Admin";
  import { SystemLog } from "../models/SystemLog";

  const router = Router();

  router.post("/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const admin = await Admin.findOne({ email: email.toLowerCase() });
      if (!admin) return res.status(401).json({ error: "Invalid email or password" });
      const valid = await (admin as any).comparePassword(password);
      if (!valid) return res.status(401).json({ error: "Invalid email or password" });
      (req.session as any).adminId = admin._id.toString();
      (req.session as any).adminEmail = admin.email;
      await SystemLog.create({ module: "auth", level: "info", message: `Admin login: ${admin.email}` });
      return res.json({ id: admin._id.toString(), email: admin.email, name: admin.name, role: admin.role });
    } catch (err) {
      console.error("[auth] login error", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post("/auth/logout", (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  router.get("/auth/me", async (req, res) => {
    const adminId = (req.session as any).adminId;
    if (!adminId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const admin = await Admin.findById(adminId);
      if (!admin) return res.status(401).json({ error: "Unauthorized" });
      return res.json({ id: admin._id.toString(), email: admin.email, name: admin.name, role: admin.role });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  export default router;
  