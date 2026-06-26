import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL?.split(",") || "*" }));
app.use(express.json({ limit: "1mb" }));

// Batasi laju permintaan ke API
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/reviews", reviewRoutes);

// Penangan error terpusat (termasuk error Multer)
app.use((err, _req, res, _next) => {
  console.error(err);
  const isClientError =
    err.code === "LIMIT_FILE_SIZE" || /PDF atau DOCX|tidak didukung/.test(err.message || "");
  res.status(isClientError ? 400 : 500).json({ error: err.message || "Terjadi kesalahan server." });
});

// Opsi single-server: sajikan build frontend di produksi
if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "../../client/dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`\u2713 API berjalan di http://localhost:${PORT}`)))
  .catch((e) => {
    console.error("Gagal memulai server:", e);
    process.exit(1);
  });
