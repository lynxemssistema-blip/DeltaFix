// src/app/layout.tsx - DeltaFix Core Engine Layout
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DeltaFix | Engenharia de Fixadores & Configurador Paramétrico',
  description:
    'Sistema especialista de Engenharia de Produto, Matrizes Dimensionais DIN/ISO, Renderizador CAD 2D Paramétrico, Roteamento MES e Inteligência Artificial Lynx VPS para a Delta Parafusos Especiais.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-slate-950"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
