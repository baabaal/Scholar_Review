import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType,
} from "docx";
import PDFDocument from "pdfkit";

const CRITERIA_LABELS = {
  problemClarity: "Kejelasan & kebaruan masalah",
  methodology: "Ketelitian metodologis & alur logis",
  obeAlignment: "Keselarasan dengan OBE",
  academicWriting: "Format & penulisan akademis",
};

/* ============ DOCX ============ */
export async function generateDocxBuffer(review) {
  const headerCells = ["Bagian", "Kelemahan yang Diidentifikasi", "Tambahan / Item Tindakan"].map(
    (t) =>
      new TableCell({
        shading: { fill: "111111" },
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: "FFFFFF" })] })],
      })
  );

  const rows = [
    new TableRow({ tableHeader: true, children: headerCells }),
    ...review.sections.map(
      (s) =>
        new TableRow({
          children: [s.section, s.weakness, s.actionItems].map(
            (t) => new TableCell({ children: [new Paragraph(t || "-")] })
          ),
        })
    ),
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "Laporan Ulasan Draf Akademik", heading: HeadingLevel.TITLE }),
          new Paragraph({ children: [new TextRun({ text: review.filename || "Dokumen", italics: true, color: "666666" })] }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Skor Kesiapan: ", bold: true }),
              new TextRun({ text: `${review.readinessScore}/100  `, bold: true, size: 28 }),
              new TextRun({ text: `(${review.verdict})`, color: "2F6BED" }),
            ],
          }),
          new Paragraph({ text: review.summary || "" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Rincian Kriteria", heading: HeadingLevel.HEADING_1 }),
          ...Object.entries(review.criteria).flatMap(([key, c]) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${CRITERIA_LABELS[key] || key}: `, bold: true }),
                new TextRun({ text: `${c.score}/100` }),
              ],
            }),
            new Paragraph({ children: [new TextRun({ text: c.comment, color: "444444" })] }),
          ]),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Ulasan per Bagian", heading: HeadingLevel.HEADING_1 }),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc); // -> Buffer, dikirim via res.send()
}

/* ============ PDF (streaming) ============ */
export function streamReviewPdf(review, res) {
  const doc = new PDFDocument({ size: "A4", margin: 56 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="laporan-ulasan-${review._id}.pdf"`);
  doc.pipe(res);

  doc.fontSize(22).fillColor("#111111").text("Laporan Ulasan Draf Akademik");
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor("#666666").text(review.filename || "Dokumen");
  doc.moveDown(1);

  doc.fontSize(14).fillColor("#111111").text(`Skor Kesiapan: ${review.readinessScore}/100`, { continued: true });
  doc.fillColor("#2F6BED").text(`    ${review.verdict}`);
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#333333").text(review.summary || "");
  doc.moveDown(1);

  doc.fontSize(15).fillColor("#111111").text("Rincian Kriteria");
  doc.moveDown(0.5);
  Object.entries(review.criteria).forEach(([key, c]) => {
    doc.fontSize(12).fillColor("#111111").text(`${CRITERIA_LABELS[key] || key}: ${c.score}/100`);
    doc.fontSize(10.5).fillColor("#555555").text(c.comment);
    doc.moveDown(0.5);
  });

  doc.moveDown(0.5);
  doc.fontSize(15).fillColor("#111111").text("Ulasan per Bagian");
  doc.moveDown(0.5);
  review.sections.forEach((s, i) => {
    doc.fontSize(12).fillColor("#111111").text(`${i + 1}. ${s.section}`);
    doc.fontSize(10.5).fillColor("#A32D2D").text(`Kelemahan: ${s.weakness}`);
    doc.fontSize(10.5).fillColor("#1F6F43").text(`Tindakan: ${s.actionItems}`);
    doc.moveDown(0.6);
  });

  doc.end(); // mengakhiri stream
}
