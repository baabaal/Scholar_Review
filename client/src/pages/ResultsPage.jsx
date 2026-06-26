import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ArrowLeft, FileText, Loader2 } from "lucide-react";
import { api } from "../lib/api.js";
import ScoreRing from "../components/ScoreRing.jsx";
import ReviewTable from "../components/ReviewTable.jsx";

const CRITERIA = [
  { key: "problemClarity", label: "Kejelasan masalah" },
  { key: "methodology", label: "Metodologi" },
  { key: "obeAlignment", label: "Keselarasan OBE" },
  { key: "academicWriting", label: "Penulisan akademis" },
];

export default function ResultsPage() {
  const { id } = useParams();
  const location = useLocation();
  const [review, setReview] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [exporting, setExporting] = useState("");

  useEffect(() => {
    if (review) return;
    api
      .get(`/reviews/${id}`)
      .then(({ data }) => setReview(data))
      .catch(() => setReview(null))
      .finally(() => setLoading(false));
  }, [id, review]);

  async function exportReport(format) {
    setExporting(format);
    try {
      const res = await api.get(`/reviews/${id}/export`, {
        params: { format },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-ulasan.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting("");
    }
  }

  if (loading)
    return (
      <CenterState>
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </CenterState>
    );
  if (!review) return <CenterState>Ulasan tidak ditemukan.</CenterState>;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <Link to="/" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <span className="inline-flex items-center gap-2 text-sm text-neutral-500">
          <FileText className="h-4 w-4" /> {review.filename}
        </span>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Skor + kriteria */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-8 sm:flex-row sm:gap-12"
        >
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={review.readinessScore} />
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {review.verdict}
            </span>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">Skor kesiapan</h1>
            <p className="mt-2 text-neutral-500 leading-relaxed">{review.summary}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {CRITERIA.map(({ key, label }) => (
                <div key={key} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-soft">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-neutral-500">{label}</span>
                    <span className="text-lg font-semibold">{review.criteria[key].score}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <motion.div
                      className="h-full rounded-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${review.criteria[key].score}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Tabel ulasan */}
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Rincian ulasan per bagian</h2>
          <ReviewTable sections={review.sections} />
        </section>

        {/* Tombol ekspor */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => exportReport("pdf")}
            disabled={!!exporting}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-5 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            {exporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} PDF
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => exportReport("docx")}
            disabled={!!exporting}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-neutral-800 disabled:opacity-50"
          >
            {exporting === "docx" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Buat laporan ulasan
          </motion.button>
        </div>
      </main>
    </div>
  );
}

function CenterState({ children }) {
  return <div className="grid min-h-screen place-items-center text-neutral-500">{children}</div>;
}
