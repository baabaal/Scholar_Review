import multer from "multer";

const MAX_MB = Number(process.env.MAX_FILE_MB || 25);

const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]);

export const upload = multer({
  storage: multer.memoryStorage(), // simpan di RAM; buffer langsung dipakai ekstraktor
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) return cb(null, true);
    cb(new Error("Hanya file PDF atau DOCX yang diperbolehkan."));
  },
});
