// src/components/ui/SteelColorBadge.tsx - Componente Visual de Codificação de Cores do Aço (Pontas Pintadas)
import React from 'react';

interface SteelColorBadgeProps {
  corPrimariaHex: string;
  isBicolor?: boolean;
  corSecundariaHex?: string;
  size?: number; // diâmetro em pixels (padrão 24)
  className?: string;
  title?: string;
}

export function SteelColorBadge({
  corPrimariaHex,
  isBicolor = false,
  corSecundariaHex,
  size = 24,
  className = '',
  title
}: SteelColorBadgeProps) {
  const borderStyle =
    corPrimariaHex.toLowerCase() === '#ffffff' || corSecundariaHex?.toLowerCase() === '#ffffff'
      ? 'border border-slate-600'
      : 'border border-slate-800/80';

  if (!isBicolor || !corSecundariaHex) {
    return (
      <span
        title={title}
        className={`inline-block rounded-full shadow-sm shrink-0 ${borderStyle} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: corPrimariaHex
        }}
      />
    );
  }

  // Bicolor (duas cores meia-a-meia, como na placa da foto: 50% Cor 1 / 50% Cor 2)
  return (
    <span
      title={title}
      className={`inline-block rounded-full shadow-sm shrink-0 overflow-hidden ${borderStyle} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `linear-gradient(135deg, ${corPrimariaHex} 0%, ${corPrimariaHex} 50%, ${corSecundariaHex} 50%, ${corSecundariaHex} 100%)`
      }}
    />
  );
}

export interface SteelColorConfig {
  spec: string;
  corPrimariaHex: string;
  isBicolor: boolean;
  corSecundariaHex?: string;
  label: string;
}

export const STEEL_COLOR_MAP: Record<string, SteelColorConfig> = {
  'SAE 1020': {
    spec: 'SAE 1020',
    corPrimariaHex: '#ffffff',
    isBicolor: false,
    label: 'Branco'
  },
  'SAE 1045': {
    spec: 'SAE 1045',
    corPrimariaHex: '#dc2626',
    isBicolor: false,
    label: 'Vermelho'
  },
  'SAE 4340': {
    spec: 'SAE 4340',
    corPrimariaHex: '#16a34a',
    isBicolor: true,
    corSecundariaHex: '#dc2626',
    label: 'Verde / Vermelho'
  },
  'SAE 8640': {
    spec: 'SAE 8640',
    corPrimariaHex: '#ea580c',
    isBicolor: true,
    corSecundariaHex: '#dc2626',
    label: 'Laranja / Vermelho'
  },
  'SAE 8220': {
    spec: 'SAE 8220',
    corPrimariaHex: '#2563eb',
    isBicolor: true,
    corSecundariaHex: '#eab308',
    label: 'Azul / Amarelo'
  },
  'SAE 4140': {
    spec: 'SAE 4140',
    corPrimariaHex: '#064e3b',
    isBicolor: false,
    label: 'Verde Escuro'
  },
  'AISI 304': {
    spec: 'AISI 304',
    corPrimariaHex: '#eab308',
    isBicolor: false,
    label: 'Amarelo'
  },
  'AISI 310': {
    spec: 'AISI 310',
    corPrimariaHex: '#0f172a',
    isBicolor: false,
    label: 'Azul Escuro / Grafite'
  },
  'AISI 320': {
    spec: 'AISI 320',
    corPrimariaHex: '#f8fafc',
    isBicolor: false,
    label: 'Branco Neve'
  },
  'AISI 316': {
    spec: 'AISI 316',
    corPrimariaHex: '#b91c1c',
    isBicolor: false,
    label: 'Vermelho Carmesim'
  },
  'AISI 420': {
    spec: 'AISI 420',
    corPrimariaHex: '#15803d',
    isBicolor: false,
    label: 'Verde Médio'
  },
  'AISI 321': {
    spec: 'AISI 321',
    corPrimariaHex: '#06b6d4',
    isBicolor: false,
    label: 'Ciano / Azul Claro'
  }
};

export function getSteelColorBySpec(text: string): SteelColorConfig | null {
  if (!text) return null;
  const upper = text.toUpperCase();
  for (const [key, val] of Object.entries(STEEL_COLOR_MAP)) {
    if (upper.includes(key.toUpperCase())) {
      return val;
    }
  }
  return null;
}
