import { motion } from "framer-motion";

export default function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-sm"
    >
      <div className="relative">
        {/* Cahaya (glow) berdenyut di belakang kartu */}
        <motion.div
          aria-hidden
          className="absolute -inset-16 rounded-full bg-accent/30 blur-3xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex flex-col items-center gap-5 rounded-3xl border border-neutral-100 bg-white px-10 py-9 shadow-soft">
          <motion.div
            className="h-12 w-12 rounded-full border-2 border-neutral-200 border-t-accent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="text-center">
            <p className="font-medium text-neutral-900">Menganalisis dokumen...</p>
            <motion.p
              className="mt-1 text-sm text-neutral-400"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              AI sedang menilai kejelasan, metodologi &amp; keselarasan OBE
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
