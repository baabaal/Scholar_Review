import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X } from "lucide-react";
import { api } from "../lib/api.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((accepted) => {
    setError("");
    if (accepted?.[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  async function analyze() {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      // Jangan set Content-Type manual: axios otomatis menambahkan boundary multipart.
      const { data } = await api.post("/reviews/analyze", form);
      navigate(`/hasil/${data.id}`, { state: data });
    } catch (e) {
      setError(e?.response?.data?.error || "Gagal menganalisis dokumen.");
      setAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-xl text-center"
        >
          <p className="text-xs font-medium tracking-wide text-accent mb-3">
            Peninjau draf akademik bertenaga AI
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Tinjau tesis &amp; disertasi Anda
          </h1>
          <p className="mt-3 text-neutral-500 leading-relaxed">
            Unggah draf Anda dan dapatkan skor kesiapan beserta umpan balik akademis
            yang ketat dalam hitungan detik.
          </p>

          {/* Zona seret & lepas */}
          <div
            {...getRootProps()}
            className={`mt-10 cursor-pointer rounded-3xl border-2 border-dashed bg-white px-6 py-14 shadow-soft transition-all duration-300
              ${isDragActive
                ? "border-accent bg-accent-soft scale-[1.01]"
                : "border-neutral-200 hover:border-neutral-300"}`}
          >
            <input {...getInputProps()} />
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <UploadCloud className="h-7 w-7" />
            </div>

            {file ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 text-sm text-neutral-700">
                <FileText className="h-4 w-4" /> {file.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="ml-1 rounded-full p-1 hover:bg-neutral-200"
                  aria-label="Hapus file"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <p className="font-medium text-neutral-800">Seret &amp; lepas dokumen Anda di sini</p>
                <p className="mt-1 text-sm text-neutral-400">atau klik untuk memilih file</p>
              </>
            )}

            <p className="mt-5 text-xs text-neutral-400">PDF atau DOCX &middot; maks. 25 MB</p>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={!file}
            onClick={analyze}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-soft transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            Analisis dokumen
          </motion.button>
        </motion.div>
      </main>

      {/* Overlay glow saat AI menganalisis */}
      <AnimatePresence>{analyzing && <LoadingOverlay />}</AnimatePresence>
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-neutral-900 text-white grid place-items-center text-xs font-semibold">
          SR
        </div>
        <span className="font-semibold tracking-tight">Scholar Review</span>
      </div>
      <nav className="hidden sm:flex gap-6 text-sm text-neutral-500">
        <span>Beranda</span>
        <span>Riwayat</span>
        <span>Bantuan</span>
      </nav>
    </header>
  );
}
