// Pemecah sederhana berbasis paragraf - tanpa dependensi tambahan.
// maxChars ~24.000 setara ~6.000 token per potongan.
export function chunkText(text, maxChars = 24000) {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks = [];
  let current = "";

  for (const p of paragraphs) {
    if (current && (current + "\n\n" + p).length > maxChars) {
      chunks.push(current);
      current = p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
