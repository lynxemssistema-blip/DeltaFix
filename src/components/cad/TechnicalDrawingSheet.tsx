// src/components/cad/TechnicalDrawingSheet.tsx - Classical Nanquim A3 Sheet with Pan & Zoom CAD Viewport
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ProductItem, StandardDimension } from '@/lib/standards/types';
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Move,
  Maximize,
  RotateCcw,
  Sparkles,
  Layers,
  Crosshair,
  Scissors
} from 'lucide-react';
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
  // Standard geometric variables
  const d = dimension.diametro_nominal || 20;
  const P = dimension.passo || 2.5;
  const L = product.comprimento || 80;
  const k = dimension.altura_cabeca || (product.family === 'porca' ? d * 0.8 : 12.5);
  const s = dimension.chave || (d * 1.5);
  const dk = dimension.diametro_cabeca || (d * 1.5);
  const e = dimension.vertice || Number((s * 1.1547).toFixed(2));
  const b = product.comprimento_rosca_b ?? (product.standard_code === 'DIN 933' ? L : Math.min(2 * d + 6, L));
  const d1 = dimension.diametro_interno || d + 0.5;
  const d2 = dimension.diametro_externo || d * 2.0;
  const thickness = dimension.espessura || 3.0;

  // Sobremetal de corte paramétrico (mínimo 0mm, padrão 5mm)
  const sobremetal = typeof product.sobremetal_corte === 'number' ? product.sobremetal_corte : 5.0;

  // Geometric Archetype Classification
  const archetype = product.geometric_archetype || (
    product.standard_code === 'DIN 912' ? 'socket_head_allen' :
    product.standard_code === 'DIN 7991' ? 'countersunk_allen' :
    product.standard_code === 'DIN 934' || product.family === 'porca' ? 'hex_nut' :
    product.family === 'arruela' ? (product.standard_code === 'DIN 127B' ? 'washer_spring' : 'washer_plain') :
    product.family === 'prisioneiro' || product.standard_code.includes('B7') || product.standard_code.includes('975') ? 'stud_bolt' :
    product.standard_code.includes('A325') ? 'heavy_hex_bolt' :
    'hex_bolt'
  );

  const isNut = archetype === 'hex_nut';
  const isWasher = archetype === 'washer_plain' || archetype === 'washer_spring';
  const isStud = archetype === 'stud_bolt';
  const isCountersunk = archetype === 'countersunk_allen';
  const isAllen = archetype === 'socket_head_allen';
  const isHeavyHex = archetype === 'heavy_hex_bolt';
  const isBolt = !isNut && !isWasher && !isStud;

  // A3 Sheet Standard Dimensions (420 x 297 mm at 96 DPI -> 1587 x 1122 px)
  const sheetWidth = 1587;
  const sheetHeight = 1122;

  // Pan & Zoom Engine State
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.75);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCota, setSelectedCota] = useState<string | null>('L');
  const [isExporting, setIsExporting] = useState(false);

  // Auto-fit function: fits the entire A3 sheet inside the viewport
  const fitToScreen = useCallback(() => {
    if (!viewportRef.current) return;
    const { clientWidth, clientHeight } = viewportRef.current;
    if (!clientWidth || !clientHeight) return;

    const availW = clientWidth - 24;
    const availH = clientHeight - 24;

    const scaleW = availW / sheetWidth;
    const scaleH = availH / sheetHeight;
    const fitScale = Math.min(scaleW, scaleH);

    setScale(Math.max(fitScale, 0.35));
    const offsetX = (clientWidth - sheetWidth * fitScale) / 2;
    const offsetY = (clientHeight - sheetHeight * fitScale) / 2;
    setPan({ x: offsetX > 0 ? offsetX : 12, y: offsetY > 0 ? offsetY : 12 });
  }, [sheetWidth, sheetHeight]);

  // Focus Zoom: Centers directly on the mechanical part drawing at 115% scale
  const focusOnPart = useCallback(() => {
    if (!viewportRef.current) return;
    const { clientWidth, clientHeight } = viewportRef.current;
    const targetScale = 1.15;
    setScale(targetScale);

    const partCenterX = 540;
    const partCenterY = 460;

    const targetPanX = clientWidth / 2 - partCenterX * targetScale;
    const targetPanY = clientHeight / 2 - partCenterY * targetScale;
    setPan({ x: targetPanX, y: targetPanY });
  }, []);

  useEffect(() => {
    fitToScreen();
    window.addEventListener('resize', fitToScreen);
    return () => window.removeEventListener('resize', fitToScreen);
  }, [fitToScreen]);

  // Non-passive wheel zoom event listener to avoid browser warnings
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
      setScale((prevScale) => {
        const newScale = Math.min(Math.max(prevScale * zoomFactor, 0.3), 3.5);
        setPan((prevPan) => {
          const newPanX = cursorX - (cursorX - prevPan.x) * (newScale / prevScale);
          const newPanY = cursorY - (cursorY - prevPan.y) * (newScale / prevScale);
          return { x: newPanX, y: newPanY };
        });
        return newScale;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Pointer-capture based pan handlers (silky smooth, never drops)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left mouse button
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
      setIsPanning(false);
    }
  };

  // ==============================================================
  // DYNAMIC MECHANICAL DRAFTING SCALE & CENTERING LOGIC
  // ==============================================================
  const partLengthMm = isNut ? k : isWasher ? thickness : isStud ? L : (k + L);
  const partHeightMm = isWasher ? d2 : Math.max(s, dk, d);
  const frontViewWidthMm = isWasher ? d2 : e;

  // Target Drafting Scale (px per mm)
  let draftingScale = 2.0;
  let draftingScaleLabel = '1:1';

  if (isBolt || isStud) {
    const targetW = 720;
    const targetH = 340;
    const scaleFromW = targetW / (partLengthMm + frontViewWidthMm + 45);
    const scaleFromH = targetH / (partHeightMm * 2.2);
    const optimalScale = Math.min(scaleFromW, scaleFromH);
    draftingScale = Math.min(Math.max(optimalScale, 1.0), 5.5);

    if (draftingScale >= 3.6) draftingScaleLabel = '5:1';
    else if (draftingScale >= 1.7) draftingScaleLabel = '2:1';
    else if (draftingScale >= 0.85) draftingScaleLabel = '1:1';
    else if (draftingScale >= 0.45) draftingScaleLabel = '1:2';
    else draftingScaleLabel = '1:5';
  } else if (isNut) {
    draftingScale = Math.min(Math.max(380 / (s * 2.2), 1.5), 6.0);
    draftingScaleLabel = draftingScale >= 3.5 ? '5:1' : draftingScale >= 1.8 ? '2:1' : '1:1';
  } else if (isWasher) {
    draftingScale = Math.min(Math.max(380 / (d2 * 1.8), 1.5), 6.0);
    draftingScaleLabel = draftingScale >= 3.5 ? '5:1' : draftingScale >= 1.8 ? '2:1' : '1:1';
  }

  // Scaled dimensions in pixels
  const scL = L * draftingScale;
  const scK = k * draftingScale;
  const scD = d * draftingScale;
  const scS = s * draftingScale;
  const scDk = dk * draftingScale;
  const scE = e * draftingScale;
  const scB = b * draftingScale;
  const scD1 = d1 * draftingScale;
  const scD2 = d2 * draftingScale;
  const scThick = thickness * draftingScale;
  const scCut = sobremetal * draftingScale; // Sobremetal em pixels

  // Coordinated View Centers (Drafting Centerline at Y = 460)
  const centerlineY = 460;
  const draftingCenterX = 540;

  const viewGap = Math.max(160, 45 * draftingScale);

  const totalVisualWidth = isBolt
    ? scK + scL + scCut + viewGap + scE / 2
    : isStud
    ? scL + scCut + viewGap + scD / 2
    : isNut
    ? scK + viewGap + scE / 2
    : scThick + viewGap + scD2 / 2;

  const boltOriginX = isBolt
    ? Math.max(draftingCenterX - totalVisualWidth / 2 + scK, 140 + scK)
    : isStud
    ? Math.max(draftingCenterX - totalVisualWidth / 2, 180)
    : isNut
    ? Math.max(draftingCenterX - totalVisualWidth / 2, 220)
    : Math.max(draftingCenterX - totalVisualWidth / 2, 220);

  const frontViewX = isBolt
    ? boltOriginX + scL + scCut + viewGap
    : isStud
    ? boltOriginX + scL + scCut + viewGap
    : isNut
    ? boltOriginX + scK + viewGap
    : boltOriginX + scThick + viewGap;

  const handleCotaSelect = (cota: string) => {
    setSelectedCota(cota);
    if (onDimensionClick) onDimensionClick(cota);
  };

  // High-Definition PDF Export
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('deltafix-hand-drafted-sheet');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
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
    <div
      className={`flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'w-full'
      }`}
    >
      {/* CAD Workbench Top Command Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono gap-2 select-none z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-100 ring-2 ring-slate-400" />
            <span className="font-bold text-slate-100 tracking-wider">
              PRANCHETA MECÂNICA A3 (420 x 297 mm)
            </span>
          </div>
          <span className="text-[10px] bg-white text-slate-950 font-extrabold px-2 py-0.5 rounded">
            NANQUIM SOBRE PAPEL
          </span>
          <span className="text-[11px] text-slate-400 hidden lg:inline">
            Norma {product.standard_code} • {product.bitola}
            {product.comprimento ? `x${product.comprimento}` : ''} • Escala {draftingScaleLabel} • Sobremetal: +{sobremetal}mm
          </span>
        </div>

        {/* Viewport Control Tools (Pan, Zoom, Focus, Fullscreen, PDF) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fitToScreen}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-semibold transition-colors border border-slate-700"
            title="Ajustar Prancha 100% à Tela (Fit to View)"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span className="text-[11px]">Enquadrar Folha</span>
          </button>

          <button
            type="button"
            onClick={focusOnPart}
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 rounded font-semibold transition-colors border border-cyan-800"
            title="Aproximar e Centralizar no Desenho da Peça"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Foco na Peça</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(s * 0.85, 0.3))}
              className="p-1 text-slate-400 hover:text-white"
              title="Reduzir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-slate-300 w-10 text-center font-bold">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(s * 1.15, 3.5))}
              className="p-1 text-slate-400 hover:text-white"
              title="Ampliar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-200 text-slate-950 font-bold rounded shadow transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Gerando...' : 'Exportar PDF A3'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive CAD Viewport Canvas */}
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full bg-[#141820] overflow-hidden select-none cursor-grab active:cursor-grabbing ${
          isFullscreen ? 'h-[calc(100vh-42px)]' : 'h-[680px] xl:h-[760px] 2xl:h-[820px]'
        }`}
        style={{
          backgroundImage: `
            radial-gradient(circle at center, rgba(30, 41, 59, 0.45) 0%, rgba(10, 15, 26, 0.95) 100%),
            linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      >
        {/* Floating Pan Instructions Pill */}
        <div className="absolute bottom-3 left-4 z-20 pointer-events-none bg-slate-950/85 backdrop-blur border border-slate-800 rounded-full px-3 py-1 text-[11px] font-mono text-slate-400 flex items-center gap-2 shadow-lg">
          <Move className="w-3.5 h-3.5 text-cyan-400" />
          <span>Arraste para Pan • Scroll para Zoom • Clique duplo para Enquadrar</span>
        </div>

        {/* The Scalable and Pannable Drawing Sheet */}
        <div
          onDoubleClick={fitToScreen}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isPanning ? 'none' : 'transform 0.12s ease-out'
          }}
          className="absolute top-0 left-0 shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
        >
          <div id="deltafix-hand-drafted-sheet" className="bg-white text-black shrink-0">
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

                {/* Red Arrowhead for Cutting Allowance (Sobremetal) */}
                <marker
                  id="sharpArrowRed"
                  viewBox="0 0 14 14"
                  refX="14"
                  refY="7"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 4 L 14 7 L 0 10 Z" fill="#b91c1c" />
                </marker>

                {/* Hand-Drawn Cross Hatching Patterns */}
                <pattern
                  id="hatch45"
                  width="8"
                  height="8"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#000000" strokeWidth="0.8" />
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

                <pattern
                  id="crossKnurl"
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="6" y2="6" stroke="#000000" strokeWidth="0.6" />
                  <line x1="6" y1="0" x2="0" y2="6" stroke="#000000" strokeWidth="0.6" />
                </pattern>

                {/* Strict Text Clipping Masks */}
                <clipPath id="carimboTitleClip">
                  <rect x="0" y="0" width="375" height="55" />
                </clipPath>
                <clipPath id="carimboDrawingNoClip">
                  <rect x="0" y="0" width="215" height="40" />
                </clipPath>
                <clipPath id="carimboMaterialClip">
                  <rect x="0" y="0" width="185" height="40" />
                </clipPath>
                <clipPath id="carimboFinishClip">
                  <rect x="0" y="0" width="185" height="40" />
                </clipPath>
                <clipPath id="tolCellClip">
                  <rect x="0" y="0" width="185" height="26" />
                </clipPath>
              </defs>

              {/* ============================================================== */}
              {/* ZONE 1: ABNT MARGINS & DOUBLE BORDER WITH CENTERING ARROWS     */}
              {/* ============================================================== */}
              <rect x="0" y="0" width={sheetWidth} height={sheetHeight} fill="#ffffff" />
              <rect
                x="20"
                y="20"
                width={sheetWidth - 40}
                height={sheetHeight - 40}
                fill="none"
                stroke="#000000"
                strokeWidth="0.8"
              />
              <rect
                x="95"
                y="38"
                width={1454}
                height={1046}
                fill="none"
                stroke="#000000"
                strokeWidth="2.8"
              />

              {/* Centering Marks */}
              <line x1={sheetWidth / 2} y1="20" x2={sheetWidth / 2} y2="48" stroke="#000000" strokeWidth="1.6" />
              <line x1={sheetWidth / 2} y1={sheetHeight - 48} x2={sheetWidth / 2} y2={sheetHeight - 20} stroke="#000000" strokeWidth="1.6" />
              <line x1="20" y1={sheetHeight / 2} x2="105" y2={sheetHeight / 2} stroke="#000000" strokeWidth="1.6" />
              <line x1={sheetWidth - 48} y1={sheetHeight / 2} x2={sheetWidth - 20} y2={sheetHeight / 2} stroke="#000000" strokeWidth="1.6" />

              {/* Coordinates Grid */}
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
              {/* ZONE 2: DYNAMIC CENTRAL MECHANICAL DRAWING                     */}
              {/* ============================================================== */}
              {/* Centerlines */}
              <line
                x1={boltOriginX - (isBolt ? scK + 60 : 60)}
                y1={centerlineY}
                x2={frontViewX + (isWasher ? scD2 / 2 + 50 : scE / 2 + 50)}
                y2={centerlineY}
                stroke="#000000"
                strokeWidth="0.8"
                strokeDasharray="18, 4, 3, 4"
              />
              <line
                x1={frontViewX}
                y1={centerlineY - (isWasher ? scD2 / 2 + 40 : scE / 2 + 40)}
                x2={frontViewX}
                y2={centerlineY + (isWasher ? scD2 / 2 + 40 : scE / 2 + 40)}
                stroke="#000000"
                strokeWidth="0.8"
                strokeDasharray="18, 4, 3, 4"
              />

              {/* -------------------------------------------------------------- */}
              {/* PARAFUSOS: DIN 933, DIN 931, DIN 912, DIN 7991, ASTM A325       */}
              {/* -------------------------------------------------------------- */}
              {isBolt && (
                <g>
                  {/* BOLT HEAD */}
                  {isAllen ? (
                    // DIN 912 Allen Cylindrical Head
                    <g>
                      <rect
                        x={boltOriginX - scK}
                        y={centerlineY - scDk / 2}
                        width={scK}
                        height={scDk}
                        fill="#ffffff"
                        stroke="#000000"
                        strokeWidth="2.6"
                      />
                      <rect
                        x={boltOriginX - scK + 1}
                        y={centerlineY - scDk / 2 + 1}
                        width={scK - 2}
                        height={scDk - 2}
                        fill="url(#crossKnurl)"
                        opacity="0.25"
                      />
                      <rect
                        x={boltOriginX - scK}
                        y={centerlineY - scS / 2}
                        width={scK * 0.7}
                        height={scS}
                        fill="none"
                        stroke="#000000"
                        strokeWidth="1.2"
                        strokeDasharray="5,3"
                      />
                    </g>
                  ) : isCountersunk ? (
                    // DIN 7991 Countersunk 90° Head
                    <g>
                      <polygon
                        points={`
                          ${boltOriginX - scK},${centerlineY - scDk / 2}
                          ${boltOriginX},${centerlineY - scD / 2}
                          ${boltOriginX},${centerlineY + scD / 2}
                          ${boltOriginX - scK},${centerlineY + scDk / 2}
                        `}
                        fill="#ffffff"
                        stroke="#000000"
                        strokeWidth="2.6"
                      />
                      {/* Hex socket dashed recess */}
                      <rect
                        x={boltOriginX - scK}
                        y={centerlineY - scS / 2}
                        width={scK * 0.6}
                        height={scS}
                        fill="none"
                        stroke="#000000"
                        strokeWidth="1.0"
                        strokeDasharray="4,2"
                      />
                    </g>
                  ) : (
                    // Standard Hex (DIN 933/931) or Heavy Hex (ASTM A325)
                    <g>
                      <rect
                        x={boltOriginX - scK}
                        y={centerlineY - scS / 2}
                        width={scK}
                        height={scS}
                        fill="#ffffff"
                        stroke="#000000"
                        strokeWidth={isHeavyHex ? "3.2" : "2.6"}
                      />
                      <rect
                        x={boltOriginX - scK + 1}
                        y={centerlineY + scS / 6}
                        width={scK - 2}
                        height={scS / 3 - 1}
                        fill="url(#hatch45)"
                        opacity="0.85"
                      />
                      <path
                        d={`M ${boltOriginX - scK} ${centerlineY - scS / 4} Q ${boltOriginX - scK + scK * 0.45} ${centerlineY} ${boltOriginX - scK} ${centerlineY + scS / 4}`}
                        fill="none"
                        stroke="#000000"
                        strokeWidth="1.4"
                      />
                      <line
                        x1={boltOriginX - scK}
                        y1={centerlineY - scS / 4}
                        x2={boltOriginX}
                        y2={centerlineY - scS / 4}
                        stroke="#000000"
                        strokeWidth="1.2"
                      />
                      <line
                        x1={boltOriginX - scK}
                        y1={centerlineY + scS / 4}
                        x2={boltOriginX}
                        y2={centerlineY + scS / 4}
                        stroke="#000000"
                        strokeWidth="1.2"
                      />
                    </g>
                  )}

                  {/* Underhead contact face */}
                  <line
                    x1={boltOriginX}
                    y1={centerlineY - (isAllen || isCountersunk ? scDk : scS) / 2}
                    x2={boltOriginX}
                    y2={centerlineY + (isAllen || isCountersunk ? scDk : scS) / 2}
                    stroke="#000000"
                    strokeWidth="2.6"
                  />

                  {/* SHANK (CORPO LISO) */}
                  {scL - scB > 0 && (
                    <g>
                      <rect
                        x={boltOriginX}
                        y={centerlineY - scD / 2}
                        width={scL - scB}
                        height={scD}
                        fill="#ffffff"
                        stroke="#000000"
                        strokeWidth="2.6"
                      />
                      <rect
                        x={boltOriginX}
                        y={centerlineY + scD / 5}
                        width={scL - scB}
                        height={scD * 0.3}
                        fill="url(#fineHatch)"
                        opacity="0.75"
                      />
                      <line
                        x1={boltOriginX + (scL - scB)}
                        y1={centerlineY - scD / 2}
                        x2={boltOriginX + (scL - scB)}
                        y2={centerlineY + scD / 2}
                        stroke="#000000"
                        strokeWidth="2.0"
                      />
                    </g>
                  )}

                  {/* THREAD SECTION */}
                  <g>
                    <rect
                      x={boltOriginX + (scL - scB)}
                      y={centerlineY - scD / 2}
                      width={scB}
                      height={scD}
                      fill="#ffffff"
                      stroke="#000000"
                      strokeWidth="2.6"
                    />

                    {/* Thread Core Root Lines */}
                    <line
                      x1={boltOriginX + (scL - scB)}
                      y1={centerlineY - (scD / 2) * 0.84}
                      x2={boltOriginX + scL}
                      y2={centerlineY - (scD / 2) * 0.84}
                      stroke="#000000"
                      strokeWidth="0.9"
                      strokeDasharray="7,2"
                    />
                    <line
                      x1={boltOriginX + (scL - scB)}
                      y1={centerlineY + (scD / 2) * 0.84}
                      x2={boltOriginX + scL}
                      y2={centerlineY + (scD / 2) * 0.84}
                      stroke="#000000"
                      strokeWidth="0.9"
                      strokeDasharray="7,2"
                    />

                    {/* Thread Crest Lines */}
                    {(() => {
                      const threadPitchPx = Math.max(P * draftingScale, 9);
                      const count = Math.floor(scB / threadPitchPx);
                      const lines = [];
                      for (let i = 0; i < count; i++) {
                        const xTop = boltOriginX + (scL - scB) + i * threadPitchPx;
                        const xBottom = xTop + threadPitchPx * 0.5;
                        lines.push(
                          <line
                            key={`th-${i}`}
                            x1={xTop}
                            y1={centerlineY - scD / 2}
                            x2={xBottom}
                            y2={centerlineY + scD / 2}
                            stroke="#000000"
                            strokeWidth="1.2"
                          />
                        );
                      }
                      return lines;
                    })()}

                    <rect
                      x={boltOriginX + (scL - scB)}
                      y={centerlineY + scD * 0.2}
                      width={scB}
                      height={scD * 0.3}
                      fill="url(#fineHatch)"
                      opacity="0.6"
                    />
                  </g>

                  {/* Finished Tip Chamfer */}
                  <polygon
                    points={`
                      ${boltOriginX + scL},${centerlineY - scD / 2}
                      ${boltOriginX + scL + Math.min(scD * 0.15, 14)},${centerlineY - scD * 0.35}
                      ${boltOriginX + scL + Math.min(scD * 0.15, 14)},${centerlineY + scD * 0.35}
                      ${boltOriginX + scL},${centerlineY + scD / 2}
                    `}
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth="2.6"
                  />

                  {/* -------------------------------------------------------------- */}
                  {/* SOBREMETAL DE CORTE PARAMÉTRICO (RAW BAR CUTTING ENVELOPE)    */}
                  {/* -------------------------------------------------------------- */}
                  {sobremetal > 0 && (
                    <g id="sobremetal-corte-envelope">
                      {/* Raw saw cut envelope extension */}
                      <rect
                        x={boltOriginX + scL}
                        y={centerlineY - scD / 2}
                        width={scCut}
                        height={scD}
                        fill="#fee2e2"
                        stroke="#b91c1c"
                        strokeWidth="1.4"
                        strokeDasharray="4,2"
                        opacity="0.85"
                      />
                      {/* Saw cutting line */}
                      <line
                        x1={boltOriginX + scL + scCut}
                        y1={centerlineY - scD / 2 - 12}
                        x2={boltOriginX + scL + scCut}
                        y2={centerlineY + scD / 2 + 12}
                        stroke="#b91c1c"
                        strokeWidth="1.8"
                        strokeDasharray="6,2"
                      />
                      {/* Scissors / Cut mark icon indication */}
                      <text
                        x={boltOriginX + scL + scCut / 2}
                        y={centerlineY - scD / 2 - 8}
                        textAnchor="middle"
                        fill="#b91c1c"
                        fontSize="11"
                        fontWeight="800"
                        className="font-iso"
                      >
                        +{sobremetal} mm
                      </text>
                    </g>
                  )}

                  {/* FRONT VIEW (VISTA FRONTAL) */}
                  <g transform={`translate(${frontViewX}, ${centerlineY})`}>
                    {isAllen || isCountersunk ? (
                      <g>
                        <circle cx="0" cy="0" r={scDk / 2} fill="#ffffff" stroke="#000000" strokeWidth="2.8" />
                        <circle cx="0" cy="0" r={scD / 2} fill="none" stroke="#000000" strokeWidth="1.0" strokeDasharray="4,2" />
                        <polygon
                          points={Array.from({ length: 6 }).map((_, i) => {
                            const angle = (i * 60 * Math.PI) / 180;
                            const r = (scS / 2) * 1.1547;
                            return `${Math.cos(angle) * r},${Math.sin(angle) * r}`;
                          }).join(' ')}
                          fill="#ffffff"
                          stroke="#000000"
                          strokeWidth="2.2"
                        />
                      </g>
                    ) : (
                      <g>
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
                        <circle cx="0" cy="0" r={scS / 2} fill="none" stroke="#000000" strokeWidth="1.0" />
                        <circle cx="0" cy="0" r={scD / 2} fill="none" stroke="#000000" strokeWidth="1.4" />
                        <path
                          d={`M 0,${-(scD / 2) * 0.84} A ${(scD / 2) * 0.84} ${(scD / 2) * 0.84} 0 1 1 ${-(scD / 2) * 0.84},0`}
                          fill="none"
                          stroke="#000000"
                          strokeWidth="0.8"
                        />
                      </g>
                    )}
                  </g>

                  {/* ============================================================== */}
                  {/* COTAS TÉCNICAS (DIMENSION LINES)                               */}
                  {/* ============================================================== */}
                  {/* Cota L (Nominal Acabado) */}
                  <g className="cursor-pointer" onClick={() => handleCotaSelect('L')}>
                    <line
                      x1={boltOriginX}
                      y1={centerlineY + Math.max(scS, scDk, scD) / 2 + 48}
                      x2={boltOriginX + scL}
                      y2={centerlineY + Math.max(scS, scDk, scD) / 2 + 48}
                      stroke="#000000"
                      strokeWidth="0.9"
                      markerStart="url(#sharpArrow)"
                      markerEnd="url(#sharpArrow)"
                    />
                    <line
                      x1={boltOriginX}
                      y1={centerlineY + scD / 2 + 4}
                      x2={boltOriginX}
                      y2={centerlineY + Math.max(scS, scDk, scD) / 2 + 60}
                      stroke="#000000"
                      strokeWidth="0.6"
                    />
                    <line
                      x1={boltOriginX + scL}
                      y1={centerlineY + scD / 2 + 4}
                      x2={boltOriginX + scL}
                      y2={centerlineY + Math.max(scS, scDk, scD) / 2 + 60}
                      stroke="#000000"
                      strokeWidth="0.6"
                    />
                    <text
                      x={boltOriginX + scL / 2}
                      y={centerlineY + Math.max(scS, scDk, scD) / 2 + 40}
                      textAnchor="middle"
                      fill="#000000"
                      fontSize="17"
                      fontWeight="700"
                      className="font-engineer"
                    >
                      L = {L}
                    </text>
                  </g>

                  {/* COTA DE PROCESSO MES: COMPRIMENTO DE CORTE COM SOBREMETAL */}
                  {sobremetal > 0 && (
                    <g className="cursor-pointer" onClick={() => handleCotaSelect('L_corte')}>
                      <line
                        x1={boltOriginX}
                        y1={centerlineY + Math.max(scS, scDk, scD) / 2 + 82}
                        x2={boltOriginX + scL + scCut}
                        y2={centerlineY + Math.max(scS, scDk, scD) / 2 + 82}
                        stroke="#b91c1c"
                        strokeWidth="1.0"
                        markerStart="url(#sharpArrowRed)"
                        markerEnd="url(#sharpArrowRed)"
                      />
                      <line
                        x1={boltOriginX}
                        y1={centerlineY + Math.max(scS, scDk, scD) / 2 + 55}
                        x2={boltOriginX}
                        y2={centerlineY + Math.max(scS, scDk, scD) / 2 + 94}
                        stroke="#b91c1c"
                        strokeWidth="0.6"
                      />
                      <line
                        x1={boltOriginX + scL + scCut}
                        y1={centerlineY + scD / 2}
                        x2={boltOriginX + scL + scCut}
                        y2={centerlineY + Math.max(scS, scDk, scD) / 2 + 94}
                        stroke="#b91c1c"
                        strokeWidth="0.6"
                        strokeDasharray="4,2"
                      />
                      <text
                        x={boltOriginX + (scL + scCut) / 2}
                        y={centerlineY + Math.max(scS, scDk, scD) / 2 + 75}
                        textAnchor="middle"
                        fill="#b91c1c"
                        fontSize="14"
                        fontWeight="700"
                        className="font-engineer"
                      >
                        L corte = {L + sobremetal} mm (Sobremetal +{sobremetal}mm)
                      </text>
                    </g>
                  )}

                  {/* Cota k (Altura da Cabeça) */}
                  <g className="cursor-pointer" onClick={() => handleCotaSelect('k')}>
                    <line
                      x1={boltOriginX - scK}
                      y1={centerlineY - (isAllen || isCountersunk ? scDk : scS) / 2 - 40}
                      x2={boltOriginX}
                      y2={centerlineY - (isAllen || isCountersunk ? scDk : scS) / 2 - 40}
                      stroke="#000000"
                      strokeWidth="0.9"
                      markerStart="url(#sharpArrow)"
                      markerEnd="url(#sharpArrow)"
                    />
                    <line
                      x1={boltOriginX - scK}
                      y1={centerlineY - (isAllen || isCountersunk ? scDk : scS) / 2}
                      x2={boltOriginX - scK}
                      y2={centerlineY - (isAllen || isCountersunk ? scDk : scS) / 2 - 50}
                      stroke="#000000"
                      strokeWidth="0.6"
                    />
                    <line
                      x1={boltOriginX}
                      y1={centerlineY - (isAllen || isCountersunk ? scDk : scS) / 2}
                      x2={boltOriginX}
                      y2={centerlineY - (isAllen || isCountersunk ? scDk : scS) / 2 - 50}
                      stroke="#000000"
                      strokeWidth="0.6"
                    />
                    <text
                      x={boltOriginX - scK / 2}
                      y={centerlineY - (isAllen || isCountersunk ? scDk : scS) / 2 - 46}
                      textAnchor="middle"
                      fill="#000000"
                      fontSize="16"
                      fontWeight="700"
                      className="font-engineer"
                    >
                      k = {k}
                    </text>
                  </g>

                  {/* Cota b (Comprimento Útil de Rosca se parcial) */}
                  {scL - scB > 0 && (
                    <g className="cursor-pointer" onClick={() => handleCotaSelect('b')}>
                      <line
                        x1={boltOriginX + (scL - scB)}
                        y1={centerlineY - scD / 2 - 40}
                        x2={boltOriginX + scL}
                        y2={centerlineY - scD / 2 - 40}
                        stroke="#000000"
                        strokeWidth="0.9"
                        markerStart="url(#sharpArrow)"
                        markerEnd="url(#sharpArrow)"
                      />
                      <line
                        x1={boltOriginX + (scL - scB)}
                        y1={centerlineY - scD / 2}
                        x2={boltOriginX + (scL - scB)}
                        y2={centerlineY - scD / 2 - 52}
                        stroke="#000000"
                        strokeWidth="0.6"
                      />
                      <line
                        x1={boltOriginX + scL}
                        y1={centerlineY - scD / 2}
                        x2={boltOriginX + scL}
                        y2={centerlineY - scD / 2 - 52}
                        stroke="#000000"
                        strokeWidth="0.6"
                      />
                      <text
                        x={boltOriginX + scL - scB / 2}
                        y={centerlineY - scD / 2 - 46}
                        textAnchor="middle"
                        fill="#000000"
                        fontSize="16"
                        fontWeight="700"
                        className="font-engineer"
                      >
                        b = {b}
                      </text>
                    </g>
                  )}

                  {/* Cota M (Linha de Chamada ISO 128 com Seta na Rosca) */}
                  <g className="cursor-pointer" onClick={() => handleCotaSelect('d')}>
                    <path
                      d={`
                        M ${boltOriginX + scL - Math.min(scB * 0.2, 25)} ${centerlineY - scD / 2}
                        L ${boltOriginX + scL + 35} ${centerlineY - scD / 2 - 45}
                        L ${boltOriginX + scL + 130} ${centerlineY - scD / 2 - 45}
                      `}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="1.0"
                      markerStart="url(#sharpArrow)"
                    />
                    <text
                      x={boltOriginX + scL + 40}
                      y={centerlineY - scD / 2 - 52}
                      textAnchor="start"
                      fill="#000000"
                      fontSize="16"
                      fontWeight="700"
                      className="font-engineer"
                    >
                      {product.bitola.includes('"') ? product.bitola : `M${d}x${P}`} - 6g
                    </text>
                  </g>

                  {/* Cota s (Abertura de Chave) */}
                  <g className="cursor-pointer" onClick={() => handleCotaSelect('s')}>
                    <line
                      x1={frontViewX - scS / 2}
                      y1={centerlineY + (isAllen || isCountersunk ? scDk : scS) / 2 + 40}
                      x2={frontViewX + scS / 2}
                      y2={centerlineY + (isAllen || isCountersunk ? scDk : scS) / 2 + 40}
                      stroke="#000000"
                      strokeWidth="0.9"
                      markerStart="url(#sharpArrow)"
                      markerEnd="url(#sharpArrow)"
                    />
                    <line
                      x1={frontViewX - scS / 2}
                      y1={centerlineY + (isAllen || isCountersunk ? scDk : scS) / 2}
                      x2={frontViewX - scS / 2}
                      y2={centerlineY + (isAllen || isCountersunk ? scDk : scS) / 2 + 52}
                      stroke="#000000"
                      strokeWidth="0.6"
                    />
                    <line
                      x1={frontViewX + scS / 2}
                      y1={centerlineY + (isAllen || isCountersunk ? scDk : scS) / 2}
                      x2={frontViewX + scS / 2}
                      y2={centerlineY + (isAllen || isCountersunk ? scDk : scS) / 2 + 52}
                      stroke="#000000"
                      strokeWidth="0.6"
                    />
                    <text
                      x={frontViewX}
                      y={centerlineY + (isAllen || isCountersunk ? scDk : scS) / 2 + 34}
                      textAnchor="middle"
                      fill="#000000"
                      fontSize="16"
                      fontWeight="700"
                      className="font-engineer"
                    >
                      s = {s}
                    </text>
                  </g>
                </g>
              )}

              {/* -------------------------------------------------------------- */}
              {/* PRISIONEIRO: ASTM A193 B7, DIN 975, DIN 938                   */}
              {/* -------------------------------------------------------------- */}
              {isStud && (
                <g>
                  {/* Full stud rod cylinder */}
                  <rect
                    x={boltOriginX}
                    y={centerlineY - scD / 2}
                    width={scL}
                    height={scD}
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth="2.6"
                  />
                  {/* Thread representation */}
                  <rect
                    x={boltOriginX}
                    y={centerlineY - scD / 2}
                    width={scL}
                    height={scD}
                    fill="url(#fineHatch)"
                    opacity="0.35"
                  />
                  {/* Core lines */}
                  <line
                    x1={boltOriginX}
                    y1={centerlineY - (scD / 2) * 0.84}
                    x2={boltOriginX + scL}
                    y2={centerlineY - (scD / 2) * 0.84}
                    stroke="#000000"
                    strokeWidth="0.9"
                    strokeDasharray="7,2"
                  />
                  <line
                    x1={boltOriginX}
                    y1={centerlineY + (scD / 2) * 0.84}
                    x2={boltOriginX + scL}
                    y2={centerlineY + (scD / 2) * 0.84}
                    stroke="#000000"
                    strokeWidth="0.9"
                    strokeDasharray="7,2"
                  />

                  {/* Sobremetal de corte na extremidade */}
                  {sobremetal > 0 && (
                    <g>
                      <rect
                        x={boltOriginX + scL}
                        y={centerlineY - scD / 2}
                        width={scCut}
                        height={scD}
                        fill="#fee2e2"
                        stroke="#b91c1c"
                        strokeWidth="1.4"
                        strokeDasharray="4,2"
                      />
                      <line
                        x1={boltOriginX + scL + scCut}
                        y1={centerlineY - scD / 2 - 10}
                        x2={boltOriginX + scL + scCut}
                        y2={centerlineY + scD / 2 + 10}
                        stroke="#b91c1c"
                        strokeWidth="1.8"
                        strokeDasharray="6,2"
                      />
                    </g>
                  )}

                  {/* Stud Front View (Circle) */}
                  <g transform={`translate(${frontViewX}, ${centerlineY})`}>
                    <circle cx="0" cy="0" r={scD / 2} fill="#ffffff" stroke="#000000" strokeWidth="2.8" />
                    <circle cx="0" cy="0" r={(scD / 2) * 0.84} fill="none" stroke="#000000" strokeWidth="1.0" strokeDasharray="4,2" />
                  </g>

                  {/* Cota L */}
                  <line
                    x1={boltOriginX}
                    y1={centerlineY + scD / 2 + 45}
                    x2={boltOriginX + scL}
                    y2={centerlineY + scD / 2 + 45}
                    stroke="#000000"
                    strokeWidth="0.9"
                    markerStart="url(#sharpArrow)"
                    markerEnd="url(#sharpArrow)"
                  />
                  <text
                    x={boltOriginX + scL / 2}
                    y={centerlineY + scD / 2 + 38}
                    textAnchor="middle"
                    fill="#000000"
                    fontSize="16"
                    fontWeight="700"
                    className="font-engineer"
                  >
                    L = {L} mm
                  </text>

                  {/* Cota Corte */}
                  {sobremetal > 0 && (
                    <text
                      x={boltOriginX + (scL + scCut) / 2}
                      y={centerlineY + scD / 2 + 75}
                      textAnchor="middle"
                      fill="#b91c1c"
                      fontSize="14"
                      fontWeight="700"
                      className="font-engineer"
                    >
                      L corte = {L + sobremetal} mm (+{sobremetal}mm sobremetal)
                    </text>
                  )}
                </g>
              )}

              {/* -------------------------------------------------------------- */}
              {/* PORCA: DIN 934, ASTM A563, DIN 985                             */}
              {/* -------------------------------------------------------------- */}
              {isNut && (
                <g>
                  {/* Nut Sectioned Side View */}
                  <rect
                    x={boltOriginX}
                    y={centerlineY - scS / 2}
                    width={scK}
                    height={(scS - scD) / 2}
                    fill="url(#hatch45)"
                    stroke="#000000"
                    strokeWidth="2.4"
                  />
                  <rect
                    x={boltOriginX}
                    y={centerlineY + scD / 2}
                    width={scK}
                    height={(scS - scD) / 2}
                    fill="url(#hatch45)"
                    stroke="#000000"
                    strokeWidth="2.4"
                  />
                  <line x1={boltOriginX} y1={centerlineY - scD / 2} x2={boltOriginX + scK} y2={centerlineY - scD / 2} stroke="#000000" strokeWidth="2.2" />
                  <line x1={boltOriginX} y1={centerlineY + scD / 2} x2={boltOriginX + scK} y2={centerlineY + scD / 2} stroke="#000000" strokeWidth="2.2" />

                  {/* Front View */}
                  <g transform={`translate(${frontViewX}, ${centerlineY})`}>
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
                    <circle cx="0" cy="0" r={scD / 2} fill="#ffffff" stroke="#000000" strokeWidth="1.6" />
                    <path
                      d={`M 0,${-(scD / 2) * 1.08} A ${(scD / 2) * 1.08} ${(scD / 2) * 1.08} 0 1 1 ${-(scD / 2) * 1.08},0`}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="1.0"
                    />
                  </g>

                  {/* Height m */}
                  <text
                    x={boltOriginX + scK / 2}
                    y={centerlineY - scS / 2 - 42}
                    textAnchor="middle"
                    fill="#000000"
                    fontSize="16"
                    fontWeight="700"
                    className="font-engineer"
                  >
                    m = {k}
                  </text>
                  {/* Wrench s */}
                  <text
                    x={frontViewX}
                    y={centerlineY + scS / 2 + 34}
                    textAnchor="middle"
                    fill="#000000"
                    fontSize="16"
                    fontWeight="700"
                    className="font-engineer"
                  >
                    s = {s}
                  </text>
                </g>
              )}

              {/* -------------------------------------------------------------- */}
              {/* ARRUELAS: DIN 125A, DIN 127B, ASTM F436                        */}
              {/* -------------------------------------------------------------- */}
              {isWasher && (
                <g>
                  <rect
                    x={boltOriginX}
                    y={centerlineY - scD2 / 2}
                    width={scThick}
                    height={(scD2 - scD1) / 2}
                    fill="url(#hatch45)"
                    stroke="#000000"
                    strokeWidth="2.4"
                  />
                  <rect
                    x={boltOriginX}
                    y={centerlineY + scD1 / 2}
                    width={scThick}
                    height={(scD2 - scD1) / 2}
                    fill="url(#hatch45)"
                    stroke="#000000"
                    strokeWidth="2.4"
                  />
                  <g transform={`translate(${frontViewX}, ${centerlineY})`}>
                    <circle cx="0" cy="0" r={scD2 / 2} fill="#ffffff" stroke="#000000" strokeWidth="2.8" />
                    <circle cx="0" cy="0" r={scD1 / 2} fill="#ffffff" stroke="#000000" strokeWidth="2.2" />
                  </g>
                  <text
                    x={boltOriginX + scThick / 2}
                    y={centerlineY - scD2 / 2 - 42}
                    textAnchor="middle"
                    fill="#000000"
                    fontSize="15"
                    fontWeight="700"
                    className="font-engineer"
                  >
                    s = {thickness}
                  </text>
                </g>
              )}

              {/* ============================================================== */}
              {/* ZONE 3: FACTORY FLOOR TOLERANCE TABLE (CANTO SUPERIOR DIR)     */}
              {/* ============================================================== */}
              <g transform="translate(1069, 38)">
                <rect x="0" y="0" width="480" height="220" fill="#ffffff" stroke="#000000" strokeWidth="2.2" />
                <rect x="0" y="0" width="480" height="32" fill="#f8fafc" stroke="#000000" strokeWidth="1.4" />
                <text
                  x="240"
                  y="21"
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="12.5"
                  fontWeight="800"
                  className="font-iso"
                  letterSpacing="0.05em"
                >
                  TOLERÂNCIAS DE CHÃO DE FÁBRICA (CQ)
                </text>

                <rect x="0" y="32" width="480" height="24" fill="#ffffff" stroke="#000000" strokeWidth="1.0" />
                <text x="12" y="48" fill="#000000" fontSize="10.5" fontWeight="700" className="font-iso">COTAS CRÍTICAS</text>
                <text x="160" y="48" fill="#000000" fontSize="10.5" fontWeight="700" className="font-iso">TOLERÂNCIA (MÍN / MÁX)</text>
                <text x="340" y="48" fill="#000000" fontSize="10.5" fontWeight="700" className="font-iso">INSTRUMENTO</text>

                <line x1="150" y1="32" x2="150" y2="220" stroke="#000000" strokeWidth="1.0" />
                <line x1="330" y1="32" x2="330" y2="220" stroke="#000000" strokeWidth="1.0" />

                {[
                  { cota: `Corpo (d = Ø${d})`, tol: `${(d - 0.28).toFixed(2)} / ${d.toFixed(2)} mm (h13)`, inst: 'Micrômetro 0.001mm' },
                  { cota: `Chave (s = ${s})`, tol: `${(s - 0.35).toFixed(2)} / ${s.toFixed(2)} mm (h13)`, inst: 'Paquímetro Digital' },
                  { cota: `Cabeça (k = ${k})`, tol: `${(k - 0.25).toFixed(2)} / ${(k + 0.25).toFixed(2)} mm (js15)`, inst: 'Relógio Apalpador' },
                  { cota: `Rosca (${P}mm)`, tol: 'Campo 6g / 6H (ISO 965)', inst: 'Calibrador Anel P/NP' },
                  { cota: `Compr. (L = ${L})`, tol: `${L - 1.5} / ${L + 1.5} mm (DIN 78)`, inst: 'Escala / Paquímetro' },
                  { cota: `Corte Bruto (+${sobremetal})`, tol: `${L + sobremetal - 1.0} / ${L + sobremetal + 1.0} mm`, inst: 'Trena Industrial' }
                ].map((row, idx) => {
                  const y = 56 + idx * 27.2;
                  return (
                    <g key={idx}>
                      <line x1="0" y1={y} x2="480" y2={y} stroke="#000000" strokeWidth="0.8" />
                      <text x="12" y={y + 18} fill="#000000" fontSize="11" fontWeight="600" className="font-iso">{row.cota}</text>
                      <text x="160" y={y + 18} fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">{row.tol}</text>
                      <text x="340" y={y + 18} fill="#000000" fontSize="10.5" className="font-iso">{row.inst}</text>
                    </g>
                  );
                })}
              </g>

              {/* ============================================================== */}
              {/* ZONE 4: TECHNICAL NOTES (CANTO INFERIOR ESQUERDO)               */}
              {/* ============================================================== */}
              <g transform="translate(115, 920)">
                <text x="0" y="0" fill="#000000" fontSize="13" fontWeight="800" className="font-iso">
                  NOTAS GERAIS DE FABRICAÇÃO:
                </text>
                <g fill="#000000" fontSize="12.5" fontWeight="600" className="font-engineer">
                  <text x="0" y="24">1. TODAS AS DIMENSÕES EM MILÍMETROS (mm) EXCETO INDICAÇÃO CONTRÁRIA.</text>
                  <text x="0" y="44">2. TOLERÂNCIAS GERAIS NÃO INDICADAS CONFORME NORMA ISO 2768-mK.</text>
                  <text x="0" y="64">3. ROSCA PADRONIZADA CONFORME NORMA {product.standard_code}.</text>
                  <text x="0" y="84">4. PEÇA ISENTA DE REBARBAS, BORDAS CORTANTES E RESÍDUOS DE ÓLEO.</text>
                  <text x="0" y="104">5. ENSAIO DE TRAÇÃO E DUREZA SEGUNDO NBR ISO 898-1 / CQ AQL 0.65.</text>
                  <text x="0" y="124" fill="#b91c1c" fontWeight="700">
                    6. CORTE DO TARUGO PROGRAMADO: L = {k + L + sobremetal} mm (SOBREMETAL DE CORTE: +{sobremetal} mm).
                  </text>
                </g>
              </g>

              {/* ============================================================== */}
              {/* ZONE 5: DELTA TITLE BLOCK + REVISIONS (CANTO INFERIOR DIREITO) */}
              {/* ============================================================== */}
              <g transform="translate(969, 854)">
                <rect x="0" y="0" width="580" height="230" fill="#ffffff" stroke="#000000" strokeWidth="2.8" />

                {/* Revision Bar */}
                <rect x="0" y="0" width="580" height="24" fill="#f8fafc" stroke="#000000" strokeWidth="1.2" />
                <text x="20" y="17" textAnchor="middle" fill="#000000" fontSize="10.5" fontWeight="800" className="font-iso">REV</text>
                <text x="48" y="17" fill="#000000" fontSize="10.5" fontWeight="800" className="font-iso">MODIFICAÇÃO DE ENGENHARIA</text>
                <text x="445" y="17" textAnchor="middle" fill="#000000" fontSize="10.5" fontWeight="800" className="font-iso">DATA</text>
                <text x="535" y="17" textAnchor="middle" fill="#000000" fontSize="10.5" fontWeight="800" className="font-iso">AUTOR</text>

                <rect x="0" y="24" width="580" height="26" fill="#ffffff" stroke="#000000" strokeWidth="1.0" />
                <text x="20" y="42" textAnchor="middle" fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">03</text>
                <text x="48" y="42" fill="#000000" fontSize="12" fontWeight="600" className="font-engineer">Adição de Sobremetal de Corte (+{sobremetal}mm) e Geometria Paramétrica</text>
                <text x="445" y="42" textAnchor="middle" fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">{new Date().toLocaleDateString('pt-BR')}</text>
                <text x="535" y="42" textAnchor="middle" fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">E. Silva</text>

                <line x1="0" y1="50" x2="580" y2="50" stroke="#000000" strokeWidth="2.0" />

                {/* Delta Brand Box */}
                <rect x="0" y="50" width="190" height="180" fill="#ffffff" stroke="#000000" strokeWidth="1.4" />
                <g transform="translate(10, 58) scale(0.55)">
                  <circle cx="100" cy="100" r="92" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                  <polygon points="65,152 135,152 100,118" fill="#991b1b" stroke="#000000" strokeWidth="1" />
                  <path d="M 96,82 C 90,60 70,52 62,56 C 74,68 88,96 82,130 C 88,110 96,94 96,82 Z" fill="#581c24" />
                  <path d="M 104,82 C 110,60 130,52 138,56 C 126,68 112,96 118,130 C 112,110 104,94 104,82 Z" fill="#581c24" />
                  <path d="M 86,72 C 78,54 58,52 48,60 C 60,70 76,102 64,142 C 72,120 84,94 86,72 Z" fill="#7f1d1d" />
                  <path d="M 114,72 C 122,54 142,52 152,60 C 140,70 124,102 136,142 C 128,120 116,94 114,72 Z" fill="#7f1d1d" />
                  <path d="M 76,68 C 66,54 48,58 38,68 C 50,78 64,112 48,150 C 58,128 72,96 76,68 Z" fill="#b91c1c" />
                  <path d="M 124,68 C 134,54 152,58 162,68 C 150,78 136,112 152,150 C 142,128 128,96 124,68 Z" fill="#b91c1c" />
                </g>

                <text x="120" y="96" textAnchor="middle" fill="#000000" fontSize="15" fontWeight="800" className="font-stamp">DELTA</text>
                <text x="120" y="114" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="700" className="font-iso" letterSpacing="0.08em">PARAFUSOS ESPECIAIS</text>
                <text x="120" y="128" textAnchor="middle" fill="#000000" fontSize="7.5" className="font-iso">ENGENHARIA DE PRODUTO</text>

                {/* Right: Title, SKU, Number, Material */}
                <rect x="190" y="50" width="390" height="60" fill="#ffffff" stroke="#000000" strokeWidth="1.4" />
                <text x="200" y="65" fill="#000000" fontSize="8.5" fontWeight="700" className="font-iso">DENOMINAÇÃO DO PROJETO:</text>
                <g transform="translate(200, 70)" clipPath="url(#carimboTitleClip)">
                  <text x="0" y="16" fill="#000000" fontSize="15" fontWeight="700" className="font-engineer">
                    {product.standard_code} - {product.bitola} {product.comprimento ? `x ${product.comprimento}` : ''} ({product.classe_resistencia})
                  </text>
                  <text x="0" y="32" fill="#000000" fontSize="11" fontWeight="700" className="font-iso">
                    SKU: <tspan className="font-engineer text-xs">{product.sku_gerado}</tspan>
                  </text>
                </g>

                <rect x="190" y="110" width="220" height="42" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
                <text x="198" y="123" fill="#000000" fontSize="8" fontWeight="700" className="font-iso">Nº DESENHO:</text>
                <g transform="translate(198, 126)" clipPath="url(#carimboDrawingNoClip)">
                  <text x="0" y="16" fill="#000000" fontSize="12.5" fontWeight="700" className="font-engineer">
                    DF-{product.sku_gerado.slice(0, 19)}
                  </text>
                </g>

                <rect x="410" y="110" width="85" height="42" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
                <text x="418" y="123" fill="#000000" fontSize="8" fontWeight="700" className="font-iso">REV:</text>
                <text x="452" y="143" textAnchor="middle" fill="#000000" fontSize="16" fontWeight="700" className="font-engineer">03</text>

                <rect x="495" y="110" width="85" height="42" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
                <text x="503" y="123" fill="#000000" fontSize="8" fontWeight="700" className="font-iso">FOLHA:</text>
                <text x="537" y="143" textAnchor="middle" fill="#000000" fontSize="13" fontWeight="700" className="font-engineer">1 / 1</text>

                <rect x="190" y="152" width="195" height="42" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
                <text x="198" y="165" fill="#000000" fontSize="8" fontWeight="700" className="font-iso">MATÉRIA-PRIMA:</text>
                <g transform="translate(198, 168)" clipPath="url(#carimboMaterialClip)">
                  <text x="0" y="15" fill="#000000" fontSize="11" fontWeight="700" className="font-engineer">
                    {product.material_base}
                  </text>
                </g>

                <rect x="385" y="152" width="195" height="42" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
                <text x="393" y="165" fill="#000000" fontSize="8" fontWeight="700" className="font-iso">ACABAMENTO:</text>
                <g transform="translate(393, 168)" clipPath="url(#carimboFinishClip)">
                  <text x="0" y="15" fill="#000000" fontSize="11" fontWeight="700" className="font-engineer">
                    {product.tratamento_superficial}
                  </text>
                </g>

                <rect x="190" y="194" width="110" height="36" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
                <text x="196" y="206" fill="#000000" fontSize="7.5" fontWeight="700" className="font-iso">ELABORADO:</text>
                <text x="196" y="222" fill="#000000" fontSize="11" fontWeight="700" className="font-engineer">E. Silva</text>

                <rect x="300" y="194" width="110" height="36" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
                <text x="306" y="206" fill="#000000" fontSize="7.5" fontWeight="700" className="font-iso">APROVADO:</text>
                <text x="306" y="222" fill="#000000" fontSize="11" fontWeight="700" className="font-engineer">Eng. Delta</text>

                <rect x="410" y="194" width="85" height="36" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
                <text x="416" y="206" fill="#000000" fontSize="7.5" fontWeight="700" className="font-iso">ESCALA:</text>
                <text x="452" y="222" textAnchor="middle" fill="#000000" fontSize="12" fontWeight="700" className="font-engineer">
                  {draftingScaleLabel}
                </text>

                <rect x="495" y="194" width="85" height="36" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
                <text x="501" y="206" fill="#000000" fontSize="7.5" fontWeight="700" className="font-iso">MASSA:</text>
                <text x="537" y="222" textAnchor="middle" fill="#000000" fontSize="11.5" fontWeight="700" className="font-engineer">
                  {(product.peso_liquido_kg * 1000).toFixed(0)}g
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
