import { motion } from "framer-motion";

export default function ReviewTable({ sections = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-soft">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
            <th className="w-1/5 px-5 py-3 font-medium">Bagian</th>
            <th className="w-2/5 px-5 py-3 font-medium">Kelemahan yang Diidentifikasi</th>
            <th className="w-2/5 px-5 py-3 font-medium">Tambahan / Item Tindakan</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="border-b border-neutral-50 align-top last:border-0"
            >
              <td className="px-5 py-4 font-medium text-neutral-900">{s.section}</td>
              <td className="px-5 py-4 text-neutral-500">{s.weakness}</td>
              <td className="px-5 py-4 text-neutral-700">{s.actionItems}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
