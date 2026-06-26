import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI belum diset di .env");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("\u2713 MongoDB terhubung");
}
