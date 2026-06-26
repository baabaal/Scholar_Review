import Review from "../models/Review.js";
import { extractText } from "../services/extractText.js";
import { reviewDocument } from "../services/reviewService.js";
import { generateDocxBuffer, streamReviewPdf } from "../services/reportService.js";

/* POST /api/reviews/analyze  (multipart: field "file") */
export async function analyzeDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File tidak ditemukan. Unggah PDF atau DOCX." });
    }

    const text = await extractText(req.file.buffer, req.file.mimetype, req.file.originalname);
    if (!text || text.trim().length < 200) {
      return res
        .status(422)
        .json({ error: "Teks tidak dapat diekstrak atau dokumen terlalu pendek." });
    }

    const review = await reviewDocument(text); // objek sesuai ReviewSchema
    const doc = await Review.create({ filename: req.file.originalname, ...review });

    return res.status(201).json({ id: doc._id, ...review });
  } catch (err) {
    next(err);
  }
}

/* GET /api/reviews/:id */
export async function getReview(req, res) {
  const doc = await Review.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: "Ulasan tidak ditemukan" });
  return res.json({ id: doc._id, ...doc });
}

/* GET /api/reviews/:id/export?format=docx|pdf */
export async function exportReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id).lean();
    if (!review) return res.status(404).json({ error: "Ulasan tidak ditemukan" });

    const format = (req.query.format || "docx").toLowerCase();
    const base = `laporan-ulasan-${review._id}`;

    if (format === "pdf") {
      return streamReviewPdf(review, res); // streaming langsung ke respons
    }

    const buffer = await generateDocxBuffer(review);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${base}.docx"`);
    return res.send(buffer);
  } catch (err) {
    next(err);
  }
}
