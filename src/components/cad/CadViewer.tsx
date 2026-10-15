// src/components/cad/CadViewer.tsx - Interactive Parametric 2D Vector CAD Drafting Board for DeltaFix
'use client';

import React, { useState } from 'react';
import { StandardFamily, StandardDimension, ResistanceClass, BaseMaterial, SurfaceFinish } from '@/lib/standards/types';
import { Ruler, CheckCircle2, ShieldAlert, Cpu, Eye, Download, Sparkles } from 'lucide-react';

interface CadViewerProps {
  family: StandardFamily;
  standardCode: string;
  bitola: string;
  dimension: StandardDimension;
  comprimento?: number;
  comprimentoRoscaB?: number;
  classeResistencia: ResistanceClass;
  materialBase: BaseMaterial;
  tratamentoSuperficial: SurfaceFinish;
  skuGerado: string;
  codigoInternoDelta?: string;
  pesoLiquidoKg: number;
  fatorPerdaPercentual: number;
  onDimensionClick?: (dimName: string) => void;
}

export function CadViewer({
  family,
  standardCode,
  bitola,
  dimension,
  comprimento = 60,
  comprimentoRoscaB,
  classeResistencia,
  materialBase,
  tratamentoSuperficial,
  skuGerado,
  codigoInternoDelta,
  pesoLiquidoKg,
  fatorPerdaPercentual,
  onDimensionClick
}: CadViewerProps) {
  const [selectedDim, setSelectedDim] = useState<string | null>('L');
  const [zoomScale, setZoomScale] = useState<number>(1);

  const d = dimension.diametro_nominal || 16;
  const P = dimension.passo || 2.0;
  const L = comprimento;
  const k = dimension.altura_cabeca || (family === 'porca' ? d * 0.8 : d * 0.65);
  const s = dimension.chave || d * 1.5;
  const dk = dimension.diametro_cabeca || d * 1.5;
  const b = comprimentoRoscaB ?? (standardCode === 'DIN 933' ? L : Math.min(2 * d + 6, L));
  const d1 = dimension.diametro_interno || d + 0.5;
  const d2 = dimension.diametro_externo || d * 2.0;
  const thickness = dimension.espessura || 3.0;

  const handleSelectDimension = (dimKey: string) => {
    setSelectedDim(dimKey);
    if (onDimensionClick) onDimensionClick(dimKey);
  };

  // Dimensional scale helpers for technical SVG canvas
  // Base SVG viewBox 1000 x 560
  const svgWidth = 1000;
  const svgHeight = 540;
  const originX = 280;
  const originY = 220;

  // Visual scaling factor so large and small bolts fit elegantly
  const maxExtent = Math.max(L + k + 40, s * 2, d2 * 1.5, 90);
  const scale = (340 / maxExtent) * zoomScale;

  const scaledL = L * scale;
  const scaledK = k * scale;
  const scaledD = d * scale;
  const scaledS = s * scale;
  const scaledDk = dk * scale;
  const scaledB = b * scale;
  const scaledD1 = d1 * scale;
  const scaledD2 = d2 * scale;
  const scaledThick = thickness * scale;

  // Selected tolerance detail lookup
  const toleranceData = dimension.tolerancias?.[selectedDim || ''] || {
    nominal: selectedDim === 'L' ? L : selectedDim === 'd' ? d : selectedDim === 'k' ? k : selectedDim === 's' ? s : b,
    min: undefined,
    max: undefined,
    instrumento: 'Paquímetro Universal Digital Mitutoyo 0.01mm',
    observacao: 'Conforme norma dimensional DIN / ISO correspondente'
  };

  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-cyan-950/20">
      {/* Top CAD Drafting Header */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
            Prancha Técnica Paramétrica 2D CAD
          </span>
          <span className="text-xs text-slate-400 border border-slate-700 rounded px-2 py-0.5 font-mono">
            {standardCode} • {bitola}
          </span>
        </div>

        {/* Dimension Quick Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleSelectDimension('d')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
              selectedDim === 'd' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            d: Ø{d}mm
          </button>
          {family === 'parafuso' && (
            <>
              <button
                type="button"
                onClick={() => handleSelectDimension('L')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  selectedDim === 'L' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                L: {L}mm
              </button>
              <button
                type="button"
                onClick={() => handleSelectDimension('k')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  selectedDim === 'k' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                k: {k}mm
              </button>
              {standardCode === 'DIN 931' && (
                <button
                  type="button"
                  onClick={() => handleSelectDimension('b')}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    selectedDim === 'b' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  b: {b}mm
                </button>
              )}
            </>
          )}
          {(family === 'parafuso' || family === 'porca') && (
            <button
              type="button"
              onClick={() => handleSelectDimension('s')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                selectedDim === 's' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              s: {s}mm
            </button>
          )}
          {family === 'arruela' && (
            <>
              <button
                type="button"
                onClick={() => handleSelectDimension('d1')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  selectedDim === 'd1' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                d₁: Ø{d1}mm
              </button>
              <button
                type="button"
                onClick={() => handleSelectDimension('d2')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  selectedDim === 'd2' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                d₂: Ø{d2}mm
              </button>
              <button
                type="button"
                onClick={() => handleSelectDimension('s')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  selectedDim === 's' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                s: {thickness}mm
              </button>
            </>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border-l border-slate-700 pl-2 ml-1">
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.15))}
              className="w-6 h-6 flex items-center justify-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
            >
              -
            </button>
            <span className="text-[10px] font-mono text-slate-400 w-8 text-center">{Math.round(zoomScale * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.min(1.8, z + 0.15))}
              className="w-6 h-6 flex items-center justify-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Main Drafting Canvas & Interactive Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
        {/* SVG CAD Drawing Area (8 Cols) */}
        <div id="cad-drawing-container" className="lg:col-span-8 bg-[#090d16] relative flex items-center justify-center min-h-[380px] p-2 overflow-hidden">
          {/* Blueprint Technical Grid Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />

          <svg
            id="deltafix-svg-cad"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full max-h-[460px] select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Technical Arrowhead Marker */}
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8" />
              </marker>
              <marker id="arrow-amber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#f59e0b" />
              </marker>

              {/* Thread Hatching Pattern (45 deg) */}
              <pattern id="threadHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#0284c7" strokeWidth="1.2" opacity="0.45" />
              </pattern>

              {/* Metal gradient */}
              <linearGradient id="steelShading" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="40%" stopColor="#334155" />
                <stop offset="70%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <linearGradient id="headShading" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>

            {/* Centerline (Linha de Centro - Traço e Ponto DIN 406) */}
            <line
              x1={originX - scaledK - 40}
              y1={originY}
              x2={originX + Math.max(scaledL, scaledThick, 60) + 60}
              y2={originY}
              stroke="#ef4444"
              strokeWidth="1.2"
              strokeDasharray="16,4,4,4"
              opacity="0.8"
            />
            {/* Front View Centerlines */}
            <line
              x1={840}
              y1={originY - Math.max(scaledS, scaledD2) / 2 - 30}
              x2={840}
              y2={originY + Math.max(scaledS, scaledD2) / 2 + 30}
              stroke="#ef4444"
              strokeWidth="1.2"
              strokeDasharray="16,4,4,4"
              opacity="0.8"
            />
            <line
              x1={840 - Math.max(scaledS, scaledD2) / 2 - 30}
              y1={originY}
              x2={840 + Math.max(scaledS, scaledD2) / 2 + 30}
              y2={originY}
              stroke="#ef4444"
              strokeWidth="1.2"
              strokeDasharray="16,4,4,4"
              opacity="0.8"
            />

            {/* ============================================================== */}
            {/* RENDER FOR SCREWS (DIN 933, DIN 931, DIN 912)                 */}
            {/* ============================================================== */}
            {family === 'parafuso' && (
              <g>
                {/* 1. Head Rendering */}
                {standardCode === 'DIN 912' ? (
                  // Cylindrical socket head
                  <g>
                    <rect
                      x={originX - scaledK}
                      y={originY - scaledDk / 2}
                      width={scaledK}
                      height={scaledDk}
                      fill="url(#steelShading)"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                      rx="1"
                    />
                    {/* Head knurling lines */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <line
                        key={i}
                        x1={originX - scaledK + 4 + i * ((scaledK - 8) / 5)}
                        y1={originY - scaledDk / 2 + 2}
                        x2={originX - scaledK + 4 + i * ((scaledK - 8) / 5)}
                        y2={originY + scaledDk / 2 - 2}
                        stroke="#0ea5e9"
                        strokeWidth="1"
                        opacity="0.5"
                      />
                    ))}
                  </g>
                ) : (
                  // Hexagonal head (DIN 933 / DIN 931)
                  <g>
                    {/* Main Hex head body */}
                    <rect
                      x={originX - scaledK}
                      y={originY - scaledS / 2}
                      width={scaledK}
                      height={scaledS}
                      fill="url(#steelShading)"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                    />
                    {/* Hex chamfer arcs representation */}
                    <line
                      x1={originX - scaledK}
                      y1={originY - scaledS / 4}
                      x2={originX}
                      y2={originY - scaledS / 4}
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      opacity="0.8"
                    />
                    <line
                      x1={originX - scaledK}
                      y1={originY + scaledS / 4}
                      x2={originX}
                      y2={originY + scaledS / 4}
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      opacity="0.8"
                    />
                  </g>
                )}

                {/* 2. Shank Rendering (Haste) */}
                {standardCode === 'DIN 931' ? (
                  // Partial thread: smooth portion + threaded portion
                  <g>
                    {/* Smooth body */}
                    {scaledL - scaledB > 0 && (
                      <rect
                        x={originX}
                        y={originY - scaledD / 2}
                        width={scaledL - scaledB}
                        height={scaledD}
                        fill="url(#steelShading)"
                        stroke="#38bdf8"
                        strokeWidth="2.2"
                      />
                    )}
                    {/* Threaded section */}
                    <rect
                      x={originX + (scaledL - scaledB)}
                      y={originY - scaledD / 2}
                      width={scaledB}
                      height={scaledD}
                      fill="url(#steelShading)"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                    />
                    {/* Thread Hatching fill */}
                    <rect
                      x={originX + (scaledL - scaledB)}
                      y={originY - scaledD / 2 + 2}
                      width={scaledB}
                      height={scaledD - 4}
                      fill="url(#threadHatch)"
                    />
                    {/* Thread inner root lines */}
                    <line
                      x1={originX + (scaledL - scaledB)}
                      y1={originY - (scaledD / 2) * 0.84}
                      x2={originX + scaledL}
                      y2={originY - (scaledD / 2) * 0.84}
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeDasharray="4,2"
                    />
                    <line
                      x1={originX + (scaledL - scaledB)}
                      y1={originY + (scaledD / 2) * 0.84}
                      x2={originX + scaledL}
                      y2={originY + (scaledD / 2) * 0.84}
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeDasharray="4,2"
                    />
                    {/* Thread runout transition mark */}
                    <line
                      x1={originX + (scaledL - scaledB)}
                      y1={originY - scaledD / 2}
                      x2={originX + (scaledL - scaledB)}
                      y2={originY + scaledD / 2}
                      stroke="#38bdf8"
                      strokeWidth="1.8"
                    />
                  </g>
                ) : (
                  // Full thread (DIN 933 or DIN 912 full)
                  <g>
                    <rect
                      x={originX}
                      y={originY - scaledD / 2}
                      width={scaledL}
                      height={scaledD}
                      fill="url(#steelShading)"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                    />
                    {/* Thread Hatching fill */}
                    <rect
                      x={originX}
                      y={originY - scaledD / 2 + 2}
                      width={scaledL}
                      height={scaledD - 4}
                      fill="url(#threadHatch)"
                    />
                    {/* Thread root lines */}
                    <line
                      x1={originX}
                      y1={originY - (scaledD / 2) * 0.84}
                      x2={originX + scaledL}
                      y2={originY - (scaledD / 2) * 0.84}
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeDasharray="4,2"
                    />
                    <line
                      x1={originX}
                      y1={originY + (scaledD / 2) * 0.84}
                      x2={originX + scaledL}
                      y2={originY + (scaledD / 2) * 0.84}
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeDasharray="4,2"
                    />
                  </g>
                )}

                {/* Tip Chamfer (Chanfro 45 graus) */}
                <polygon
                  points={`
                    ${originX + scaledL},${originY - scaledD / 2}
                    ${originX + scaledL + Math.min(scaledD * 0.12, 10)},${originY - scaledD * 0.38}
                    ${originX + scaledL + Math.min(scaledD * 0.12, 10)},${originY + scaledD * 0.38}
                    ${originX + scaledL},${originY + scaledD / 2}
                  `}
                  fill="#1e293b"
                  stroke="#38bdf8"
                  strokeWidth="2.2"
                />

                {/* 3. Axial Front View (Vista Axial / Cabeça) */}
                <g transform="translate(840, 220)">
                  {standardCode === 'DIN 912' ? (
                    // Socket head circle + hex socket
                    <g>
                      <circle cx="0" cy="0" r={scaledDk / 2} fill="#1e293b" stroke="#38bdf8" strokeWidth="2.2" />
                      {/* Hex socket recess */}
                      <polygon
                        points={Array.from({ length: 6 }).map((_, i) => {
                          const angle = (i * 60 * Math.PI) / 180;
                          const r = (scaledS / 2) * 1.1547;
                          return `${Math.cos(angle) * r},${Math.sin(angle) * r}`;
                        }).join(' ')}
                        fill="#090d16"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                    </g>
                  ) : (
                    // Hex head profile (regular hexagon across flats = s)
                    <g>
                      <polygon
                        points={Array.from({ length: 6 }).map((_, i) => {
                          const angle = (i * 60 * Math.PI) / 180;
                          const r = (scaledS / 2) * 1.1547;
                          return `${Math.cos(angle) * r},${Math.sin(angle) * r}`;
                        }).join(' ')}
                        fill="#1e293b"
                        stroke="#38bdf8"
                        strokeWidth="2.2"
                      />
                      {/* Inscribed circle representing thread crest */}
                      <circle cx="0" cy="0" r={scaledD / 2} fill="none" stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="3,3" />
                    </g>
                  )}
                </g>

                {/* 4. Interactive Dimension Lines */}
                {/* Dimension L (Total Length) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => handleSelectDimension('L')}
                >
                  <line
                    x1={originX}
                    y1={originY + Math.max(scaledS, scaledDk) / 2 + 25}
                    x2={originX + scaledL}
                    y2={originY + Math.max(scaledS, scaledDk) / 2 + 25}
                    stroke={selectedDim === 'L' ? '#f59e0b' : '#38bdf8'}
                    strokeWidth={selectedDim === 'L' ? '2.5' : '1.5'}
                    markerStart={selectedDim === 'L' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                    markerEnd={selectedDim === 'L' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                  />
                  {/* Extension lines */}
                  <line
                    x1={originX}
                    y1={originY + scaledD / 2}
                    x2={originX}
                    y2={originY + Math.max(scaledS, scaledDk) / 2 + 35}
                    stroke="#475569"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <line
                    x1={originX + scaledL}
                    y1={originY + scaledD / 2}
                    x2={originX + scaledL}
                    y2={originY + Math.max(scaledS, scaledDk) / 2 + 35}
                    stroke="#475569"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <rect
                    x={originX + scaledL / 2 - 32}
                    y={originY + Math.max(scaledS, scaledDk) / 2 + 15}
                    width="64"
                    height="20"
                    rx="4"
                    fill={selectedDim === 'L' ? '#78350f' : '#0f172a'}
                    stroke={selectedDim === 'L' ? '#f59e0b' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x={originX + scaledL / 2}
                    y={originY + Math.max(scaledS, scaledDk) / 2 + 29}
                    textAnchor="middle"
                    fill={selectedDim === 'L' ? '#fbbf24' : '#e2e8f0'}
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    L = {L}
                  </text>
                </g>

                {/* Dimension d (Nominal Diameter) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => handleSelectDimension('d')}
                >
                  <line
                    x1={originX + scaledL + 25}
                    y1={originY - scaledD / 2}
                    x2={originX + scaledL + 25}
                    y2={originY + scaledD / 2}
                    stroke={selectedDim === 'd' ? '#f59e0b' : '#38bdf8'}
                    strokeWidth={selectedDim === 'd' ? '2.5' : '1.5'}
                    markerStart={selectedDim === 'd' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                    markerEnd={selectedDim === 'd' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                  />
                  <line
                    x1={originX + scaledL}
                    y1={originY - scaledD / 2}
                    x2={originX + scaledL + 35}
                    y2={originY - scaledD / 2}
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <line
                    x1={originX + scaledL}
                    y1={originY + scaledD / 2}
                    x2={originX + scaledL + 35}
                    y2={originY + scaledD / 2}
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <rect
                    x={originX + scaledL + 32}
                    y={originY - 10}
                    width="60"
                    height="20"
                    rx="4"
                    fill={selectedDim === 'd' ? '#78350f' : '#0f172a'}
                    stroke={selectedDim === 'd' ? '#f59e0b' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x={originX + scaledL + 62}
                    y={originY + 4}
                    textAnchor="middle"
                    fill={selectedDim === 'd' ? '#fbbf24' : '#e2e8f0'}
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    Ø{d}
                  </text>
                </g>

                {/* Dimension k (Head Height) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => handleSelectDimension('k')}
                >
                  <line
                    x1={originX - scaledK}
                    y1={originY - Math.max(scaledS, scaledDk) / 2 - 20}
                    x2={originX}
                    y2={originY - Math.max(scaledS, scaledDk) / 2 - 20}
                    stroke={selectedDim === 'k' ? '#f59e0b' : '#38bdf8'}
                    strokeWidth={selectedDim === 'k' ? '2.5' : '1.5'}
                    markerStart={selectedDim === 'k' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                    markerEnd={selectedDim === 'k' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                  />
                  <line
                    x1={originX - scaledK}
                    y1={originY - Math.max(scaledS, scaledDk) / 2}
                    x2={originX - scaledK}
                    y2={originY - Math.max(scaledS, scaledDk) / 2 - 30}
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <line
                    x1={originX}
                    y1={originY - Math.max(scaledS, scaledDk) / 2}
                    x2={originX}
                    y2={originY - Math.max(scaledS, scaledDk) / 2 - 30}
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <rect
                    x={originX - scaledK / 2 - 26}
                    y={originY - Math.max(scaledS, scaledDk) / 2 - 32}
                    width="52"
                    height="18"
                    rx="4"
                    fill={selectedDim === 'k' ? '#78350f' : '#0f172a'}
                    stroke={selectedDim === 'k' ? '#f59e0b' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x={originX - scaledK / 2}
                    y={originY - Math.max(scaledS, scaledDk) / 2 - 19}
                    textAnchor="middle"
                    fill={selectedDim === 'k' ? '#fbbf24' : '#e2e8f0'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    k={k}
                  </text>
                </g>

                {/* Dimension b (Thread Length for DIN 931) */}
                {standardCode === 'DIN 931' && (
                  <g
                    className="cursor-pointer group"
                    onClick={() => handleSelectDimension('b')}
                  >
                    <line
                      x1={originX + (scaledL - scaledB)}
                      y1={originY - scaledD / 2 - 20}
                      x2={originX + scaledL}
                      y2={originY - scaledD / 2 - 20}
                      stroke={selectedDim === 'b' ? '#f59e0b' : '#38bdf8'}
                      strokeWidth={selectedDim === 'b' ? '2.5' : '1.5'}
                      markerStart={selectedDim === 'b' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                      markerEnd={selectedDim === 'b' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                    />
                    <line
                      x1={originX + (scaledL - scaledB)}
                      y1={originY - scaledD / 2}
                      x2={originX + (scaledL - scaledB)}
                      y2={originY - scaledD / 2 - 28}
                      stroke="#475569"
                      strokeWidth="1"
                    />
                    <rect
                      x={originX + scaledL - scaledB / 2 - 26}
                      y={originY - scaledD / 2 - 32}
                      width="52"
                      height="18"
                      rx="4"
                      fill={selectedDim === 'b' ? '#78350f' : '#0f172a'}
                      stroke={selectedDim === 'b' ? '#f59e0b' : '#334155'}
                      strokeWidth="1"
                    />
                    <text
                      x={originX + scaledL - scaledB / 2}
                      y={originY - scaledD / 2 - 19}
                      textAnchor="middle"
                      fill={selectedDim === 'b' ? '#fbbf24' : '#e2e8f0'}
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      b={b}
                    </text>
                  </g>
                )}

                {/* Dimension s (Wrench Size) on Front View */}
                <g
                  className="cursor-pointer group"
                  onClick={() => handleSelectDimension('s')}
                >
                  <line
                    x1={840 - scaledS / 2}
                    y1={originY + Math.max(scaledS, scaledDk) / 2 + 20}
                    x2={840 + scaledS / 2}
                    y2={originY + Math.max(scaledS, scaledDk) / 2 + 20}
                    stroke={selectedDim === 's' ? '#f59e0b' : '#38bdf8'}
                    strokeWidth={selectedDim === 's' ? '2.5' : '1.5'}
                    markerStart={selectedDim === 's' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                    markerEnd={selectedDim === 's' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                  />
                  <rect
                    x={840 - 24}
                    y={originY + Math.max(scaledS, scaledDk) / 2 + 10}
                    width="48"
                    height="18"
                    rx="4"
                    fill={selectedDim === 's' ? '#78350f' : '#0f172a'}
                    stroke={selectedDim === 's' ? '#f59e0b' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x={840}
                    y={originY + Math.max(scaledS, scaledDk) / 2 + 23}
                    textAnchor="middle"
                    fill={selectedDim === 's' ? '#fbbf24' : '#e2e8f0'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    s={s}
                  </text>
                </g>
              </g>
            )}

            {/* ============================================================== */}
            {/* RENDER FOR NUTS (DIN 934)                                      */}
            {/* ============================================================== */}
            {family === 'porca' && (
              <g>
                {/* Nut Side Profile */}
                <g>
                  <rect
                    x={originX}
                    y={originY - scaledS / 2}
                    width={scaledK}
                    height={scaledS}
                    fill="url(#steelShading)"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                  />
                  {/* Internal threaded bore dashed lines */}
                  <line
                    x1={originX}
                    y1={originY - scaledD / 2}
                    x2={originX + scaledK}
                    y2={originY - scaledD / 2}
                    stroke="#0ea5e9"
                    strokeWidth="1.8"
                    strokeDasharray="4,2"
                  />
                  <line
                    x1={originX}
                    y1={originY + scaledD / 2}
                    x2={originX + scaledK}
                    y2={originY + scaledD / 2}
                    stroke="#0ea5e9"
                    strokeWidth="1.8"
                    strokeDasharray="4,2"
                  />
                  {/* Double chamfer representation */}
                  <line x1={originX} y1={originY - scaledS / 4} x2={originX + scaledK} y2={originY - scaledS / 4} stroke="#38bdf8" strokeWidth="1" />
                  <line x1={originX} y1={originY + scaledS / 4} x2={originX + scaledK} y2={originY + scaledS / 4} stroke="#38bdf8" strokeWidth="1" />
                </g>

                {/* Nut Axial Front View */}
                <g transform="translate(840, 220)">
                  <polygon
                    points={Array.from({ length: 6 }).map((_, i) => {
                      const angle = (i * 60 * Math.PI) / 180;
                      const r = (scaledS / 2) * 1.1547;
                      return `${Math.cos(angle) * r},${Math.sin(angle) * r}`;
                    }).join(' ')}
                    fill="#1e293b"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                  />
                  <circle cx="0" cy="0" r={scaledD / 2} fill="#090d16" stroke="#f59e0b" strokeWidth="2" />
                  {/* Thread root 3/4 circle */}
                  <path
                    d={`M 0,${-scaledD * 0.58} A ${scaledD * 0.58} ${scaledD * 0.58} 0 1 1 ${-scaledD * 0.58},0`}
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="1.2"
                  />
                </g>

                {/* Nut Height m dimension */}
                <g className="cursor-pointer" onClick={() => handleSelectDimension('k')}>
                  <line
                    x1={originX}
                    y1={originY + scaledS / 2 + 25}
                    x2={originX + scaledK}
                    y2={originY + scaledS / 2 + 25}
                    stroke={selectedDim === 'k' ? '#f59e0b' : '#38bdf8'}
                    strokeWidth={selectedDim === 'k' ? '2.5' : '1.5'}
                    markerStart={selectedDim === 'k' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                    markerEnd={selectedDim === 'k' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                  />
                  <rect
                    x={originX + scaledK / 2 - 28}
                    y={originY + scaledS / 2 + 15}
                    width="56"
                    height="18"
                    rx="4"
                    fill={selectedDim === 'k' ? '#78350f' : '#0f172a'}
                    stroke={selectedDim === 'k' ? '#f59e0b' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x={originX + scaledK / 2}
                    y={originY + scaledS / 2 + 28}
                    textAnchor="middle"
                    fill={selectedDim === 'k' ? '#fbbf24' : '#e2e8f0'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    m={k}
                  </text>
                </g>

                {/* Nut Wrench s dimension */}
                <g className="cursor-pointer" onClick={() => handleSelectDimension('s')}>
                  <line
                    x1={840 - scaledS / 2}
                    y1={originY + scaledS / 2 + 25}
                    x2={840 + scaledS / 2}
                    y2={originY + scaledS / 2 + 25}
                    stroke={selectedDim === 's' ? '#f59e0b' : '#38bdf8'}
                    strokeWidth={selectedDim === 's' ? '2.5' : '1.5'}
                    markerStart={selectedDim === 's' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                    markerEnd={selectedDim === 's' ? 'url(#arrow-amber)' : 'url(#arrow)'}
                  />
                  <rect
                    x={840 - 24}
                    y={originY + scaledS / 2 + 15}
                    width="48"
                    height="18"
                    rx="4"
                    fill={selectedDim === 's' ? '#78350f' : '#0f172a'}
                    stroke={selectedDim === 's' ? '#f59e0b' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x={840}
                    y={originY + scaledS / 2 + 28}
                    textAnchor="middle"
                    fill={selectedDim === 's' ? '#fbbf24' : '#e2e8f0'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    s={s}
                  </text>
                </g>
              </g>
            )}

            {/* ============================================================== */}
            {/* RENDER FOR WASHERS (DIN 125A, DIN 127B)                        */}
            {/* ============================================================== */}
            {family === 'arruela' && (
              <g>
                {/* Washer Side Cut Profile */}
                <g>
                  {/* Top slice */}
                  <rect
                    x={originX}
                    y={originY - scaledD2 / 2}
                    width={scaledThick}
                    height={(scaledD2 - scaledD1) / 2}
                    fill="url(#steelShading)"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                  />
                  {/* Bottom slice */}
                  <rect
                    x={originX}
                    y={originY + scaledD1 / 2}
                    width={scaledThick}
                    height={(scaledD2 - scaledD1) / 2}
                    fill="url(#steelShading)"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                  />
                  {/* Stamping hatching */}
                  <rect
                    x={originX}
                    y={originY - scaledD2 / 2}
                    width={scaledThick}
                    height={(scaledD2 - scaledD1) / 2}
                    fill="url(#threadHatch)"
                  />
                  <rect
                    x={originX}
                    y={originY + scaledD1 / 2}
                    width={scaledThick}
                    height={(scaledD2 - scaledD1) / 2}
                    fill="url(#threadHatch)"
                  />
                </g>

                {/* Washer Front Concentric View */}
                <g transform="translate(840, 220)">
                  <circle cx="0" cy="0" r={scaledD2 / 2} fill="#1e293b" stroke="#38bdf8" strokeWidth="2.2" />
                  <circle cx="0" cy="0" r={scaledD1 / 2} fill="#090d16" stroke="#f59e0b" strokeWidth="2.2" />
                  {standardCode === 'DIN 127B' && (
                    // Helical slit cut representation
                    <line x1="0" y1="0" x2={scaledD2 / 2} y2="-5" stroke="#ef4444" strokeWidth="2.5" />
                  )}
                </g>

                {/* Washer Thickness Dimension */}
                <g className="cursor-pointer" onClick={() => handleSelectDimension('s')}>
                  <line
                    x1={originX}
                    y1={originY + scaledD2 / 2 + 25}
                    x2={originX + scaledThick}
                    y2={originY + scaledD2 / 2 + 25}
                    stroke={selectedDim === 's' ? '#f59e0b' : '#38bdf8'}
                    strokeWidth="2"
                    markerStart="url(#arrow)"
                    markerEnd="url(#arrow)"
                  />
                  <text
                    x={originX + scaledThick / 2}
                    y={originY + scaledD2 / 2 + 42}
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    s={thickness}
                  </text>
                </g>

                {/* External Diameter d2 Dimension */}
                <g className="cursor-pointer" onClick={() => handleSelectDimension('d2')}>
                  <line
                    x1={840 + scaledD2 / 2 + 20}
                    y1={originY - scaledD2 / 2}
                    x2={840 + scaledD2 / 2 + 20}
                    y2={originY + scaledD2 / 2}
                    stroke={selectedDim === 'd2' ? '#f59e0b' : '#38bdf8'}
                    strokeWidth="1.8"
                    markerStart="url(#arrow)"
                    markerEnd="url(#arrow)"
                  />
                  <text
                    x={840 + scaledD2 / 2 + 35}
                    y={originY + 4}
                    fill="#38bdf8"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    d₂=Ø{d2}
                  </text>
                </g>
              </g>
            )}

            {/* Scale Bar Indicator in lower left */}
            <g transform="translate(40, 500)">
              <line x1="0" y1="0" x2="60" y2="0" stroke="#64748b" strokeWidth="2" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#64748b" strokeWidth="2" />
              <line x1="60" y1="-5" x2="60" y2="5" stroke="#64748b" strokeWidth="2" />
              <text x="30" y="-8" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                Escala Técnica 1:1
              </text>
            </g>
          </svg>
        </div>

        {/* Metrology & QC Side Card (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <Ruler className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                Controle Dimensional & CQ
              </h3>
            </div>

            {/* Selected Dimension Detail Card */}
            <div className="bg-slate-950/80 border border-amber-500/30 rounded-lg p-3.5 mb-4 shadow-inner">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-amber-400 font-bold uppercase">
                  Cota Ativa Selecionada
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {selectedDim?.toUpperCase()}
                </span>
              </div>

              <div className="text-2xl font-mono font-extrabold text-white my-1">
                {selectedDim === 'd'
                  ? `Ø ${d} mm`
                  : selectedDim === 'L'
                  ? `${L} mm`
                  : selectedDim === 'k'
                  ? `${k} mm`
                  : selectedDim === 's'
                  ? `${s} mm`
                  : selectedDim === 'b'
                  ? `${b} mm`
                  : selectedDim === 'd1'
                  ? `Ø ${d1} mm`
                  : selectedDim === 'd2'
                  ? `Ø ${d2} mm`
                  : `${toleranceData.nominal} mm`}
              </div>

              <div className="text-xs text-slate-400 mt-2 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Afastamento Mínimo:</span>
                  <span className="text-slate-200">
                    {toleranceData.min !== undefined ? `${toleranceData.min} mm` : 'Normativo base'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Afastamento Máximo:</span>
                  <span className="text-slate-200">
                    {toleranceData.max !== undefined ? `${toleranceData.max} mm` : 'Normativo base'}
                  </span>
                </div>
                {toleranceData.classe && (
                  <div className="flex justify-between">
                    <span>Campo de Tolerância:</span>
                    <span className="text-cyan-400 font-bold">{toleranceData.classe}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Metrology QC Instrument */}
            <div className="space-y-3">
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Instrumento de Medição Recomendado:
                </div>
                <p className="text-xs text-slate-200 font-mono font-medium">
                  {toleranceData.instrumento}
                </p>
                {toleranceData.observacao && (
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    {toleranceData.observacao}
                  </p>
                )}
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Plano de Amostragem & Critério CQ:
                </div>
                <p className="text-[11px] text-slate-400">
                  Inspeção Normal Geral Nível II conforme <strong>NBR 5426 / ISO 2859</strong>.
                  AQL 0.65 para cotas críticas ({selectedDim}) e 1.50 para secundárias.
                </p>
              </div>
            </div>
          </div>

          {/* Prompt to click other dimension lines */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Clique nas cotas no desenho para inspecionar
            </span>
          </div>
        </div>
      </div>

      {/* Industrial Carimbo Técnico Delta (Title Block) */}
      <div className="bg-slate-900 border-t border-slate-800 p-4">
        <div className="border-2 border-slate-700 rounded bg-slate-950 p-3 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs font-mono">
          {/* Logo & Company Title (3 Cols) */}
          <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-slate-800 pr-3 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm tracking-wider">
              <Cpu className="w-4 h-4" />
              DELTA FIX
            </div>
            <div className="text-[10px] text-slate-400 tracking-tight font-semibold">
              PARAFUSOS ESPECIAIS LTDA.
            </div>
            <div className="text-[9px] text-cyan-500 mt-1">
              Divisão de Engenharia de Produto
            </div>
          </div>

          {/* Part Name & Code (5 Cols) */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-800 pr-3 flex flex-col justify-center space-y-1">
            <div className="text-slate-400 text-[10px] uppercase">Denominação & Código Inteligente:</div>
            <div className="text-cyan-300 font-bold text-xs truncate" title={skuGerado}>
              {skuGerado}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-2">
              <span>Cód. Interno Delta:</span>
              <span className="text-amber-300 font-bold">{codigoInternoDelta || 'EM-CONFIGURAÇÃO'}</span>
            </div>
          </div>

          {/* Technical Specs & Approval (4 Cols) */}
          <div className="md:col-span-4 flex flex-col justify-center space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Norma: <strong className="text-slate-200">{standardCode}</strong></span>
              <span className="text-slate-400">Classe: <strong className="text-amber-400">{classeResistencia}</strong></span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Material: <strong className="text-slate-200">{materialBase.split(' ')[0]}</strong></span>
              <span className="text-slate-400">Acab: <strong className="text-slate-200">{tratamentoSuperficial.split(' ')[0]}</strong></span>
            </div>
            <div className="flex justify-between text-[10px] pt-1 border-t border-slate-800 text-slate-400">
              <span>Peso Unit: <strong className="text-emerald-400">{(pesoLiquidoKg * 1000).toFixed(1)}g</strong></span>
              <span>Perda: <strong className="text-rose-400">{fatorPerdaPercentual}%</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
