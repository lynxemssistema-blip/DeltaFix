// src/components/engineering/ProductCatalogManagement.tsx - Catálogo de Produtos e Cadastro Livre Sem Norma
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ProductItem } from '@/lib/standards/types';
import {
  getSavedCatalogProducts,
  saveCatalogProduct,
  deleteCatalogProduct
} from '@/lib/services/productCatalogService';
import {
  getFastenerFamilies,
  saveFastenerFamily,
  deleteFastenerFamily,
  resetFastenerFamilies,
  FastenerFamilyItem
} from '@/lib/services/fastenerFamilyService';
import { SteelColorBadge, getSteelColorBySpec } from '@/components/ui/SteelColorBadge';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Layers,
  FileCode2,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  X,
  Compass,
  FileText,
  Weight,
  Scissors,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Info,
  Image as ImageIcon,
  Paperclip,
  Download,
  Eye,
  Settings,
  Settings2,
  RotateCcw
} from 'lucide-react';

interface ProductCatalogManagementProps {
  onSelectProductForCAD?: (product: ProductItem) => void;
  onNavigateToConfigurator?: () => void;
}

export function ProductCatalogManagement({
  onSelectProductForCAD,
  onNavigateToConfigurator
}: ProductCatalogManagementProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [familyFilter, setFamilyFilter] = useState<string>('todos');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'especial_livre' | 'normatizado'>('todos');
  const [viewMode, setViewMode] = useState<'cards' | 'tabela'>('cards');

  // Modal de Cadastro e Edição Livre de Peça Especial
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [modalSuccessMsg, setModalSuccessMsg] = useState<string | null>(null);

  // Gestão Dinâmica de Famílias de Fixadores (Criar, Editar, Deletar)
  const [fastenerFamilies, setFastenerFamilies] = useState<FastenerFamilyItem[]>([]);
  const [isFamilyManagerOpen, setIsFamilyManagerOpen] = useState(false);
  const [familyFormName, setFamilyFormName] = useState('');
  const [familyFormDesc, setFamilyFormDesc] = useState('');
  const [editingFamilyItem, setEditingFamilyItem] = useState<FastenerFamilyItem | null>(null);
  const [familyManagerMsg, setFamilyManagerMsg] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // Estados do formulário livre
  const [formCodigoDelta, setFormCodigoDelta] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formFamily, setFormFamily] = useState<string>('parafuso');
  const [formBitola, setFormBitola] = useState('M24-ESP');
  const [formPasso, setFormPasso] = useState<number>(3.0);
  const [formComprimento, setFormComprimento] = useState<number>(150);
  const [formComprimentoRosca, setFormComprimentoRosca] = useState<number>(60);
  const [formSobremetalCorte, setFormSobremetalCorte] = useState<number>(5.0);
  const [formChave, setFormChave] = useState<number>(36);
  const [formAlturaCabeca, setFormAlturaCabeca] = useState<number>(15);
  const [formDiametroCabeca, setFormDiametroCabeca] = useState<number>(40);
  const [formMaterialBase, setFormMaterialBase] = useState('Aço Liga SAE 4140');
  const [formClasseResistencia, setFormClasseResistencia] = useState('10.9');
  const [formTratamento, setFormTratamento] = useState('Polido / Oleado');
  const [formDesenhoClienteRef, setFormDesenhoClienteRef] = useState('');
  const [formObservacoes, setFormObservacoes] = useState('');
  const [formPesoManual, setFormPesoManual] = useState<string>('');

  // Anexos de Arquivo (PDF e Fotos)
  const [formPdfName, setFormPdfName] = useState<string>('');
  const [formPdfData, setFormPdfData] = useState<string>('');
  const [formPdfSize, setFormPdfSize] = useState<string>('');

  const [formPhotoName, setFormPhotoName] = useState<string>('');
  const [formPhotoData, setFormPhotoData] = useState<string>('');

  // Modal de Visualização Ampliada (Foto / PDF)
  const [previewMedia, setPreviewMedia] = useState<{ type: 'photo' | 'pdf'; url: string; title: string } | null>(null);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormPdfName(file.name);
    setFormPdfSize((file.size / 1024).toFixed(1) + ' KB');
    const reader = new FileReader();
    reader.onload = () => {
      setFormPdfData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFormPhotoData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearAttachments = () => {
    setFormPdfName('');
    setFormPdfData('');
    setFormPdfSize('');
    setFormPhotoName('');
    setFormPhotoData('');
  };

  // Abrir Modal para Criação de Novo Produto Livre
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormCodigoDelta('');
    setFormDescricao('');
    setFormFamily('parafuso');
    setFormBitola('M24-ESP');
    setFormPasso(3.0);
    setFormComprimento(150);
    setFormComprimentoRosca(60);
    setFormSobremetalCorte(5.0);
    setFormChave(36);
    setFormAlturaCabeca(15);
    setFormDiametroCabeca(40);
    setFormMaterialBase('Aço Liga SAE 4140');
    setFormClasseResistencia('10.9');
    setFormTratamento('Polido / Oleado');
    setFormDesenhoClienteRef('');
    setFormObservacoes('');
    setFormPesoManual('');
    handleClearAttachments();
    setIsModalOpen(true);
  };

  // Abrir Modal para Edição de Produto Livre Existente
  const handleOpenEditModal = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormCodigoDelta(prod.codigo_interno_delta || '');
    setFormDescricao(prod.observacoes_especiais || prod.sku_gerado);
    setFormFamily(prod.family || 'parafuso');
    setFormBitola(prod.bitola || 'M24-ESP');
    setFormPasso(prod.passo || 3.0);
    setFormComprimento(prod.comprimento || 150);
    setFormComprimentoRosca(prod.comprimento_rosca_b || 60);
    setFormSobremetalCorte(prod.sobremetal_corte !== undefined ? prod.sobremetal_corte : 5.0);
    setFormMaterialBase(prod.material_base || 'Aço Liga SAE 4140');
    setFormClasseResistencia(prod.classe_resistencia || '10.9');
    setFormTratamento(prod.tratamento_superficial || 'Polido / Oleado');
    setFormDesenhoClienteRef(prod.desenho_cliente_ref || '');
    setFormObservacoes(prod.observacoes_especiais || '');
    setFormPesoManual(prod.peso_liquido_kg ? String(prod.peso_liquido_kg) : '');
    setFormPdfData(prod.anexo_pdf_url || '');
    setFormPdfName(prod.anexo_pdf_nome || '');
    setFormPdfSize(prod.anexo_pdf_url ? 'Arquivo Anexado' : '');
    setFormPhotoData(prod.foto_produto_url || '');
    setFormPhotoName(prod.foto_produto_nome || '');
    setIsModalOpen(true);
  };

  // Carregar produtos e famílias dinâmicas
  useEffect(() => {
    setProducts(getSavedCatalogProducts());
    setFastenerFamilies(getFastenerFamilies());
  }, []);

  // Manipulação de Famílias de Fixadores (Criar, Editar, Deletar, Resetar)
  const handleSaveFamily = (e: React.FormEvent) => {
    e.preventDefault();
    const name = familyFormName.trim();
    if (!name) return;

    const updated = saveFastenerFamily({
      id: editingFamilyItem ? editingFamilyItem.id : undefined,
      name,
      description: familyFormDesc.trim() || undefined
    });

    setFastenerFamilies(updated);

    // Se estava criando uma nova família, seleciona-a automaticamente no formulário da peça
    if (!editingFamilyItem) {
      const created = updated.find((f) => f.name.toLowerCase() === name.toLowerCase());
      if (created) {
        setFormFamily(created.id);
      }
    }

    setFamilyManagerMsg({
      text: editingFamilyItem
        ? `Família "${name}" atualizada com sucesso!`
        : `Nova família "${name}" criada com sucesso!`,
      type: 'success'
    });

    setFamilyFormName('');
    setFamilyFormDesc('');
    setEditingFamilyItem(null);

    setTimeout(() => setFamilyManagerMsg(null), 3000);
  };

  const handleStartEditFamily = (fam: FastenerFamilyItem) => {
    setEditingFamilyItem(fam);
    setFamilyFormName(fam.name);
    setFamilyFormDesc(fam.description || '');
  };

  const handleCancelEditFamily = () => {
    setEditingFamilyItem(null);
    setFamilyFormName('');
    setFamilyFormDesc('');
  };

  const handleDeleteFamily = (fam: FastenerFamilyItem) => {
    const countUsage = products.filter(
      (p) =>
        p.family?.toLowerCase() === fam.id.toLowerCase() ||
        p.family?.toLowerCase() === fam.name.toLowerCase()
    ).length;

    const confirmMsg =
      countUsage > 0
        ? `Atenção: A família "${fam.name}" está associada a ${countUsage} produto(s) no catálogo. Deseja realmente excluí-la?`
        : `Deseja realmente excluir a família de fixadores "${fam.name}"?`;

    if (window.confirm(confirmMsg)) {
      const updated = deleteFastenerFamily(fam.id);
      setFastenerFamilies(updated);

      if (formFamily === fam.id) {
        setFormFamily(updated[0]?.id || 'parafuso');
      }
      if (editingFamilyItem?.id === fam.id) {
        handleCancelEditFamily();
      }

      setFamilyManagerMsg({
        text: `Família "${fam.name}" excluída com sucesso.`,
        type: 'danger'
      });
      setTimeout(() => setFamilyManagerMsg(null), 3000);
    }
  };

  const handleResetFamiliesToDefault = () => {
    if (
      window.confirm(
        'Deseja restaurar as famílias padrão do sistema (Parafusos, Porcas, Arruelas, Prisioneiros, Barras, Chumbadores e Peças Usinadas)?'
      )
    ) {
      const defaults = resetFastenerFamilies();
      setFastenerFamilies(defaults);
      setFamilyManagerMsg({
        text: 'Famílias restauradas para os padrões originais com sucesso!',
        type: 'success'
      });
      setTimeout(() => setFamilyManagerMsg(null), 3000);
    }
  };

  // Cálculo de peso teórico automático estimado para peça sob medida
  const pesoTeoricoCalculado = useMemo(() => {
    if (formPesoManual && !isNaN(parseFloat(formPesoManual))) {
      return parseFloat(formPesoManual);
    }
    // Estimativa por cilindro de aço: diâmetro nominal mm, comprimento L mm, densidade 7.85e-6 kg/mm³
    const numD = parseFloat(formBitola.replace(/\D/g, '')) || 20;
    const raio = numD / 2;
    const volCorpo = Math.PI * Math.pow(raio, 2) * formComprimento;
    const volCabeca = Math.PI * Math.pow(formDiametroCabeca / 2 || raio * 1.5, 2) * formAlturaCabeca;
    const volTotalMm3 = volCorpo + volCabeca;
    const pesoKg = volTotalMm3 * 7.85e-6;
    return parseFloat(pesoKg.toFixed(3));
  }, [formBitola, formComprimento, formDiametroCabeca, formAlturaCabeca, formPesoManual]);

  // Filtragem dos produtos
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Busca textual
      const matchesSearch =
        p.sku_gerado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo_interno_delta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.standard_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bitola?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.material_base?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.desenho_cliente_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.observacoes_especiais?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de família
      const matchesFamily =
        familyFilter === 'todos' || p.family?.toLowerCase() === familyFilter.toLowerCase();

      // Filtro de tipo (livre sem norma vs padronizado DIN/ISO)
      const matchesType =
        typeFilter === 'todos' ||
        (typeFilter === 'especial_livre' && (p.is_custom_special || p.standard_code === 'ESPECIAL LIVRE')) ||
        (typeFilter === 'normatizado' && !p.is_custom_special && p.standard_code !== 'ESPECIAL LIVRE');

      return matchesSearch && matchesFamily && matchesType;
    });
  }, [products, searchTerm, familyFilter, typeFilter]);

  // Contadores de KPIs
  const totalItens = products.length;
  const totalLivres = products.filter((p) => p.is_custom_special || p.standard_code === 'ESPECIAL LIVRE').length;
  const totalNormatizados = totalItens - totalLivres;

  // Submeter cadastro livre
  const handleSaveFreeProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const pesoLiquido = pesoTeoricoCalculado;
    const pesoBruto = parseFloat((pesoLiquido * 1.1).toFixed(3)); // 10% perda corte/cavaco

    const novoSKU = editingProduct
      ? editingProduct.sku_gerado
      : `ESP-${formFamily.toUpperCase().slice(0, 3)}-${formBitola.toUpperCase()}-${formComprimento}MM-${formClasseResistencia.replace('.', '')}`;

    const newProduct: ProductItem = {
      id: editingProduct ? editingProduct.id : `prod-esp-${Date.now()}`,
      sku_gerado: novoSKU,
      codigo_interno_delta: formCodigoDelta || (editingProduct ? editingProduct.codigo_interno_delta : `DELTA-ESP-${Math.floor(1000 + Math.random() * 9000)}`),
      standard_code: editingProduct ? editingProduct.standard_code : 'ESPECIAL LIVRE',
      family: formFamily as any,
      bitola: formBitola,
      passo: formPasso,
      comprimento: formComprimento,
      comprimento_rosca_b: formComprimentoRosca,
      sobremetal_corte: formSobremetalCorte,
      classe_resistencia: formClasseResistencia,
      material_base: formMaterialBase,
      tratamento_superficial: formTratamento,
      peso_liquido_kg: pesoLiquido,
      peso_bruto_kg: pesoBruto,
      fator_perda_percentual: 10.0,
      is_custom_special: true,
      desenho_cliente_ref: formDesenhoClienteRef || undefined,
      anexo_pdf_url: formPdfData || undefined,
      anexo_pdf_nome: formPdfName || undefined,
      foto_produto_url: formPhotoData || undefined,
      foto_produto_nome: formPhotoName || undefined,
      observacoes_especiais: formObservacoes || 'Peça cadastrada livremente no sistema sem norma restritiva.',
      created_at: editingProduct?.created_at || new Date().toISOString()
    };

    const updatedList = saveCatalogProduct(newProduct);
    setProducts(updatedList);
    handleClearAttachments();
    setModalSuccessMsg(
      editingProduct
        ? `Produto Especial [${newProduct.sku_gerado}] atualizado com sucesso!`
        : `Produto Especial [${newProduct.sku_gerado}] cadastrado com sucesso!`
    );
    setTimeout(() => {
      setModalSuccessMsg(null);
      setIsModalOpen(false);
      setEditingProduct(null);
    }, 1200);
  };

  // Excluir produto
  const handleDelete = (sku: string) => {
    if (window.confirm(`Deseja remover o produto ${sku} do catálogo?`)) {
      const updated = deleteCatalogProduct(sku);
      setProducts(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. CABEÇALHO DO CATÁLOGO GERAL
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-cyan-400" />
              Gestão de Engenharia de Produto
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Total de {totalItens} produtos registrados</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            CATÁLOGO DE PRODUTOS & PEÇAS ESPECIAIS
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
            Consulte todos os fixadores cadastrados no app. Você pode utilizar normas técnicas consolidadas (DIN/ISO/ASTM)
            ou cadastrar peças especiais sob desenho <strong className="text-cyan-300">com total liberdade dimensional</strong>.
          </p>
        </div>

        {/* Botões de Ação do Topo */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToConfigurator && (
            <button
              type="button"
              onClick={onNavigateToConfigurator}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              title="Abrir o configurador paramétrico de normas"
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Configurador de Normas</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFamilyManagerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            title="Criar, editar ou excluir famílias de fixadores"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>Famílias do Fixador</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/80 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>+ Cadastrar Livremente (Sem Norma)</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. CARDS DE KPI & RESUMO
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Total no Catálogo</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{totalItens}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Itens ativos no sistema</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-emerald-400 uppercase font-bold">Peças Especiais Livres</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{totalLivres}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Cadastradas sem norma DIN/ISO</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-amber-400 uppercase font-bold">Normatizados DIN/ISO</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{totalNormatizados}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Seguindo tabelas padronizadas</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. BARRA DE BUSCA E FILTROS RÁPIDOS
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por SKU, Código Delta, Bitola, Norma, Material ou Ref de Desenho..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Filtro por Família */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
          >
            <option value="todos">Todas as Famílias ({fastenerFamilies.length})</option>
            {fastenerFamilies.map((fam) => (
              <option key={fam.id} value={fam.id}>
                {fam.name}
              </option>
            ))}
          </select>

          {/* Filtro por Tipo */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTypeFilter('todos')}
              className={`px-2.5 py-1 rounded transition-all font-semibold ${
                typeFilter === 'todos' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400'
              }`}
            >
              Todos ({totalItens})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('especial_livre')}
              className={`px-2.5 py-1 rounded transition-all font-semibold ${
                typeFilter === 'especial_livre'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'text-slate-400'
              }`}
            >
              Especiais Livres ({totalLivres})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('normatizado')}
              className={`px-2.5 py-1 rounded transition-all font-semibold ${
                typeFilter === 'normatizado'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'text-slate-400'
              }`}
            >
              Normas ({totalNormatizados})
            </button>
          </div>

          {/* Alternador de Visualização: Cards vs Tabela */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded transition-all font-semibold ${
                viewMode === 'cards' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'
              }`}
            >
              🗂️ Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tabela')}
              className={`px-2.5 py-1 rounded transition-all font-semibold ${
                viewMode === 'tabela' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'
              }`}
            >
              📊 Tabela
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. LISTAGEM DE PRODUTOS (CARDS OU TABELA)
          ========================================================================= */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <Boxes className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-300">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Não encontramos fixadores com os filtros selecionados. Tente limpar os filtros ou cadastre um novo produto livremente.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Produto Livremente
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* VISUALIZAÇÃO EM CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const steelColor = getSteelColorBySpec(p.material_base || '');
            const isSpecial = p.is_custom_special || p.standard_code === 'ESPECIAL LIVRE';

            return (
              <div
                key={p.sku_gerado}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition-all group relative overflow-hidden"
              >
                {/* Faixa indicadora de tipo */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isSpecial
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500'
                      : 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500'
                  }`}
                />

                <div>
                  {/* Topo do card: Badges e Norma */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isSpecial
                          ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                          : 'bg-sky-950/80 border border-sky-800 text-sky-300'
                      }`}
                    >
                      {isSpecial ? '✨ Especial Sob Desenho' : `📐 ${p.standard_code}`}
                    </span>

                    {p.codigo_interno_delta && (
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                        {p.codigo_interno_delta}
                      </span>
                    )}
                  </div>

                  {/* SKU e Descrição */}
                  <h3 className="font-mono font-bold text-sm text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    {p.sku_gerado}
                  </h3>

                  {/* Foto Real do Produto (se anexada) */}
                  {p.foto_produto_url && (
                    <div className="mt-2.5 relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 max-h-36 flex items-center justify-center group/img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.foto_produto_url}
                        alt={p.sku_gerado}
                        className="w-full h-28 object-cover transition-transform group-hover/img:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewMedia({
                            type: 'photo',
                            url: p.foto_produto_url!,
                            title: p.foto_produto_nome || p.sku_gerado
                          })
                        }
                        className="absolute bottom-1.5 right-1.5 px-2 py-1 rounded bg-slate-950/85 hover:bg-slate-900 border border-slate-700 text-white text-[10px] font-mono flex items-center gap-1 shadow backdrop-blur-sm"
                        title="Ver foto em tela cheia"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span>Ver Foto</span>
                      </button>
                    </div>
                  )}

                  {/* Tag de Referência de Desenho do Cliente */}
                  {p.desenho_cliente_ref && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-amber-400">
                      <Tag className="w-3 h-3" />
                      <span>Desenho: {p.desenho_cliente_ref}</span>
                    </div>
                  )}

                  {/* Tag e Ação de PDF Anexado */}
                  {p.anexo_pdf_url && (
                    <div className="mt-1.5 flex items-center justify-between p-1.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <FileText className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="text-[10px] font-mono text-red-200 truncate">
                          {p.anexo_pdf_nome || 'Desenho_Tecnico.pdf'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewMedia({
                            type: 'pdf',
                            url: p.anexo_pdf_url!,
                            title: p.anexo_pdf_nome || p.sku_gerado
                          })
                        }
                        className="px-2 py-0.5 rounded bg-red-900/80 hover:bg-red-800 text-red-100 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 ml-1"
                        title="Visualizar prancha PDF anexada"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver PDF</span>
                      </button>
                    </div>
                  )}

                  {/* Grid de Especificações Técnicas */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Bitola / Rosca:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {p.bitola} {p.passo ? `x ${p.passo}mm` : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Comprimento:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {p.comprimento ? `${p.comprimento} mm` : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Rosca (b):</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {p.comprimento_rosca_b ? `${p.comprimento_rosca_b} mm` : 'Total'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Corte / Sobremetal:</span>
                      <span className="font-mono font-semibold text-amber-400 flex items-center gap-1">
                        <Scissors className="w-3 h-3" />
                        {p.sobremetal_corte ? `+${p.sobremetal_corte} mm` : '0 mm'}
                      </span>
                    </div>
                  </div>

                  {/* Material Base com Placa de Cor do Rack de Almoxarifado */}
                  <div className="mt-3 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {steelColor ? (
                        <SteelColorBadge
                          corPrimariaHex={steelColor.corPrimariaHex}
                          isBicolor={steelColor.isBicolor}
                          corSecundariaHex={steelColor.corSecundariaHex}
                          size={18}
                          title={`Cor da Ponta no Rack: ${steelColor.label}`}
                        />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-700 inline-block" />
                      )}
                      <div>
                        <span className="font-medium text-slate-300 block leading-none">{p.material_base}</span>
                        <span className="text-[10px] text-slate-500 font-mono leading-none mt-0.5">
                          {p.classe_resistencia || 'Std'} • {p.tratamento_superficial || 'Bruto'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block leading-none">Peso:</span>
                      <span className="font-mono font-bold text-cyan-300 text-xs">
                        {p.peso_liquido_kg ? `${p.peso_liquido_kg.toFixed(3)} kg` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Observações especiais */}
                  {p.observacoes_especiais && (
                    <p className="mt-2 text-[11px] text-slate-400 line-clamp-2 italic bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/50">
                      &quot;{p.observacoes_especiais}&quot;
                    </p>
                  )}
                </div>

                {/* Ações do Card */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {!isSpecial ? (
                    <button
                      type="button"
                      onClick={() => onSelectProductForCAD && onSelectProductForCAD(p)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="Visualizar prancha técnica CAD 2D deste produto normatizado"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Prancha CAD 2D</span>
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center gap-1.5">
                      {p.anexo_pdf_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewMedia({
                              type: 'pdf',
                              url: p.anexo_pdf_url!,
                              title: p.anexo_pdf_nome || p.sku_gerado
                            })
                          }
                          className="py-1.5 px-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                          title="Visualizar desenho técnico PDF anexado"
                        >
                          <FileText className="w-3.5 h-3.5 text-red-400" />
                          <span>PDF</span>
                        </button>
                      )}
                      {p.foto_produto_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewMedia({
                              type: 'photo',
                              url: p.foto_produto_url!,
                              title: p.foto_produto_nome || p.sku_gerado
                            })
                          }
                          className="py-1.5 px-2 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-200 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                          title="Visualizar foto da peça especial"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>Foto</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(p)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-cyan-950 to-slate-900 hover:from-cyan-900 hover:to-slate-800 border border-cyan-700/80 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-cyan-500"
                        title="Editar medidas, referências, foto e PDF deste cadastro livre"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Editar Peça</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(p.sku_gerado)}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-red-950 border border-slate-800 hover:border-red-800 text-slate-400 hover:text-red-300 transition-all cursor-pointer"
                    title="Excluir produto do catálogo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISUALIZAÇÃO EM TABELA DETALHADA */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">SKU / Identificação</th>
                  <th className="py-3 px-4">Tipo / Norma</th>
                  <th className="py-3 px-4">Bitola x Comprimento</th>
                  <th className="py-3 px-4">Sobremetal</th>
                  <th className="py-3 px-4">Material / Ponta Pintada</th>
                  <th className="py-3 px-4">Classe / Acabamento</th>
                  <th className="py-3 px-4">Peso Unit.</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {filteredProducts.map((p) => {
                  const steelColor = getSteelColorBySpec(p.material_base || '');
                  const isSpecial = p.is_custom_special || p.standard_code === 'ESPECIAL LIVRE';

                  return (
                    <tr key={p.sku_gerado} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {p.foto_produto_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.foto_produto_url}
                              alt={p.sku_gerado}
                              onClick={() =>
                                setPreviewMedia({
                                  type: 'photo',
                                  url: p.foto_produto_url!,
                                  title: p.foto_produto_nome || p.sku_gerado
                                })
                              }
                              className="w-9 h-9 object-cover rounded border border-slate-700 cursor-pointer hover:scale-110 transition-transform shrink-0"
                              title="Clique para ampliar a foto"
                            />
                          )}
                          <div>
                            <div className="font-bold text-white">{p.sku_gerado}</div>
                            {p.codigo_interno_delta && (
                              <div className="text-[10px] text-slate-400">{p.codigo_interno_delta}</div>
                            )}
                            {p.desenho_cliente_ref && (
                              <div className="text-[10px] text-amber-400">DWG: {p.desenho_cliente_ref}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSpecial
                              ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                              : 'bg-sky-950 border border-sky-800 text-sky-300'
                          }`}
                        >
                          {isSpecial ? 'Especial Livre' : p.standard_code}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-200">
                          {p.bitola} {p.comprimento ? `x ${p.comprimento}mm` : ''}
                        </div>
                        <div className="text-[10px] text-slate-500">Rosca: {p.comprimento_rosca_b || 'Tot'} mm</div>
                      </td>

                      <td className="py-3 px-4 text-amber-400 font-bold">
                        {p.sobremetal_corte ? `+${p.sobremetal_corte} mm` : '0 mm'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {steelColor && (
                            <SteelColorBadge
                              corPrimariaHex={steelColor.corPrimariaHex}
                              isBicolor={steelColor.isBicolor}
                              corSecundariaHex={steelColor.corSecundariaHex}
                              size={16}
                              title={steelColor.label}
                            />
                          )}
                          <span className="text-slate-300 truncate max-w-[150px]">{p.material_base}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-300">{p.classe_resistencia || '-'}</span>
                        <div className="text-[10px] text-slate-500">{p.tratamento_superficial || '-'}</div>
                      </td>

                      <td className="py-3 px-4 text-cyan-300 font-bold">
                        {p.peso_liquido_kg ? `${p.peso_liquido_kg.toFixed(3)} kg` : '-'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.foto_produto_url && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewMedia({
                                  type: 'photo',
                                  url: p.foto_produto_url!,
                                  title: p.foto_produto_nome || p.sku_gerado
                                })
                              }
                              className="p-1.5 rounded-lg bg-amber-950 border border-amber-800 text-amber-300 hover:bg-amber-900 transition-all"
                              title="Ver Foto do Produto"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>
                          )}
                          {p.anexo_pdf_url && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewMedia({
                                  type: 'pdf',
                                  url: p.anexo_pdf_url!,
                                  title: p.anexo_pdf_nome || p.sku_gerado
                                })
                              }
                              className="p-1.5 rounded-lg bg-red-950 border border-red-800 text-red-300 hover:bg-red-900 transition-all"
                              title="Ver Desenho PDF Técnico"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          {isSpecial && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 transition-all cursor-pointer flex items-center gap-1 px-2"
                              title="Editar Peça Especial"
                            >
                              <Edit3 className="w-4 h-4 text-cyan-400" />
                              <span className="text-[11px] font-bold">Editar</span>
                            </button>
                          )}
                          {!isSpecial && (
                            <button
                              type="button"
                              onClick={() => onSelectProductForCAD && onSelectProductForCAD(p)}
                              className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 hover:bg-cyan-900 transition-all cursor-pointer"
                              title="Abrir no Desenho CAD 2D"
                            >
                              <FileCode2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(p.sku_gerado)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950 transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. MODAL: CADASTRAR PRODUTO LIVREMENTE (SEM PASSAR PELAS NORMAS)
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            {/* Topbar do Modal */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {editingProduct ? 'Modo de Edição Sob Medida' : 'Engenharia Sem Restrição de Norma'}
                </span>
                <h2 className="text-lg font-black text-white">
                  {editingProduct ? `EDITAR PEÇA ESPECIAL: ${editingProduct.sku_gerado}` : 'CADASTRO LIVRE DE PEÇA ESPECIAL'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensagem de sucesso */}
            {modalSuccessMsg && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{modalSuccessMsg}</span>
              </div>
            )}

            {/* Formulário de Cadastro Livre */}
            <form onSubmit={handleSaveFreeProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Este formulário não exige seleção de norma DIN ou ISO. Preencha livremente as medidas,
                  comprimentos, rosca e o sobremetal de corte para a serra de fita.
                </span>
              </div>

              {/* Linha 1: Código Interno Delta & Família */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Código Interno / Ref. Delta:
                  </label>
                  <input
                    type="text"
                    required
                    value={formCodigoDelta}
                    onChange={(e) => setFormCodigoDelta(e.target.value)}
                    placeholder="Ex: VALE-ESP-4982 ou DELTA-ESP-01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 font-mono focus:border-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase">
                      Família do Fixador:
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsFamilyManagerOpen(true)}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline cursor-pointer bg-cyan-950/60 hover:bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-800/60 transition-all"
                      title="Criar, Editar ou Excluir Famílias de Fixadores"
                    >
                      <Settings className="w-3 h-3 text-cyan-400" />
                      <span>Gerenciar Famílias</span>
                    </button>
                  </div>
                  <select
                    value={formFamily}
                    onChange={(e) => {
                      if (e.target.value === '__NEW_FAMILY__') {
                        setIsFamilyManagerOpen(true);
                      } else {
                        setFormFamily(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 cursor-pointer"
                  >
                    {fastenerFamilies.map((fam) => (
                      <option key={fam.id} value={fam.id}>
                        {fam.name}
                      </option>
                    ))}
                    <option value="__NEW_FAMILY__" className="text-cyan-400 font-bold bg-slate-900">
                      + Criar / Gerenciar Famílias...
                    </option>
                  </select>
                </div>
              </div>

              {/* Linha 2: Descrição Completa */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                  Descrição Completa da Peça:
                </label>
                <input
                  type="text"
                  required
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Ex: Parafuso Cabeça Martelo M24 x 180mm para Revestimento de Moinho"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500"
                />
              </div>

              {/* Linha 3: Bitola, Passo e Comprimento */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Bitola Livre:
                  </label>
                  <input
                    type="text"
                    required
                    value={formBitola}
                    onChange={(e) => setFormBitola(e.target.value)}
                    placeholder="Ex: M24-ESP ou 1.1/2"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Passo da Rosca (mm):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPasso}
                    onChange={(e) => setFormPasso(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Comprimento Total (mm):
                  </label>
                  <input
                    type="number"
                    value={formComprimento}
                    onChange={(e) => setFormComprimento(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Linha 4: Comprimento de Rosca (b) e Sobremetal de Corte */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Comprimento da Rosca b (mm):
                  </label>
                  <input
                    type="number"
                    value={formComprimentoRosca}
                    onChange={(e) => setFormComprimentoRosca(parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 60"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-amber-400 font-bold uppercase mb-1 flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    Sobremetal para Corte de Serra (mm):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formSobremetalCorte}
                    onChange={(e) => setFormSobremetalCorte(parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 5.0"
                    className="w-full bg-slate-950 border border-amber-600/70 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Linha 5: Dimensões de Cabeça / Perfil (Opcionais) */}
              <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    Largura Chave s (mm):
                  </label>
                  <input
                    type="number"
                    value={formChave}
                    onChange={(e) => setFormChave(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    Altura Cabeça k (mm):
                  </label>
                  <input
                    type="number"
                    value={formAlturaCabeca}
                    onChange={(e) => setFormAlturaCabeca(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    Diâm. Cabeça dk (mm):
                  </label>
                  <input
                    type="number"
                    value={formDiametroCabeca}
                    onChange={(e) => setFormDiametroCabeca(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Linha 6: Material Base e Classe de Resistência com Seletor Visual de Aço */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Material Base / Liga:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={formMaterialBase}
                      onChange={(e) => setFormMaterialBase(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                    >
                      <option value="Aço Médio Carbono SAE 1045">SAE 1045 (Vermelho)</option>
                      <option value="Aço Baixo Carbono SAE 1020">SAE 1020 (Branco)</option>
                      <option value="Aço Liga SAE 4140">SAE 4140 (Verde Escuro)</option>
                      <option value="Aço Liga SAE 4340">SAE 4340 (Verde / Vermelho)</option>
                      <option value="Aço Liga SAE 8640">SAE 8640 (Laranja / Vermelho)</option>
                      <option value="Aço Inoxidável AISI 304">AISI 304 (Amarelo)</option>
                      <option value="Aço Inoxidável AISI 316">AISI 316 (Vermelho Carmesim)</option>
                      <option value="ASTM A193 Grau B7">ASTM A193 Grau B7</option>
                      <option value="ASTM A193 Grau B7M">ASTM A193 Grau B7M</option>
                      <option value="ASTM A320 Grau L7">ASTM A320 Grau L7</option>
                      <option value="ASTM A325 Estrutural">ASTM A325 Estrutural</option>
                    </select>

                    {/* Exibição da cor da ponta no rack de almoxarifado */}
                    {getSteelColorBySpec(formMaterialBase) && (
                      <SteelColorBadge
                        corPrimariaHex={getSteelColorBySpec(formMaterialBase)!.corPrimariaHex}
                        isBicolor={getSteelColorBySpec(formMaterialBase)!.isBicolor}
                        corSecundariaHex={getSteelColorBySpec(formMaterialBase)!.corSecundariaHex}
                        size={28}
                        title={`Cor da Ponta no Rack: ${getSteelColorBySpec(formMaterialBase)!.label}`}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Classe de Resistência:
                  </label>
                  <input
                    type="text"
                    value={formClasseResistencia}
                    onChange={(e) => setFormClasseResistencia(e.target.value)}
                    placeholder="Ex: 8.8, 10.9, 12.9, Grau 5, Grau 8, B7..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Linha 7: Tratamento Superficial & Ref do Desenho do Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Tratamento Superficial:
                  </label>
                  <select
                    value={formTratamento}
                    onChange={(e) => setFormTratamento(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  >
                    <option value="Polido / Oleado">Polido / Oleado</option>
                    <option value="Zincado Branco (ZB)">Zincado Branco (ZB)</option>
                    <option value="Galvanizado a Fogo (GF)">Galvanizado a Fogo (GF)</option>
                    <option value="Enegrecido de Têmpera">Enegrecido de Têmpera</option>
                    <option value="Fosfatizado">Fosfatizado</option>
                    <option value="Geomet 321 / 500">Geomet 321 / 500</option>
                    <option value="Bicromatizado Amarelo">Bicromatizado Amarelo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Ref. Desenho do Cliente / DWG:
                  </label>
                  <input
                    type="text"
                    value={formDesenhoClienteRef}
                    onChange={(e) => setFormDesenhoClienteRef(e.target.value)}
                    placeholder="Ex: DWG-VALE-4982-REV2"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Linha 8: Anexos de Arquivo (PDF e Fotos) */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-cyan-400" />
                    ANEXAR ARQUIVO EM PDF E/OU FOTOS DO PRODUTO
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Formatos: .PDF, .PNG, .JPG, .WEBP</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Bloco 1: Upload de Foto do Produto / Amostra */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-700/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-mono text-slate-300 font-bold uppercase flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        Foto Real / Amostra da Peça:
                      </label>
                      {formPhotoData && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormPhotoData('');
                            setFormPhotoName('');
                          }}
                          className="text-[10px] text-red-400 hover:underline flex items-center gap-0.5"
                        >
                          <X className="w-3 h-3" /> Remover
                        </button>
                      )}
                    </div>

                    {formPhotoData ? (
                      <div className="flex items-center gap-3 p-2 bg-slate-950 rounded-lg border border-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formPhotoData}
                          alt="Prévia da Peça"
                          className="w-14 h-14 object-cover rounded-md border border-slate-700 shadow"
                        />
                        <div className="overflow-hidden flex-1">
                          <span className="text-xs font-mono font-bold text-white block truncate">{formPhotoName}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">✓ Foto pronta para salvar</span>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-lg cursor-pointer bg-slate-950/60 transition-colors group">
                        <ImageIcon className="w-6 h-6 text-slate-500 group-hover:text-amber-400 mb-1 transition-colors" />
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Clique para selecionar foto</span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5">PNG, JPG ou WEBP</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Bloco 2: Upload de Desenho Técnico em PDF */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-700/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-mono text-slate-300 font-bold uppercase flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-red-400" />
                        Desenho Técnico / Datasheet (PDF):
                      </label>
                      {formPdfData && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormPdfData('');
                            setFormPdfName('');
                            setFormPdfSize('');
                          }}
                          className="text-[10px] text-red-400 hover:underline flex items-center gap-0.5"
                        >
                          <X className="w-3 h-3" /> Remover
                        </button>
                      )}
                    </div>

                    {formPdfData ? (
                      <div className="flex items-center gap-3 p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="w-12 h-12 rounded-lg bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 font-bold text-xs font-mono shrink-0">
                          PDF
                        </div>
                        <div className="overflow-hidden flex-1">
                          <span className="text-xs font-mono font-bold text-white block truncate">{formPdfName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{formPdfSize} • Pronto para salvar</span>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-700 hover:border-red-400/60 rounded-lg cursor-pointer bg-slate-950/60 transition-colors group">
                        <FileText className="w-6 h-6 text-slate-500 group-hover:text-red-400 mb-1 transition-colors" />
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Clique para selecionar PDF</span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5">Pranchas de desenho .PDF</span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handlePdfUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Linha 9: Peso Teórico e Observações */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-mono text-cyan-400 font-bold uppercase mb-1">
                    Peso Estimado (kg):
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formPesoManual || pesoTeoricoCalculado}
                    onChange={(e) => setFormPesoManual(e.target.value)}
                    className="w-full bg-slate-900 border border-cyan-800 rounded px-3 py-1.5 text-xs text-cyan-300 font-mono font-bold"
                  />
                  <span className="text-[9px] text-slate-500 font-mono">Calculado por densidade 7.85g/cm³</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    Observações de Fabricação / Tolerâncias:
                  </label>
                  <textarea
                    rows={2}
                    value={formObservacoes}
                    onChange={(e) => setFormObservacoes(e.target.value)}
                    placeholder="Arestas usinadas sob tolerância h11, raios de concordância r=1.5mm..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Botões do Rodapé do Modal */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-950/80 active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>{editingProduct ? 'Salvar Alterações da Peça' : 'Salvar Produto no Catálogo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL DE VISUALIZAÇÃO AMPLIADA (FOTO / PDF TÉCNICO)
          ========================================================================= */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {previewMedia.type === 'photo' ? (
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                ) : (
                  <FileText className="w-4 h-4 text-red-400" />
                )}
                <span className="font-mono font-bold text-xs text-white truncate max-w-md">
                  {previewMedia.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewMedia.url}
                  download={previewMedia.title}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewMedia(null)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-950/80">
              {previewMedia.type === 'photo' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewMedia.url}
                  alt={previewMedia.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl border border-slate-800 shadow-2xl"
                />
              ) : (
                <div className="w-full h-[75vh] flex flex-col items-center justify-center space-y-3">
                  <iframe
                    src={previewMedia.url}
                    title={previewMedia.title}
                    className="w-full h-full rounded-xl border border-slate-800 bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. MODAL: GERENCIAMENTO DE FAMÍLIAS DE FIXADORES (CRIAR, EDITAR, DELETAR)
          ========================================================================= */}
      {isFamilyManagerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            {/* Topbar */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5" />
                  Engenharia e Catálogo
                </span>
                <h3 className="text-base font-black text-white">GERENCIAR FAMÍLIAS DO FIXADOR</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFamilyManagerOpen(false);
                  handleCancelEditFamily();
                }}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feedback Message */}
            {familyManagerMsg && (
              <div
                className={`mx-6 mt-4 p-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between border ${
                  familyManagerMsg.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-800 text-rose-300'
                }`}
              >
                <span>{familyManagerMsg.text}</span>
                <button type="button" onClick={() => setFamilyManagerMsg(null)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Conteúdo rolável */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Formulário de Adicionar / Editar Família */}
              <form
                onSubmit={handleSaveFamily}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                    {editingFamilyItem ? (
                      <>
                        <Edit3 className="w-4 h-4 text-cyan-400" />
                        <span>Editar Família Existente</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>Adicionar Nova Família</span>
                      </>
                    )}
                  </span>
                  {editingFamilyItem && (
                    <button
                      type="button"
                      onClick={handleCancelEditFamily}
                      className="text-[10px] font-mono text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                      Nome da Família:
                    </label>
                    <input
                      type="text"
                      required
                      value={familyFormName}
                      onChange={(e) => setFamilyFormName(e.target.value)}
                      placeholder="Ex: Pino Cônico Especial, Grampo U, Rebite Estrutural..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 font-sans"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      {editingFamilyItem ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          <span>Salvar</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-slate-950" />
                          <span>Adicionar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">
                    Descrição / Aplicação Típica (Opcional):
                  </label>
                  <input
                    type="text"
                    value={familyFormDesc}
                    onChange={(e) => setFamilyFormDesc(e.target.value)}
                    placeholder="Ex: Fixadores de acoplamento cônico para linha pesada de mineração"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-cyan-500"
                  />
                </div>
              </form>

              {/* Lista das Famílias Ativas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Famílias Registradas ({fastenerFamilies.length}):</span>
                  <span>Ações</span>
                </div>

                <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden">
                  {fastenerFamilies.map((fam) => {
                    const isSelected = editingFamilyItem?.id === fam.id;
                    const countInUse = products.filter(
                      (p) =>
                        p.family?.toLowerCase() === fam.id.toLowerCase() ||
                        p.family?.toLowerCase() === fam.name.toLowerCase()
                    ).length;

                    return (
                      <div
                        key={fam.id}
                        className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                          isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{fam.name}</span>
                            {fam.isDefault && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                                Padrão
                              </span>
                            )}
                            {countInUse > 0 && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                                {countInUse} {countInUse === 1 ? 'item' : 'itens'}
                              </span>
                            )}
                          </div>
                          {fam.description && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{fam.description}</p>
                          )}
                          <div className="text-[10px] text-slate-500 font-mono">ID: {fam.id}</div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditFamily(fam)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-800 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
                            title="Editar nome da família"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFamily(fam)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
                            title="Excluir família"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rodapé do Modal de Famílias */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetFamiliesToDefault}
                className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 hover:underline cursor-pointer"
                title="Restaurar a lista de famílias padrão"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrões</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsFamilyManagerOpen(false);
                  handleCancelEditFamily();
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
