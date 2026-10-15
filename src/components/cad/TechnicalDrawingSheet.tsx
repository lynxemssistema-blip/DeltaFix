// src/components/cad/TechnicalDrawingSheet.tsx - Hand-Drafted Classical Mechanical Drawing Sheet A3 Landscape (Nanquim sobre papel)
'use client';

import React, { useRef, useState } from 'react';
import { ProductItem, StandardDimension } from '@/lib/standards/types';
import { DeltaLogo } from '@/components/ui/DeltaLogo';
import { Printer, Download, Eye, ZoomIn, ZoomOut, CheckCircle2, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TechnicalDrawingSheetProps {
  product: ProductItem;
  dimension: StandardDimension;
  onDimensionClick?: (dim: string) => void;
}

export function TechnicalDrawingSheet({
  product,
  dimension,
  onDimensionClick
}: TechnicalDrawingSheetProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedCota, setSelectedCota] = useState<string | null>('L');
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const d = dimension.diametro_nominal || 30;
  const P = dimension.passo || 3.5;
  const L = product.comprimento || 250;
  const k = dimension.altura_cabeca || 18.7;
  const s = dimension.chave || 46;
  const e = dimension.vertice || Number((s * 1.1547).toFixed(2));
  const b = product.comprimento_rosca_b ?? (product.standard_code === 'DIN 933' ? L : Math.min(2 * d + 6, L));

  // Drawing Sheet Dimensions: A3 Landscape (420 x 297 mm -> 1587 x 1122 px at 96 DPI)
  const sheetWidth = 1587;
  const sheetHeight = 1122;

  // Auto-Scale Bounding Box calculation:
  // Center drawing area is X: 80 to 1100, Y: 180 to 860
  // Part total length is L + k. Max available horizontal span ~ 700px.
  // We compute a dynamic scale factor so both short (e.g. M30x60) and long (e.g. M30x400) bolts render with optimal proportion
  const totalLength = L + k;
  const targetGraphicWidth = 620;
  const autoScale = Math.min(Math.max(targetGraphicWidth / Math.max(totalLength, 120), 1.1), 3.2);

  const scL = L * autoScale;
  const scK = k * autoScale;
  const scD = d * autoScale;
  const scS = s * autoScale;
  const scE = e * autoScale;
  const scB = b * autoScale;

  // Main Bolt Origin in SVG
  const boltOriginX = 260;
  const boltOriginY = 540;

  // Front Axial View Origin
  const frontViewX = Math.min(boltOriginX + scL + 240, 1050);
  const frontViewY = 540;

  const handleCotaSelect = (cota: string) => {
    setSelectedCota(cota);
    if (onDimensionClick) onDimensionClick(cota);
  };

  // High Definition A3/A4 PDF Export
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('deltafix-hand-drafted-sheet');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2, // 2x for crisp 300 DPI nanquim print
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a3'
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 420, 297);
      pdf.save(`DeltaFix_Prancha_A3_${product.sku_gerado}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Erro ao exportar PDF da prancha técnica.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Google Fonts Import for Engineering Calligraphy */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Roboto+Condensed:wght@400;600;700;800&family=Oswald:wght@500;700&display=swap');

        .font-engineer {
          font-family: 'Architects Daughter', cursive, sans-serif;
          font-style: italic;
          letter-spacing: 0.03em;
        }
        .font-iso {
          font-family: 'Roboto Condensed', sans-serif;
        }
        .font-stamp {
          font-family: 'Oswald', sans-serif;
        }
      `}</style>

      {/* Control Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-100 ring-2 ring-slate-400" />
          <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest">
            Prancha Técnica A3 Nanquim Clássica (Normas ABNT / DIN / ISO)
          </span>
          <span className="text-[10px] font-mono bg-white text-black px-2 py-0.5 rounded font-extrabold">
            100% PRETO & BRANCO
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1 hover:bg-slate-800 text-slate-300 rounded"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-300 px-1">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              className="p-1 hover:bg-slate-800 text-slate-300 rounded"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-slate-800 text-slate-400 rounded"
              title="Resetar Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Export PDF Button */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exportando A3...' : 'Exportar Prancha PDF (A3/A4)'}</span>
          </button>
        </div>
      </div>

      {/* Main Drawing Paper Container */}
      <div
        ref={containerRef}
        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-auto flex justify-center shadow-2xl"
      >
        <div
          id="deltafix-hand-drafted-sheet"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="bg-white text-black shadow-2xl select-none shrink-0"
        >
          <svg
            width={sheetWidth}
            height={sheetHeight}
            viewBox={`0 0 ${sheetWidth} ${sheetHeight}`}
            xmlns="http://www.w3.org/2000/svg"
            className="block"
          >
            <defs>
              {/* Classical Solid Sharp Arrowhead */}
              <marker
                id="sharpArrow"
                viewBox="0 0 14 14"
                refX="14"
                refY="7"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 4 L 14 7 L 0 10 Z" fill="#000000" />
              </marker>

              {/* Hand-Drawn Cross Hatching Patterns (45° and 60°) for Cylindrical Shading */}
              <pattern
                id="hatch45"
                width="8"
                height="8"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="8" stroke="#000000" strokeWidth="0.75" />
              </pattern>

              <pattern
                id="crossHatch60"
                width="10"
                height="10"
                patternTransform="rotate(60 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="10" stroke="#000000" strokeWidth="0.6" />
                <line x1="0" y1="0" x2="10" y2="0" stroke="#000000" strokeWidth="0.6" />
              </pattern>

              <pattern
                id="fineHatch"
                width="5"
                height="5"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="5" stroke="#000000" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* ============================================================== */}
            {/* ZONE 1: ABNT MARGINS & DOUBLE BORDER WITH CENTERING ARROWS     */}
            {/* ============================================================== */}
            {/* White Paper Canvas */}
            <rect x="0" y="0" width={sheetWidth} height={sheetHeight} fill="#ffffff" />

            {/* External Trim Border */}
            <rect
              x="20"
              y="20"
              width={sheetWidth - 40}
              height={sheetHeight - 40}
              fill="none"
              stroke="#000000"
              strokeWidth="0.8"
            />

            {/* Main Inner Working Frame (ABNT Standard Margins: Left 25mm, Top/Right/Bottom 10mm) */}
            {/* In px at 96 DPI: Left ~94px, Others ~38px */}
            <rect
              x="95"
              y="38"
              width={sheetWidth - 133}
              height={sheetHeight - 76}
              fill="none"
              stroke="#000000"
              strokeWidth="2.8"
            />

            {/* Centering Marks (Setas de Centralização ABNT nas 4 extremidades) */}
            {/* Top */}
            <line x1={sheetWidth / 2} y1="20" x2={sheetWidth / 2} y2="48" stroke="#000000" strokeWidth="1.6" />
            {/* Bottom */}
            <line x1={sheetWidth / 2} y1={sheetHeight - 48} x2={sheetWidth / 2} y2={sheetHeight - 20} stroke="#000000" strokeWidth="1.6" />
            {/* Left */}
            <line x1="20" y1={sheetHeight / 2} x2="105" y2={sheetHeight / 2} stroke="#000000" strokeWidth="1.6" />
            {/* Right */}
            <line x1={sheetWidth - 48} y1={sheetHeight / 2} x2={sheetWidth - 20} y2={sheetHeight / 2} stroke="#000000" strokeWidth="1.6" />

            {/* Grid Coordinates (A, B, C, D / 1, 2, 3, 4, 5, 6) */}
            <g className="font-iso" fontSize="11" fontWeight="700" fill="#000000">
              <text x="350" y="32">1</text>
              <text x="650" y="32">2</text>
              <text x="950" y="32">3</text>
              <text x="1250" y="32">4</text>
              <text x="50" y="280">A</text>
              <text x="50" y="560">B</text>
              <text x="50" y="840">C</text>
            </g>

            {/* ============================================================== */}
            {/* ZONE 2: DYNAMIC CENTRAL DRAWING (NANQUIM RAÍZ)                 */}
            {/* ============================================================== */}
            {/* Long Centerline (Traço e Ponto ISO 128: 18, 4, 3, 4) */}
            <line
              x1={boltOriginX - scK - 80}
              y1={boltOriginY}
              x2={boltOriginX + scL + 80}
              y2={boltOriginY}
              stroke="#000000"
              strokeWidth="0.8"
              strokeDasharray="18, 4, 3, 4"
            />

            {/* Front View Centerlines (Cruz de Centro) */}
            <line
              x1={frontViewX}
              y1={frontViewY - scE / 2 - 50}
              x2={frontViewX}
              y2={frontViewY + scE / 2 + 50}
              stroke="#000000"
              strokeWidth="0.8"
              strokeDasharray="18, 4, 3, 4"
            />
            <line
              x1={frontViewX - scE / 2 - 50}
              y1={frontViewY}
              x2={frontViewX + scE / 2 + 50}
              y2={frontViewY}
              stroke="#000000"
              strokeWidth="0.8"
              strokeDasharray="18, 4, 3, 4"
            />

            {/* -------------------------------------------------------------- */}
            {/* A. HEXAGONAL BOLT HEAD (VISTA LONGITUDINAL)                    */}
            {/* -------------------------------------------------------------- */}
            {/* Main Outer Hex Head Contour (Pena Grossa 2.6px) */}
            <rect
              x={boltOriginX - scK}
              y={boltOriginY - scS / 2}
              width={scK}
              height={scS}
              fill="#ffffff"
              stroke="#000000"
              strokeWidth="2.6"
            />

            {/* Cross-hatching for cylindrical shadow on lower 1/3 of head */}
            <rect
              x={boltOriginX - scK + 1}
              y={boltOriginY + scS / 6}
              width={scK - 2}
              height={scS / 3 - 1}
              fill="url(#hatch45)"
              opacity="0.85"
            />

            {/* Chamfer curves (Arcos hiperbólicos de chanfro no sextavado) */}
            <path
              d={`M ${boltOriginX - scK} ${boltOriginY - scS / 4} Q ${boltOriginX - scK + scK * 0.45} ${boltOriginY} ${boltOriginX - scK} ${boltOriginY + scS / 4}`}
              fill="none"
              stroke="#000000"
              strokeWidth="1.4"
            />
            {/* Inner chamfer ridge lines (Pena Média 1.2px) */}
            <line
              x1={boltOriginX - scK}
              y1={boltOriginY - scS / 4}
              x2={boltOriginX}
              y2={boltOriginY - scS / 4}
              stroke="#000000"
              strokeWidth="1.2"
            />
            <line
              x1={boltOriginX - scK}
              y1={boltOriginY + scS / 4}
              x2={boltOriginX}
              y2={boltOriginY + scS / 4}
              stroke="#000000"
              strokeWidth="1.2"
            />

            {/* Underhead bearing surface radius (Rango de transição R) */}
            <line
              x1={boltOriginX}
              y1={boltOriginY - scS / 2}
              x2={boltOriginX}
              y2={boltOriginY + scS / 2}
              stroke="#000000"
              strokeWidth="2.6"
            />

            {/* -------------------------------------------------------------- */}
            {/* B. SHANK (HASTE LISA + ROSCADA COM DENTES REAIS)              */}
            {/* -------------------------------------------------------------- */}
            {/* 1. Smooth Shank Section (if DIN 931 partial thread) */}
            {scL - scB > 0 && (
              <g>
                <rect
                  x={boltOriginX}
                  y={boltOriginY - scD / 2}
                  width={scL - scB}
                  height={scD}
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth="2.6"
                />
                {/* Hand-drawn parallel shadow lines at bottom curvature */}
                <rect
                  x={boltOriginX}
                  y={boltOriginY + scD / 5}
                  width={scL - scB}
                  height={scD * 0.3}
                  fill="url(#fineHatch)"
                  opacity="0.75"
                />
                {/* Transition step mark to thread */}
                <line
                  x1={boltOriginX + (scL - scB)}
                  y1={boltOriginY - scD / 2}
                  x2={boltOriginX + (scL - scB)}
                  y2={boltOriginY + scD / 2}
                  stroke="#000000"
                  strokeWidth="2.0"
                />
              </g>
            )}

            {/* 2. Thread Section (Trecho Roscado com cristas e raízes reais) */}
            <g>
              {/* Outer boundary box of thread */}
              <rect
                x={boltOriginX + (scL - scB)}
                y={boltOriginY - scD / 2}
                width={scB}
                height={scD}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth="2.6"
              />

              {/* Thread Core Root Lines (Pena Fina contínua ou tracejada 0.8px) */}
              <line
                x1={boltOriginX + (scL - scB)}
                y1={boltOriginY - (scD / 2) * 0.84}
                x2={boltOriginX + scL}
                y2={boltOriginY - (scD / 2) * 0.84}
                stroke="#000000"
                strokeWidth="0.8"
                strokeDasharray="6,2"
              />
              <line
                x1={boltOriginX + (scL - scB)}
                y1={boltOriginY + (scD / 2) * 0.84}
                x2={boltOriginX + scL}
                y2={boltOriginY + (scD / 2) * 0.84}
                stroke="#000000"
                strokeWidth="0.8"
                strokeDasharray="6,2"
              />

              {/* Parametric Triangular/Trapezoidal Real Thread Crest Lines (Hélice Inclinada) */}
              {(() => {
                const threadPitchPx = Math.max(P * autoScale, 10);
                const count = Math.floor(scB / threadPitchPx);
                const lines = [];
                for (let i = 0; i < count; i++) {
                  const xTop = boltOriginX + (scL - scB) + i * threadPitchPx;
                  const xBottom = xTop + threadPitchPx * 0.5; // Lead angle pitch shift
                  lines.push(
                    <line
                      key={`th-${i}`}
                      x1={xTop}
                      y1={boltOriginY - scD / 2}
                      x2={xBottom}
                      y2={boltOriginY + scD / 2}
                      stroke="#000000"
                      strokeWidth="1.2"
                    />
                  );
                  // Add subtle root hatching between crests
                  if (i % 2 === 0) {
                    lines.push(
                      <line
                        key={`sub-${i}`}
                        x1={xTop + 3}
                        y1={boltOriginY + scD * 0.25}
                        x2={xBottom + 3}
                        y2={boltOriginY + scD / 2}
                        stroke="#000000"
                        strokeWidth="0.6"
                        opacity="0.8"
                      />
                    );
                  }
                }
                return lines;
              })()}

              {/* Cross-hatching for cylindrical shadow at bottom root of thread */}
              <rect
                x={boltOriginX + (scL - scB)}
                y={boltOriginY + scD * 0.2}
                width={scB}
                height={scD * 0.3}
                fill="url(#fineHatch)"
                opacity="0.6"
              />
            </g>

            {/* Tip Chamfer at 45 degrees (Chanfro da Ponta conforme DIN 78) */}
            <polygon
              points={`
                ${boltOriginX + scL},${boltOriginY - scD / 2}
                ${boltOriginX + scL + Math.min(scD * 0.15, 16)},${boltOriginY - scD * 0.35}
                ${boltOriginX + scL + Math.min(scD * 0.15, 16)},${boltOriginY + scD * 0.35}
                ${boltOriginX + scL},${boltOriginY + scD / 2}
              `}
              fill="#ffffff"
              stroke="#000000"
              strokeWidth="2.6"
            />
            {/* Tip hatching */}
            <polygon
              points={`
                ${boltOriginX + scL},${boltOriginY - scD / 2}
                ${boltOriginX + scL + Math.min(scD * 0.15, 16)},${boltOriginY - scD * 0.35}
                ${boltOriginX + scL + Math.min(scD * 0.15, 16)},${boltOriginY + scD * 0.35}
                ${boltOriginX + scL},${boltOriginY + scD / 2}
              `}
              fill="url(#fineHatch)"
            />

            {/* -------------------------------------------------------------- */}
            {/* C. FRONT AXIAL VIEW (VISTA DO SEXTAVADO)                       */}
            {/* -------------------------------------------------------------- */}
            <g transform={`translate(${frontViewX}, ${frontViewY})`}>
              {/* Outer Hexagon (Pena Grossa 2.6px) */}
              <polygon
                points={Array.from({ length: 6 }).map((_, i) => {
                  const angle = (i * 60 * Math.PI) / 180;
                  const r = (scS / 2) * 1.1547;
                  return `${Math.cos(angle) * r},${Math.sin(angle) * r}`;
                }).join(' ')}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth="2.8"
              />

              {/* Tangent Chamfer Circle (Círculo de chanfro do sextavado) */}
              <circle
                cx="0"
                cy="0"
                r={scS / 2}
                fill="none"
                stroke="#000000"
                strokeWidth="1.0"
              />

              {/* Nominal Thread Inscribed Circle (Crista de rosca contínua) */}
              <circle
                cx="0"
                cy="0"
                r={scD / 2}
                fill="none"
                stroke="#000000"
                strokeWidth="1.4"
              />

              {/* Thread Root Circle 3/4 arc (Raiz de rosca - norma técnica ISO 6410) */}
              <path
                d={`M 0,${-(scD / 2) * 0.84} A ${(scD / 2) * 0.84} ${(scD / 2) * 0.84} 0 1 1 ${-(scD / 2) * 0.84},0`}
                fill="none"
                stroke="#000000"
                strokeWidth="0.8"
              />

              {/* Shading on 2 bottom facets of the hexagon */}
              <polygon
                points={`
                  0,0
                  ${(scS / 2) * 1.1547 * Math.cos(Math.PI / 3)},${(scS / 2) * 1.1547 * Math.sin(Math.PI / 3)}
                  ${(scS / 2) * 1.1547 * Math.cos((2 * Math.PI) / 3)},${(scS / 2) * 1.1547 * Math.sin((2 * Math.PI) / 3)}
                `}
                fill="url(#fineHatch)"
                opacity="0.4"
              />
            </g>

            {/* -------------------------------------------------------------- */}
            {/* D. DIMENSION LINES WITH SHARP SOLID ARROWS & CALLIGRAPHY       */}
            {/* -------------------------------------------------------------- */}
            {/* Dimension L (Comprimento Total) */}
            <g
              className="cursor-pointer"
              onClick={() => handleCotaSelect('L')}
            >
              <line
                x1={boltOriginX}
                y1={boltOriginY + Math.max(scS, scD) / 2 + 55}
                x2={boltOriginX + scL}
                y2={boltOriginY + Math.max(scS, scD) / 2 + 55}
                stroke="#000000"
                strokeWidth="0.9"
                markerStart="url(#sharpArrow)"
                markerEnd="url(#sharpArrow)"
              />
              {/* Extension lines */}
              <line
                x1={boltOriginX}
                y1={boltOriginY + scD / 2 + 4}
                x2={boltOriginX}
                y2={boltOriginY + Math.max(scS, scD) / 2 + 75}
                stroke="#000000"
                strokeWidth="0.6"
              />
              <line
                x1={boltOriginX + scL}
                y1={boltOriginY + scD / 2 + 4}
                x2={boltOriginX + scL}
                y2={boltOriginY + Math.max(scS, scD) / 2 + 75}
                stroke="#000000"
                strokeWidth="0.6"
              />
              {/* Cota Value in Calligraphic Hand-drawn font */}
              <text
                x={boltOriginX + scL / 2}
                y={boltOriginY + Math.max(scS, scD) / 2 + 48}
                textAnchor="middle"
                fill="#000000"
                fontSize="18"
                fontWeight="700"
                className="font-engineer"
              >
                L = {L}
              </text>
            </g>

            {/* Dimension k (Altura da Cabeça) */}
            <g
              className="cursor-pointer"
              onClick={() => handleCotaSelect('k')}
            >
              <line
                x1={boltOriginX - scK}
                y1={boltOriginY - scS / 2 - 45}
                x2={boltOriginX}
                y2={boltOriginY - scS / 2 - 45}
                stroke="#000000"
                strokeWidth="0.9"
                markerStart="url(#sharpArrow)"
                markerEnd="url(#sharpArrow)"
              />
              <line
                x1={boltOriginX - scK}
                y1={boltOriginY - scS / 2}
                x2={boltOriginX - scK}
                y2={boltOriginY - scS / 2 - 60}
                stroke="#000000"
                strokeWidth="0.6"
              />
              <line
                x1={boltOriginX}
                y1={boltOriginY - scS / 2}
                x2={boltOriginX}
                y2={boltOriginY - scS / 2 - 60}
                stroke="#000000"
                strokeWidth="0.6"
              />
              <text
                x={boltOriginX - scK / 2}
                y={boltOriginY - scS / 2 - 52}
                textAnchor="middle"
                fill="#000000"
                fontSize="17"
                fontWeight="700"
                className="font-engineer"
              >
                k = {k}
              </text>
            </g>

            {/* Dimension M (Bitola da Rosca na Ponta) */}
            <g
              className="cursor-pointer"
              onClick={() => handleCotaSelect('d')}
            >
              <line
                x1={boltOriginX + scL + 35}
                y1={boltOriginY - scD / 2}
                x2={boltOriginX + scL + 35}
                y2={boltOriginY + scD / 2}
                stroke="#000000"
                strokeWidth="0.9"
                markerStart="url(#sharpArrow)"
                markerEnd="url(#sharpArrow)"
              />
              <line
                x1={boltOriginX + scL}
                y1={boltOriginY - scD / 2}
                x2={boltOriginX + scL + 50}
                y2={boltOriginY - scD / 2}
                stroke="#000000"
                strokeWidth="0.6"
              />
              <line
                x1={boltOriginX + scL}
                y1={boltOriginY + scD / 2}
                x2={boltOriginX + scL + 50}
                y2={boltOriginY + scD / 2}
                stroke="#000000"
                strokeWidth="0.6"
              />
              <text
                x={boltOriginX + scL + 48}
                y={boltOriginY + 6}
                textAnchor="start"
                fill="#000000"
                fontSize="18"
                fontWeight="700"
                className="font-engineer"
              >
                M{d}x{P}
              </text>
            </g>

            {/* Dimension b (Comprimento Útil de Rosca se DIN 931) */}
            {product.standard_code === 'DIN 931' && (
              <g
                className="cursor-pointer"
                onClick={() => handleCotaSelect('b')}
              >
                <line
                  x1={boltOriginX + (scL - scB)}
                  y1={boltOriginY - scD / 2 - 45}
                  x2={boltOriginX + scL}
                  y2={boltOriginY - scD / 2 - 45}
                  stroke="#000000"
                  strokeWidth="0.9"
                  markerStart="url(#sharpArrow)"
                  markerEnd="url(#sharpArrow)"
                />
                <line
                  x1={boltOriginX + (scL - scB)}
                  y1={boltOriginY - scD / 2}
                  x2={boltOriginX + (scL - scB)}
                  y2={boltOriginY - scD / 2 - 60}
                  stroke="#000000"
                  strokeWidth="0.6"
                />
                <text
                  x={boltOriginX + scL - scB / 2}
                  y={boltOriginY - scD / 2 - 52}
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="17"
                  fontWeight="700"
                  className="font-engineer"
                >
                  b = {b}
                </text>
              </g>
            )}

            {/* Dimension s (Abertura de Chave na Vista Frontal) */}
            <g
              className="cursor-pointer"
              onClick={() => handleCotaSelect('s')}
            >
              <line
                x1={frontViewX - scS / 2}
                y1={frontViewY + scS / 2 + 45}
                x2={frontViewX + scS / 2}
                y2={frontViewY + scS / 2 + 45}
                stroke="#000000"
                strokeWidth="0.9"
                markerStart="url(#sharpArrow)"
                markerEnd="url(#sharpArrow)"
              />
              <line
                x1={frontViewX - scS / 2}
                y1={frontViewY + scS / 2}
                x2={frontViewX - scS / 2}
                y2={frontViewY + scS / 2 + 60}
                stroke="#000000"
                strokeWidth="0.6"
              />
              <line
                x1={frontViewX + scS / 2}
                y1={frontViewY + scS / 2}
                x2={frontViewX + scS / 2}
                y2={frontViewY + scS / 2 + 60}
                stroke="#000000"
                strokeWidth="0.6"
              />
              <text
                x={frontViewX}
                y={frontViewY + scS / 2 + 38}
                textAnchor="middle"
                fill="#000000"
                fontSize="17"
                fontWeight="700"
                className="font-engineer"
              >
                s = {s}
              </text>
            </g>

            {/* Dimension e (Diâmetro nos Vértices) */}
            <g className="cursor-pointer">
              <text
                x={frontViewX + scE / 2 + 25}
                y={frontViewY - scE / 3}
                fill="#000000"
                fontSize="14"
                fontWeight="700"
                className="font-engineer"
              >
                e min = {e}
              </text>
            </g>

            {/* ============================================================== */}
            {/* ZONE 3: TABELA DE TOLERÂNCIAS DE CHÃO DE FÁBRICA               */}
            {/* (Canto Superior Direito: X: 1040, Y: 55, W: 430, H: 200)       */}
            {/* ============================================================== */}
            <g transform="translate(1040, 55)">
              {/* Outer Table Frame */}
              <rect x="0" y="0" width="430" height="215" fill="#ffffff" stroke="#000000" strokeWidth="2.0" />

              {/* Table Header */}
              <rect x="0" y="0" width="430" height="32" fill="#f1f5f9" stroke="#000000" strokeWidth="1.4" />
              <text
                x="215"
                y="21"
                textAnchor="middle"
                fill="#000000"
                fontSize="13"
                fontWeight="800"
                className="font-iso"
                letterSpacing="0.05em"
              >
                TOLERÂNCIAS DE CHÃO DE FÁBRICA (CQ)
              </text>

              {/* Sub-header row */}
              <rect x="0" y="32" width="430" height="24" fill="#ffffff" stroke="#000000" strokeWidth="1.0" />
              <text x="12" y="48" fill="#000000" fontSize="11" fontWeight="700" className="font-iso">
                COTAS CRÍTICAS
              </text>
              <text x="135" y="48" fill="#000000" fontSize="11" fontWeight="700" className="font-iso">
                TOLERÂNCIA (MÍN / MÁX)
              </text>
              <text x="290" y="48" fill="#000000" fontSize="11" fontWeight="700" className="font-iso">
                INSTRUMENTO
              </text>

              {/* Column Dividers */}
              <line x1="125" y1="32" x2="125" y2="215" stroke="#000000" strokeWidth="1.0" />
              <line x1="280" y1="32" x2="280" y2="215" stroke="#000000" strokeWidth="1.0" />

              {/* Data Rows */}
              {[
                { cota: `Corpo (d = Ø${d})`, tol: `${(d - 0.28).toFixed(2)} / ${d.toFixed(2)} mm (h13)`, inst: 'Micrômetro 0.001mm' },
                { cota: `Chave (s = ${s})`, tol: `${(s - 0.35).toFixed(2)} / ${s.toFixed(2)} mm (h13)`, inst: 'Paquímetro Digital' },
                { cota: `Cabeça (k = ${k})`, tol: `${(k - 0.25).toFixed(2)} / ${(k + 0.25).toFixed(2)} mm (js15)`, inst: 'Relógio Apalpador' },
                { cota: `Rosca (${P}mm)`, tol: 'Campo 6g (ISO 965)', inst: 'Calibrador Anel P/NP' },
                { cota: `Compr. (L = ${L})`, tol: `${L - 1.5} / ${L + 1.5} mm (DIN 78)`, inst: 'Escala / Paquímetro' },
                { cota: 'Batimento Cabeça', tol: '0.15 mm máx FIM', inst: 'Relógio Comparador' }
              ].map((row, idx) => {
                const y = 56 + idx * 26.5;
                return (
                  <g key={idx}>
                    <line x1="0" y1={y} x2="430" y2={y} stroke="#000000" strokeWidth="0.8" />
                    <text x="12" y={y + 18} fill="#000000" fontSize="11" fontWeight="600" className="font-iso">
                      {row.cota}
                    </text>
                    <text x="135" y={y + 18} fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">
                      {row.tol}
                    </text>
                    <text x="290" y={y + 18} fill="#000000" fontSize="10.5" className="font-iso">
                      {row.inst}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* ============================================================== */}
            {/* ZONE 4: BLOCO DE NOTAS TÉCNICAS (CANTO INFERIOR ESQUERDO)      */}
            {/* (X: 110, Y: 890, W: 450)                                       */}
            {/* ============================================================== */}
            <g transform="translate(110, 890)">
              <text x="0" y="0" fill="#000000" fontSize="13" fontWeight="700" className="font-iso">
                NOTAS GERAIS DE FABRICAÇÃO:
              </text>
              <g fill="#000000" fontSize="13" fontWeight="600" className="font-engineer">
                <text x="0" y="24">1. TODAS AS DIMENSÕES EM MILÍMETROS (mm) EXCETO INDICAÇÃO CONTRÁRIA.</text>
                <text x="0" y="46">2. TOLERÂNCIAS GERAIS NÃO INDICADAS CONFORME NORMA ISO 2768-mK.</text>
                <text x="0" y="68">3. ROSCA MÉTRICA GROSSA PADRONIZADA CONFORME DIN 13 / ISO 965-1.</text>
                <text x="0" y="90">4. PEÇA ISENTA DE REBARBAS, BORDAS CORTANTES E RESÍDUOS DE ÓLEO.</text>
                <text x="0" y="112">5. ENSAIO DE TRAÇÃO E DUREZA SEGUNDO NBR ISO 898-1 / CQ AQL 0.65.</text>
              </g>
            </g>

            {/* ============================================================== */}
            {/* ZONE 5: CARIMBO INDUSTRIAL DELTA + TABELA DE REVISÕES         */}
            {/* (Canto Inferior Direito: X: 840, Y: 820, W: 630, H: 245)      */}
            {/* ============================================================== */}
            <g transform="translate(840, 820)">
              {/* Outer Title Block Frame */}
              <rect x="0" y="0" width="630" height="245" fill="#ffffff" stroke="#000000" strokeWidth="2.8" />

              {/* Revision Table Top Stripe (H: 55) */}
              <rect x="0" y="0" width="630" height="24" fill="#f1f5f9" stroke="#000000" strokeWidth="1.2" />
              <text x="8" y="17" fill="#000000" fontSize="11" fontWeight="700" className="font-iso">REV</text>
              <text x="48" y="17" fill="#000000" fontSize="11" fontWeight="700" className="font-iso">DESCRIÇÃO DA MODIFICAÇÃO DE ENGENHARIA</text>
              <text x="440" y="17" fill="#000000" fontSize="11" fontWeight="700" className="font-iso">DATA</text>
              <text x="540" y="17" fill="#000000" fontSize="11" fontWeight="700" className="font-iso">AUTOR</text>

              {/* Revision Row 01 */}
              <rect x="0" y="24" width="630" height="26" fill="#ffffff" stroke="#000000" strokeWidth="1.0" />
              <text x="12" y="42" fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">02</text>
              <text x="48" y="42" fill="#000000" fontSize="12" fontWeight="600" className="font-engineer">Emissão Paramétrica Oficial DeltaFix Core Engine</text>
              <text x="440" y="42" fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">{new Date().toLocaleDateString('pt-BR')}</text>
              <text x="540" y="42" fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">E. Silva</text>

              {/* Section Divider under revisions */}
              <line x1="0" y1="50" x2="630" y2="50" stroke="#000000" strokeWidth="2.0" />

              {/* Left Column: Official Logo + Company Name (W: 240, Y: 50 to 245) */}
              <rect x="0" y="50" width="240" height="195" fill="#ffffff" stroke="#000000" strokeWidth="1.4" />

              {/* Render Official Delta Logo */}
              <g transform="translate(15, 62) scale(0.65)">
                {/* Embedded SVG of the official Delta logo */}
                <circle cx="100" cy="100" r="92" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                <polygon points="65,152 135,152 100,118" fill="#991b1b" stroke="#000000" strokeWidth="1" />
                <path d="M 96,82 C 90,60 70,52 62,56 C 74,68 88,96 82,130 C 88,110 96,94 96,82 Z" fill="#581c24" />
                <path d="M 104,82 C 110,60 130,52 138,56 C 126,68 112,96 118,130 C 112,110 104,94 104,82 Z" fill="#581c24" />
                <path d="M 86,72 C 78,54 58,52 48,60 C 60,70 76,102 64,142 C 72,120 84,94 86,72 Z" fill="#7f1d1d" />
                <path d="M 114,72 C 122,54 142,52 152,60 C 140,70 124,102 136,142 C 128,120 116,94 114,72 Z" fill="#7f1d1d" />
                <path d="M 76,68 C 66,54 48,58 38,68 C 50,78 64,112 48,150 C 58,128 72,96 76,68 Z" fill="#b91c1c" />
                <path d="M 124,68 C 134,54 152,58 162,68 C 150,78 136,112 152,150 C 142,128 128,96 124,68 Z" fill="#b91c1c" />
              </g>

              {/* Company Text */}
              <text x="145" y="105" textAnchor="middle" fill="#000000" fontSize="16" fontWeight="800" className="font-stamp">
                DELTA
              </text>
              <text x="145" y="125" textAnchor="middle" fill="#000000" fontSize="9" fontWeight="700" className="font-iso" letterSpacing="0.08em">
                PARAFUSOS ESPECIAIS
              </text>
              <text x="145" y="142" textAnchor="middle" fill="#000000" fontSize="8" className="font-iso">
                DIVISÃO DE ENGENHARIA
              </text>

              {/* Title & SKU Box (X: 240, Y: 50, W: 390, H: 65) */}
              <rect x="240" y="50" width="390" height="65" fill="#ffffff" stroke="#000000" strokeWidth="1.4" />
              <text x="250" y="66" fill="#000000" fontSize="9" fontWeight="700" className="font-iso">
                DENOMINAÇÃO TÉCNICA / TÍTULO DO PROJETO:
              </text>
              <text x="250" y="88" fill="#000000" fontSize="17" fontWeight="700" className="font-engineer">
                {product.standard_code} - {product.bitola} {product.comprimento ? `x ${product.comprimento}` : ''} ({product.classe_resistencia})
              </text>
              <text x="250" y="106" fill="#000000" fontSize="12" fontWeight="700" className="font-iso">
                SKU: <tspan className="font-engineer text-base">{product.sku_gerado}</tspan>
              </text>

              {/* Drawing Number & Revisions Box (Y: 115, H: 45) */}
              <rect x="240" y="115" width="240" height="45" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
              <text x="250" y="129" fill="#000000" fontSize="8.5" fontWeight="700" className="font-iso">
                Nº DO DESENHO:
              </text>
              <text x="250" y="148" fill="#000000" fontSize="14" fontWeight="700" className="font-engineer">
                DF-{product.sku_gerado.slice(0, 18)}
              </text>

              {/* Revision & Sheet Box */}
              <rect x="480" y="115" width="75" height="45" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
              <text x="490" y="129" fill="#000000" fontSize="8.5" fontWeight="700" className="font-iso">REV:</text>
              <text x="510" y="150" fill="#000000" fontSize="17" fontWeight="700" className="font-engineer">02</text>

              <rect x="555" y="115" width="75" height="45" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
              <text x="565" y="129" fill="#000000" fontSize="8.5" fontWeight="700" className="font-iso">FOLHA:</text>
              <text x="580" y="150" fill="#000000" fontSize="14" fontWeight="700" className="font-engineer">1 / 1</text>

              {/* Material, Treatment & Weights Line (Y: 160, H: 45) */}
              <rect x="240" y="160" width="195" height="45" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
              <text x="250" y="174" fill="#000000" fontSize="8.5" fontWeight="700" className="font-iso">MATÉRIA-PRIMA:</text>
              <text x="250" y="193" fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">
                {product.material_base.slice(0, 22)}
              </text>

              <rect x="435" y="160" width="195" height="45" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
              <text x="445" y="174" fill="#000000" fontSize="8.5" fontWeight="700" className="font-iso">ACABAMENTO SUPERFICIAL:</text>
              <text x="445" y="193" fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">
                {product.tratamento_superficial.slice(0, 22)}
              </text>

              {/* Signoff & Author / Approver Bottom Line (Y: 205, H: 40) */}
              <rect x="240" y="205" width="130" height="40" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
              <text x="250" y="218" fill="#000000" fontSize="8" fontWeight="700" className="font-iso">ELABORADO POR:</text>
              <text x="250" y="234" fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">E. Silva</text>

              <rect x="370" y="205" width="130" height="40" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
              <text x="380" y="218" fill="#000000" fontSize="8" fontWeight="700" className="font-iso">APROVADO POR:</text>
              <text x="380" y="234" fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">Eng. Delta</text>

              <rect x="500" y="205" width="65" height="40" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
              <text x="508" y="218" fill="#000000" fontSize="8" fontWeight="700" className="font-iso">ESCALA:</text>
              <text x="512" y="234" fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">1:1</text>

              <rect x="565" y="205" width="65" height="40" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
              <text x="572" y="218" fill="#000000" fontSize="8" fontWeight="700" className="font-iso">MASSA:</text>
              <text x="572" y="234" fill="#000000" fontSize="11" fontWeight="700" className="font-engineer">
                {(product.peso_liquido_kg * 1000).toFixed(0)}g
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
