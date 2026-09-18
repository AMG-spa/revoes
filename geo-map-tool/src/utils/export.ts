import { jsPDF } from 'jspdf';
import 'svg2pdf.js';

export async function exportPdf(svg: SVGSVGElement, widthMm: number, heightMm: number, filename = 'mappa.pdf') {
  const pdf = new jsPDF({
    orientation: widthMm >= heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
  });
  await pdf.svg(svg.cloneNode(true) as SVGSVGElement, { x: 0, y: 0, width: widthMm, height: heightMm });
  pdf.save(filename);
}
