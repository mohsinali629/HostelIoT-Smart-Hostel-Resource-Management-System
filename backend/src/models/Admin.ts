import { mongoose } from "../lib/mongodb";
  import bcrypt from "bcryptjs";

  const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: "admin" },
    createdAt: { type: Date, default: Date.now },
  });

  adminSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password as string, 10);
  });

  adminSchema.methods.comparePassword = async function (candidate: string) {
    return bcrypt.compare(candidate, this.password);
  };

  export const Admin = mongoose.model("Admin", adminSchema);
  