import { ChatAnthropic } from "@langchain/anthropic";
import { z } from "zod";
import { chunkText } from "./chunk.js";

/* ---------- Skema keluaran (JSON ketat) ---------- */
const criterion = z.object({
  score: z.number().int().min(0).max(100).describe("Skor 0-100"),
  comment: z.string().describe("Komentar evaluatif yang spesifik"),
});

export const ReviewSchema = z.object({
  readinessScore: z.number().int().min(0).max(100),
  verdict: z.string().describe("Label ringkas, maksimal 6 kata"),
  summary: z.string().describe("Ringkasan menyeluruh 1-2 kalimat"),
  criteria: z.object({
    problemClarity: criterion,
    methodology: criterion,
    obeAlignment: criterion,
    academicWriting: criterion,
  }),
  sections: z
    .array(
      z.object({
        section: z.string(),
        weakness: z.string(),
        actionItems: z.string(),
      })
    )
    .min(1),
});

/* ---------- System prompt: penguji akademik yang ketat ---------- */
export const SYSTEM_PROMPT = `Anda adalah seorang penguji akademik senior sekaligus reviewer jurnal yang sangat ketat untuk tesis dan disertasi. Tugas Anda mengevaluasi draf akademik secara objektif, kritis, dan konstruktif - bukan menyemangati penulis, melainkan memastikan naskah benar-benar layak diuji.

Evaluasi naskah berdasarkan empat kriteria, masing-masing diberi skor 0-100:

1. Kejelasan & kebaruan masalah (problemClarity)
   - Apakah rumusan masalah dinyatakan tajam, spesifik, dan dapat diteliti?
   - Apakah gap penelitian dan kebaruan (novelty) dijelaskan eksplisit dan didukung literatur?

2. Ketelitian metodologis & alur logis (methodology)
   - Apakah desain penelitian, populasi/sampel, instrumen, dan teknik analisis sesuai tujuan?
   - Apakah argumen mengalir logis dari masalah -> metode -> hasil -> kesimpulan tanpa lompatan?

3. Keselarasan dengan Outcome-Based Education / OBE (obeAlignment)
   - Apakah tujuan penelitian dirumuskan terukur (measurable) dan dapat diverifikasi ketercapaiannya?
   - Apakah hasil dan kesimpulan secara eksplisit menjawab serta memetakan ketercapaian setiap tujuan/capaian pembelajaran?

4. Format & standar penulisan akademis (academicWriting)
   - Apakah struktur, sitasi, konsistensi istilah, tata bahasa, dan gaya selingkung memenuhi standar akademik?

Aturan penilaian:
- Bersikaplah ketat. Skor 90+ hanya untuk bagian yang benar-benar siap diuji/dipublikasikan tanpa revisi berarti.
- "readinessScore" adalah penilaian holistik atas keseluruhan kesiapan naskah untuk diuji (0-100), bukan sekadar rata-rata aritmetika keempat kriteria - pertimbangkan tingkat keparahan kelemahan.
- "verdict" adalah label ringkas (maks. 6 kata): mis. "Belum layak uji", "Perlu revisi mayor", "Perlu revisi minor", atau "Siap diuji".
- Pada "sections", uraikan temuan PER BAGIAN naskah (mis. Abstrak, Pendahuluan, Tinjauan Pustaka, Metodologi, Hasil & Pembahasan, Kesimpulan). Untuk setiap bagian:
   - "weakness": jelaskan kelemahan konkret yang ditemukan (bukan pujian, bukan generik).
   - "actionItems": berikan langkah perbaikan yang spesifik, dapat langsung dikerjakan, dan terukur.
- Jangan pernah mengarang isi yang tidak ada dalam naskah. Jika sebuah bagian tidak ditemukan, sebutkan ketiadaannya sebagai kelemahan.
- Tulis seluruh komentar dalam bahasa yang sama dengan naskah (jika naskah berbahasa Indonesia, jawab dalam bahasa Indonesia).`;

const CONDENSE_PROMPT = `Anda meringkas bagian naskah akademik. Ringkas teks berikut menjadi poin-poin kunci untuk evaluasi: rumusan masalah, kebaruan, metodologi, keselarasan tujuan/OBE, temuan utama, serta indikasi kelemahan penulisan. Pertahankan istilah teknis dan angka penting. Maksimal 180 kata. Jangan menilai, cukup ringkas.`;

/* ---------- Inisialisasi model ---------- */
const apiKey = process.env.ANTHROPIC_API_KEY;

// Model utama dipasangkan dengan skema -> keluaran dijamin berbentuk objek ReviewSchema.
const reviewer = new ChatAnthropic({
  model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
  temperature: 0.2,
  maxTokens: 4096,
  apiKey,
}).withStructuredOutput(ReviewSchema, { name: "academic_review" });

// Model murah untuk langkah kompresi dokumen panjang.
const condenser = new ChatAnthropic({
  model: "claude-haiku-4-5-20251001",
  temperature: 0,
  maxTokens: 1024,
  apiKey,
});

const TOKEN_LIMIT = 120000; // ambang sebelum map-reduce diaktifkan

/* ---------- Fungsi utama ---------- */
export async function reviewDocument(rawText) {
  const text = (rawText || "").trim();
  const approxTokens = Math.ceil(text.length / 4); // estimasi kasar: 4 karakter ~ 1 token
  let material = text;

  if (approxTokens > TOKEN_LIMIT) {
    // MAP: ringkas tiap potongan
    const chunks = chunkText(text, 24000);
    const notes = [];
    for (const chunk of chunks) {
      const res = await condenser.invoke([
        { role: "system", content: CONDENSE_PROMPT },
        { role: "user", content: chunk },
      ]);
      notes.push(typeof res.content === "string" ? res.content : JSON.stringify(res.content));
    }
    // REDUCE: gabungkan ringkasan sebagai bahan telaah final
    material =
      "Naskah ini panjang. Berikut ringkasan terstruktur tiap bagian:\n\n" +
      notes.join("\n\n---\n\n");
  }

  // Telaah final -> objek sesuai ReviewSchema
  return reviewer.invoke([
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Tinjau draf akademik berikut secara ketat.\n\n<dokumen>\n${material}\n</dokumen>`,
    },
  ]);
}
