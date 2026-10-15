// src/lib/export/pdf-generator.ts - Technical Catalog PDF Generator for DeltaFix
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ProductItem, StandardDimension } from '../standards/types';

export async function generateTechnicalDatasheetPdf(
  product: ProductItem,
  dimension: StandardDimension,
  elementIdToCapture: string = 'cad-drawing-container'
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  let currentY = 14;

  // 1. Executive Industrial Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, currentY, pageWidth - margin * 2, 22, 'F');

  doc.setTextColor(245, 158, 11); // Amber
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DELTA PARAFUSOS ESPECIAIS', margin + 6, currentY + 9);

  doc.setTextColor(148, 163, 184); // Slate-400
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('FOLHA TÉCNICA DE ENGENHARIA & CATÁLOGO EXECUTIVO', margin + 6, currentY + 16);

  // Revision / Date Box on right
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text(`DOC: DF-${Date.now().toString().slice(-6)}`, pageWidth - margin - 55, currentY + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`EMISSÃO: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 55, currentY + 16);

  currentY += 26;

  // 2. Product Title & Key Information
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, currentY, pageWidth - margin * 2, 16, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, currentY, pageWidth - margin * 2, 16, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`${product.standard_code} - ${product.bitola} ${product.comprimento ? `x ${product.comprimento}mm` : ''}`, margin + 5, currentY + 6);

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(2, 132, 199); // Sky-600
  doc.text(`SKU: ${product.sku_gerado}`, margin + 5, currentY + 12);

  if (product.codigo_interno_delta) {
    doc.setTextColor(100, 116, 139);
    doc.text(`REF INTERNA: ${product.codigo_interno_delta}`, pageWidth - margin - 65, currentY + 12);
  }

  currentY += 20;

  // 3. Vector CAD Blueprint Capture
  try {
    const cadElement = document.getElementById(elementIdToCapture);
    if (cadElement) {
      const canvas = await html2canvas(cadElement, {
        scale: 2,
        backgroundColor: '#090d16',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const imgHeight = 65;
      const imgWidth = pageWidth - margin * 2;
      doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 6;
    }
  } catch (err) {
    console.error('Failed to capture CAD canvas for PDF:', err);
    currentY += 10;
  }

  // 4. Dimensional Specifications Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. MATRIZ DIMENSIONAL NORMATIVA (DIN / ISO)', margin, currentY);
  currentY += 4;

  const colWidth = (pageWidth - margin * 2) / 6;
  const tableData = [
    { label: 'Bitola (d)', val: `Ø${dimension.diametro_nominal} mm` },
    { label: 'Passo (P)', val: `${dimension.passo || '-'} mm` },
    { label: 'Chave (s)', val: `${dimension.chave || dimension.diametro_cabeca || '-'} mm` },
    { label: 'Altura (k/m)', val: `${dimension.altura_cabeca || dimension.espessura || '-'} mm` },
    { label: 'Compr. (L)', val: product.comprimento ? `${product.comprimento} mm` : '-' },
    { label: 'Rosca (b)', val: product.comprimento_rosca_b ? `${product.comprimento_rosca_b} mm` : 'Total' }
  ];

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY, pageWidth - margin * 2, 14, 'F');
  doc.rect(margin, currentY, pageWidth - margin * 2, 14, 'S');

  tableData.forEach((item, index) => {
    const x = margin + index * colWidth;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, x + 3, currentY + 5);

    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(item.val, x + 3, currentY + 10.5);
  });

  currentY += 18;

  // 5. Materials, Treatment & Physical Weights
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. ESPECIFICAÇÃO DE MATERIAL & ANÁLISE DE RENDIMENTO', margin, currentY);
  currentY += 4;

  const specBoxWidth = (pageWidth - margin * 2 - 6) / 2;

  // Left Box: Material & Coating
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, specBoxWidth, 32, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Metalurgia & Tratamento:', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`• Classe de Resistência: ${product.classe_resistencia}`, margin + 4, currentY + 12);
  doc.text(`• Material Base: ${product.material_base}`, margin + 4, currentY + 18);
  doc.text(`• Tratamento Superficial: ${product.tratamento_superficial}`, margin + 4, currentY + 24);
  doc.text(`• Norma Dimensional: ${product.standard_code} Sistema Métrico`, margin + 4, currentY + 29);

  // Right Box: Weight & Scrap
  doc.rect(margin + specBoxWidth + 6, currentY, specBoxWidth, 32, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Massa Unitária & Fator de Perda:', margin + specBoxWidth + 10, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`• Peso Líquido Unitário: ${(product.peso_liquido_kg * 1000).toFixed(2)} g (${product.peso_liquido_kg.toFixed(4)} kg)`, margin + specBoxWidth + 10, currentY + 12);
  doc.text(`• Peso Bruto Matéria-Prima: ${(product.peso_bruto_kg * 1000).toFixed(2)} g (${product.peso_bruto_kg.toFixed(4)} kg)`, margin + specBoxWidth + 10, currentY + 18);
  doc.text(`• Fator de Perda / Cavaco: ${product.fator_perda_percentual}%`, margin + specBoxWidth + 10, currentY + 24);
  doc.text(`• Peso por Milheiro (1.000 un): ${(product.peso_liquido_kg * 1000).toFixed(1)} kg`, margin + specBoxWidth + 10, currentY + 29);

  currentY += 36;

  // 6. MES Industrial Routing & BOM Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. ROTEIRO PADRÃO DE MANUFATURA (MES / ERP)', margin, currentY);
  currentY += 4;

  const routings = [
    { op: 'Op 10', name: 'Corte de Tarugo (Serra CNC)', center: 'CORTE-01', cycle: '15s' },
    { op: 'Op 20', name: 'Usinagem CNC & Cabeceamento', center: 'CNC-ROMI', cycle: '40s' },
    { op: 'Op 30', name: 'Laminação de Rosca (Conformação)', center: 'LAMIN-30T', cycle: '8s' },
    { op: 'Op 40', name: 'Tratamento Térmico (Têmpera/Rev.)', center: 'FORNO-01', cycle: 'Lote' },
    { op: 'Op 50', name: `Galvanoplastia (${product.tratamento_superficial.slice(0, 15)})`, center: 'GALV-01', cycle: 'Banho' },
    { op: 'Op 60', name: 'Inspeção CQ & Embalagem VCI', center: 'CQ-POSTO', cycle: 'AQL' }
  ];

  const routingColW = (pageWidth - margin * 2) / routings.length;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY, pageWidth - margin * 2, 16, 'F');
  doc.rect(margin, currentY, pageWidth - margin * 2, 16, 'S');

  routings.forEach((r, i) => {
    const rx = margin + i * routingColW;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(2, 132, 199);
    doc.text(r.op, rx + 2, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(r.name.slice(0, 16), rx + 2, currentY + 9);

    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(`${r.center} (${r.cycle})`, rx + 2, currentY + 13);
  });

  currentY += 22;

  // 7. Quality Inspection & Title Block Signoff
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, pageWidth - margin * 2, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CONTROLE DE QUALIDADE & APROVAÇÃO TÉCNICA', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('• Inspeção Dimensional Conforme NBR ISO 3269 / NBR 5426 (AQL 0.65)', margin + 4, currentY + 11);
  doc.text('• Rastreabilidade de Corrida de Aço & Certificado de Conformidade Tipo 3.1 conforme EN 10204', margin + 4, currentY + 15);

  doc.setTextColor(245, 158, 11);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.text('[APROVADO ENGENHARIA]', pageWidth - margin - 48, currentY + 11);

  // Save the PDF with guaranteed .pdf extension via Blob download
  const safeSku = (product.sku_gerado || 'PRODUTO').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `DeltaFix_FolhaTecnica_${safeSku}.pdf`;

  try {
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  } catch (_) {
    doc.save(filename);
  }
}
