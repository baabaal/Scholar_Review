import mammoth from "mammoth";
import { createRequire } from "module";

// pdf-parse adalah modul CommonJS. Impor file lib internalnya secara langsung
// untuk menghindari "debug mode" pada index.js yang membaca file uji & error.
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

export async function extractText(buffer, mimetype = "", filename = "") {
  const name = filename.toLowerCase();
  const isPdf = mimetype.includes("pdf") || name.endsWith(".pdf");
  const isDocx =
    mimetype.includes("officedocument") ||
    mimetype.includes("word") ||
    name.endsWith(".docx");

  if (isPdf) {
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (isDocx) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  throw new Error("Format tidak didukung. Gunakan PDF atau DOCX.");
}
