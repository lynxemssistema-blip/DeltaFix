// src/components/commercial/CompaniesManagement.tsx - Gestão de Parceiros Comerciais (PJ e PF) com Cards e Tabela
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CompanyPartner,
  SegmentoIndustrial
} from '@/lib/types/commercial';
import {
  getSavedCompanies,
  saveCompany,
  deleteCompany
} from '@/lib/services/commercialService';
import {
  formatCpfCnpj,
  formatPhone,
  formatCep,
  getDocumentType
} from '@/lib/utils/formatters';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Layers,
  Sparkles,
  AlertCircle,
  Filter,
  UserCheck,
  Truck,
  Users,
  LayoutGrid,
  Table as TableIcon,
  Upload,
  Image as ImageIcon,
  User,
  Link as LinkIcon,
  X
} from 'lucide-react';

function Instagram({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const SEGMENTOS_DISPONIVEIS: SegmentoIndustrial[] = [
  'Mineração',
  'Siderurgia & Metalurgia',
  'Óleo, Gás & Petroquímica',
  'Papel & Celulose',
  'Automotivo & Autopeças',
  'Construção Pesada & Infraestrutura',
  'Energia & Eólica',
  'Agronegócio & Maquinário',
  'Manutenção Industrial & Caldeiraria',
  'Outros'
];

export function CompaniesManagement() {
  const [companies, setCompanies] = useState<CompanyPartner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cliente' | 'fornecedor' | 'ambos'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyPartner | null>(null);

  // Form fields
  const [formTipoPessoa, setFormTipoPessoa] = useState<'PJ' | 'PF'>('PJ');
  const [formDocumento, setFormDocumento] = useState('');
  const [formRg, setFormRg] = useState('');
  const [formRazaoSocial, setFormRazaoSocial] = useState('');
  const [formNomeFantasia, setFormNomeFantasia] = useState('');
  const [formInscricaoEstadual, setFormInscricaoEstadual] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formIsCliente, setFormIsCliente] = useState(true);
  const [formIsFornecedor, setFormIsFornecedor] = useState(false);
  const [formSegmento, setFormSegmento] = useState<SegmentoIndustrial>('Mineração');

  // Endereço
  const [formLogradouro, setFormLogradouro] = useState('');
  const [formNumero, setFormNumero] = useState('');
  const [formComplemento, setFormComplemento] = useState('');
  const [formBairro, setFormBairro] = useState('');
  const [formCidade, setFormCidade] = useState('');
  const [formUf, setFormUf] = useState('MG');
  const [formCep, setFormCep] = useState('');

  // Contato Comercial
  const [formContatoComNome, setFormContatoComNome] = useState('');
  const [formContatoComEmail, setFormContatoComEmail] = useState('');
  const [formContatoComTelefone, setFormContatoComTelefone] = useState('');
  const [formContatoComCargo, setFormContatoComCargo] = useState('Comprador');

  // Contato Técnico
  const [formContatoTecNome, setFormContatoTecNome] = useState('');
  const [formContatoTecEmail, setFormContatoTecEmail] = useState('');
  const [formContatoTecTelefone, setFormContatoTecTelefone] = useState('');
  const [formContatoTecCargo, setFormContatoTecCargo] = useState('Engenheiro Mecânico');

  const [formObservacoes, setFormObservacoes] = useState('');
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [cnpjFeedback, setCnpjFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setCompanies(getSavedCompanies());
  }, []);

  const handleOpenNew = () => {
    setEditingCompany(null);
    setFormTipoPessoa('PJ');
    setFormDocumento('');
    setFormRg('');
    setFormRazaoSocial('');
    setFormNomeFantasia('');
    setFormInscricaoEstadual('');
    setFormLogoUrl('');
    setFormInstagram('');
    setFormIsCliente(true);
    setFormIsFornecedor(false);
    setFormSegmento('Mineração');
    setFormLogradouro('');
    setFormNumero('');
    setFormComplemento('');
    setFormBairro('');
    setFormCidade('');
    setFormUf('MG');
    setFormCep('');
    setFormContatoComNome('');
    setFormContatoComEmail('');
    setFormContatoComTelefone('');
    setFormContatoComCargo('Comprador');
    setFormContatoTecNome('');
    setFormContatoTecEmail('');
    setFormContatoTecTelefone('');
    setFormContatoTecCargo('Engenheiro');
    setFormObservacoes('');
    setCnpjFeedback(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp: CompanyPartner) => {
    setEditingCompany(comp);
    setFormTipoPessoa(comp.tipo_pessoa || (comp.cnpj.replace(/\D/g, '').length === 11 ? 'PF' : 'PJ'));
    setFormDocumento(formatCpfCnpj(comp.cnpj));
    setFormRg(comp.rg || '');
    setFormRazaoSocial(comp.razao_social);
    setFormNomeFantasia(comp.nome_fantasia || '');
    setFormInscricaoEstadual(comp.inscricao_estadual || '');
    setFormLogoUrl(comp.logo_url || '');
    setFormInstagram(comp.instagram || '');
    setFormIsCliente(comp.is_cliente);
    setFormIsFornecedor(comp.is_fornecedor);
    setFormSegmento(comp.segmento);
    setFormLogradouro(comp.endereco.logradouro);
    setFormNumero(comp.endereco.numero);
    setFormComplemento(comp.endereco.complemento || '');
    setFormBairro(comp.endereco.bairro);
    setFormCidade(comp.endereco.cidade);
    setFormUf(comp.endereco.uf);
    setFormCep(formatCep(comp.endereco.cep));
    setFormContatoComNome(comp.contato_comercial.nome);
    setFormContatoComEmail(comp.contato_comercial.email);
    setFormContatoComTelefone(formatPhone(comp.contato_comercial.telefone));
    setFormContatoComCargo(comp.contato_comercial.cargo || 'Comprador');
    setFormContatoTecNome(comp.contato_tecnico?.nome || '');
    setFormContatoTecEmail(comp.contato_tecnico?.email || '');
    setFormContatoTecTelefone(comp.contato_tecnico?.telefone ? formatPhone(comp.contato_tecnico.telefone) : '');
    setFormContatoTecCargo(comp.contato_tecnico?.cargo || 'Engenheiro');
    setFormObservacoes(comp.observacoes || '');
    setCnpjFeedback(null);
    setIsModalOpen(true);
  };

  // Upload local de imagem e conversão para Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('O arquivo selecionado é maior que 2MB. Selecione uma imagem mais leve.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Consulta automática CNPJ na Receita Federal
  const handleConsultCnpj = async () => {
    const clean = formDocumento.replace(/\D/g, '');
    if (clean.length !== 14) {
      setCnpjFeedback('O CNPJ deve conter 14 dígitos numéricos para consulta na Receita.');
      return;
    }
    setIsSearchingCnpj(true);
    setCnpjFeedback(null);

    try {
      const res = await fetch(`/api/cnpj/${clean}`);
      const data = await res.json();
      if (data.razao_social) {
        setFormRazaoSocial(data.razao_social);
        setFormNomeFantasia(data.nome_fantasia || data.razao_social);
        if (data.endereco) {
          setFormLogradouro(data.endereco.logradouro || '');
          setFormNumero(data.endereco.numero || '');
          setFormComplemento(data.endereco.complemento || '');
          setFormBairro(data.endereco.bairro || '');
          setFormCidade(data.endereco.cidade || '');
          setFormUf(data.endereco.uf || 'MG');
          setFormCep(formatCep(data.endereco.cep || ''));
        }
        if (data.contato?.telefone && !formContatoComTelefone) {
          setFormContatoComTelefone(formatPhone(data.contato.telefone));
        }
        if (data.contato?.email && !formContatoComEmail) {
          setFormContatoComEmail(data.contato.email);
        }
        setCnpjFeedback(`Dados preenchidos com sucesso via Receita Federal! (${data.source})`);
      } else {
        setCnpjFeedback('CNPJ válido, mas dados não encontrados na base pública. Preencha manualmente.');
      }
    } catch {
      setCnpjFeedback('Erro na consulta online da Receita Federal. Preencha manualmente.');
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIsCliente && !formIsFornecedor) {
      alert('A empresa deve ser classificada como Cliente, Fornecedor ou Ambos!');
      return;
    }

    const cleanDoc = formDocumento.replace(/\D/g, '');
    const detectedType = formTipoPessoa || (cleanDoc.length === 11 ? 'PF' : 'PJ');

    const newComp: CompanyPartner = {
      id: editingCompany ? editingCompany.id : `comp-${Date.now()}`,
      tipo_pessoa: detectedType,
      cnpj: formDocumento,
      documento: formDocumento,
      rg: formRg || undefined,
      razao_social: formRazaoSocial,
      nome_fantasia: formNomeFantasia || formRazaoSocial,
      inscricao_estadual: formInscricaoEstadual,
      logo_url: formLogoUrl || undefined,
      instagram: formInstagram || undefined,
      is_cliente: formIsCliente,
      is_fornecedor: formIsFornecedor,
      segmento: formSegmento,
      endereco: {
        logradouro: formLogradouro,
        numero: formNumero,
        complemento: formComplemento,
        bairro: formBairro,
        cidade: formCidade,
        uf: formUf,
        cep: formCep
      },
      contato_comercial: {
        nome: formContatoComNome,
        email: formContatoComEmail,
        telefone: formContatoComTelefone,
        cargo: formContatoComCargo
      },
      contato_tecnico: formContatoTecNome
        ? {
            nome: formContatoTecNome,
            email: formContatoTecEmail,
            telefone: formContatoTecTelefone,
            cargo: formContatoTecCargo
          }
        : undefined,
      observacoes: formObservacoes,
      created_at: editingCompany ? editingCompany.created_at : new Date().toISOString()
    };

    const updated = saveCompany(newComp);
    setCompanies(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Deseja realmente remover o parceiro "${name}"?`)) {
      const updated = deleteCompany(id);
      setCompanies(updated);
    }
  };

  // Filtragem
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.nome_fantasia && c.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.cnpj.includes(searchTerm) ||
      (c.instagram && c.instagram.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.segmento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.endereco.cidade.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'cliente') return c.is_cliente && !c.is_fornecedor;
    if (filterType === 'fornecedor') return c.is_fornecedor && !c.is_cliente;
    if (filterType === 'ambos') return c.is_cliente && c.is_fornecedor;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-wide">
              Gestão de Parceiros Comerciais (PJ & PF)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cadastro completo de Clientes e Fornecedores com suporte a Logotipo, Instagram, CPF ou CNPJ formatado automaticamente.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/60 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Parceiro (PJ/PF)</span>
        </button>
      </div>

      {/* Filters, View Toggle & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Nome/Razão, CPF/CNPJ, Instagram, Cidade ou Segmento..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Pills & View Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2">
          {/* Pills de Tipo */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtrar:
            </span>
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({companies.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('cliente')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'cliente'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Clientes
            </button>
            <button
              type="button"
              onClick={() => setFilterType('fornecedor')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'fornecedor'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Fornecedores
            </button>
            <button
              type="button"
              onClick={() => setFilterType('ambos')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'ambos'
                  ? 'bg-purple-950 text-purple-300 border border-purple-700'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Ambos
            </button>
          </div>

          {/* VIEW MODE TOGGLE (CARDS vs TABELA) */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Exibir em formato de Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Exibir em formato de Tabela detalhada"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabela</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          OPÇÃO 1: VISUALIZAÇÃO EM CARDS
          ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCompanies.map((comp) => {
            const isPf = comp.tipo_pessoa === 'PF' || comp.cnpj.replace(/\D/g, '').length === 11;

            return (
              <div
                key={comp.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    {/* Logotipo ou Avatar */}
                    <div className="flex items-center gap-3">
                      {comp.logo_url ? (
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center overflow-hidden shrink-0">
                          <img
                            src={comp.logo_url}
                            alt={comp.razao_social}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-black text-sm shrink-0">
                          {isPf ? <User className="w-6 h-6 text-slate-400" /> : <Building2 className="w-6 h-6 text-slate-400" />}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-white leading-tight">
                            {comp.razao_social}
                          </h3>
                        </div>
                        {comp.nome_fantasia && comp.nome_fantasia !== comp.razao_social && (
                          <div className="text-xs text-slate-400 font-medium">
                            {comp.nome_fantasia}
                          </div>
                        )}
                        {comp.instagram && (
                          <a
                            href={
                              comp.instagram.startsWith('http')
                                ? comp.instagram
                                : `https://instagram.com/${comp.instagram.replace('@', '')}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-pink-400 hover:text-pink-300 font-mono flex items-center gap-1 mt-0.5"
                          >
                            <Instagram className="w-3 h-3 text-pink-400" />
                            <span>{comp.instagram.startsWith('@') ? comp.instagram : `@${comp.instagram}`}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Badges de Tipo */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-slate-400 border border-slate-800">
                        {isPf ? 'PESSOA FÍSICA' : 'PESSOA JURÍDICA'}
                      </span>
                      <div className="flex items-center gap-1">
                        {comp.is_cliente && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> CLIENTE
                          </span>
                        )}
                        {comp.is_fornecedor && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                            <Truck className="w-3 h-3" /> FORNECEDOR
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informações Fiscais & Segmento */}
                  <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">
                        {isPf ? 'CPF:' : 'CNPJ:'}
                      </span>
                      <span className="font-mono text-slate-200 font-bold">{formatCpfCnpj(comp.cnpj)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Segmento:</span>
                      <span className="text-cyan-400 font-semibold">{comp.segmento}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Localização:</span>
                      <span className="text-slate-300 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        {comp.endereco.cidade} - {comp.endereco.uf}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">
                        {isPf ? 'RG:' : 'Inscr. Estadual:'}
                      </span>
                      <span className="font-mono text-slate-300">
                        {isPf ? comp.rg || 'Não informado' : comp.inscricao_estadual || 'Isento / Não inf.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contatos */}
                <div className="border-t border-slate-800/80 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1">
                      <Users className="w-3 h-3 text-cyan-400" /> Contato Comercial:
                    </span>
                    <div className="font-bold text-slate-200">{comp.contato_comercial.nome}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500 shrink-0" /> {comp.contato_comercial.email}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500 shrink-0" /> {formatPhone(comp.contato_comercial.telefone)}
                    </div>
                  </div>

                  {comp.contato_tecnico?.nome ? (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-amber-400" /> Contato Técnico/Engenharia:
                      </span>
                      <div className="font-bold text-slate-200">{comp.contato_tecnico.nome}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" /> {comp.contato_tecnico.email}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500 shrink-0" /> {formatPhone(comp.contato_tecnico.telefone)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic flex items-center">
                      Contato de engenharia unificado ao comercial.
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Cadastrado em {new Date(comp.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(comp)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3 text-cyan-400" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(comp.id, comp.razao_social)}
                      className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          OPÇÃO 2: VISUALIZAÇÃO EM TABELA COMPLETA
          ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-3 px-4">Parceiro / Logo</th>
                  <th className="py-3 px-4">Documento (CPF/CNPJ)</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Segmento</th>
                  <th className="py-3 px-4">Cidade / UF</th>
                  <th className="py-3 px-4">Contato Comercial</th>
                  <th className="py-3 px-4">Instagram</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {filteredCompanies.map((comp) => {
                  const isPf = comp.tipo_pessoa === 'PF' || comp.cnpj.replace(/\D/g, '').length === 11;

                  return (
                    <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Logo & Razão Social */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {comp.logo_url ? (
                            <img
                              src={comp.logo_url}
                              alt={comp.razao_social}
                              className="w-8 h-8 rounded-lg object-contain bg-slate-950 border border-slate-800 p-0.5 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                              {isPf ? <User className="w-4 h-4 text-slate-500" /> : <Building2 className="w-4 h-4 text-slate-500" />}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white leading-snug">{comp.razao_social}</div>
                            {comp.nome_fantasia && comp.nome_fantasia !== comp.razao_social && (
                              <div className="text-[10px] text-slate-400">{comp.nome_fantasia}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CPF / CNPJ */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-200 whitespace-nowrap">
                        {formatCpfCnpj(comp.cnpj)}
                        <span className="block text-[9px] font-normal text-slate-500">
                          {isPf ? 'Pessoa Física' : 'Pessoa Jurídica'}
                        </span>
                      </td>

                      {/* Badges Cliente / Fornecedor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {comp.is_cliente && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 w-fit">
                              CLIENTE
                            </span>
                          )}
                          {comp.is_fornecedor && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 w-fit">
                              FORNECEDOR
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Segmento */}
                      <td className="py-3 px-4 text-cyan-400 font-medium whitespace-nowrap">
                        {comp.segmento}
                      </td>

                      {/* Cidade / UF */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        {comp.endereco.cidade} - {comp.endereco.uf}
                      </td>

                      {/* Contato Comercial */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{comp.contato_comercial.nome}</div>
                        <div className="text-[10px] text-slate-400">{formatPhone(comp.contato_comercial.telefone)}</div>
                      </td>

                      {/* Instagram */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {comp.instagram ? (
                          <a
                            href={
                              comp.instagram.startsWith('http')
                                ? comp.instagram
                                : `https://instagram.com/${comp.instagram.replace('@', '')}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-400 hover:text-pink-300 font-mono text-[11px] flex items-center gap-1"
                          >
                            <Instagram className="w-3.5 h-3.5" />
                            <span>{comp.instagram.startsWith('@') ? comp.instagram : `@${comp.instagram}`}</span>
                          </a>
                        ) : (
                          <span className="text-slate-600 font-mono text-[10px]">--</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(comp)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400"
                            title="Editar parceiro"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(comp.id, comp.razao_social)}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300"
                            title="Excluir parceiro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {filteredCompanies.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Nenhum parceiro encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Não encontramos nenhum registro com os filtros selecionados. Cadastre uma nova empresa ou cliente acima.
          </p>
        </div>
      )}

      {/* =========================================================================
          MODAL DE CADASTRO / EDIÇÃO DE PARCEIRO (PJ / PF COM LOGO E INSTAGRAM)
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  {editingCompany ? 'Editar Parceiro Comercial' : 'Cadastrar Novo Parceiro (PJ / PF)'}
                </h3>
                <p className="text-xs text-slate-400">
                  Preencha o documento com formatação automática e faça o upload do logotipo da empresa ou foto do parceiro.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Seletor PJ / PF e Classificação Cliente/Fornecedor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tipo de Pessoa */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                    Tipo de Cadastro:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormTipoPessoa('PJ')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        formTipoPessoa === 'PJ'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-600 shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Pessoa Jurídica (CNPJ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormTipoPessoa('PF')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        formTipoPessoa === 'PF'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-600 shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Pessoa Física (CPF)
                    </button>
                  </div>
                </div>

                {/* Cliente / Fornecedor */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                    Classificação Comercial:
                  </span>
                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                      <input
                        type="checkbox"
                        checked={formIsCliente}
                        onChange={(e) => setFormIsCliente(e.target.checked)}
                        className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                      />
                      <span>[✓] Cliente</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                      <input
                        type="checkbox"
                        checked={formIsFornecedor}
                        onChange={(e) => setFormIsFornecedor(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                      />
                      <span>[✓] Fornecedor</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Documento (CPF/CNPJ) com Máscara Dinâmica Automática */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase">
                    {formTipoPessoa === 'PJ' ? 'CNPJ da Empresa:' : 'CPF do Cliente:'}
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    {getDocumentType(formDocumento) === 'CPF'
                      ? '👤 Formato CPF Reconhecido'
                      : getDocumentType(formDocumento) === 'CNPJ'
                      ? '🏢 Formato CNPJ Reconhecido'
                      : 'Digitando...'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formDocumento}
                    onChange={(e) => setFormDocumento(formatCpfCnpj(e.target.value))}
                    placeholder={formTipoPessoa === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500"
                  />
                  {formDocumento.replace(/\D/g, '').length === 14 && (
                    <button
                      type="button"
                      onClick={handleConsultCnpj}
                      disabled={isSearchingCnpj}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-950/60 transition-all disabled:opacity-50 shrink-0"
                    >
                      {isSearchingCnpj ? (
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      <span>Consultar Receita</span>
                    </button>
                  )}
                </div>
                {cnpjFeedback && (
                  <p className="text-[11px] font-mono text-cyan-400 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    {cnpjFeedback}
                  </p>
                )}
              </div>

              {/* Razão Social / Nome Completo e Nome Fantasia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    {formTipoPessoa === 'PJ' ? 'Razão Social:' : 'Nome Completo:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formRazaoSocial}
                    onChange={(e) => setFormRazaoSocial(e.target.value)}
                    placeholder={formTipoPessoa === 'PJ' ? 'Nome empresarial completo' : 'Nome completo da pessoa física'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    {formTipoPessoa === 'PJ' ? 'Nome Fantasia:' : 'Apelido / Como prefere ser chamado:'}
                  </label>
                  <input
                    type="text"
                    value={formNomeFantasia}
                    onChange={(e) => setFormNomeFantasia(e.target.value)}
                    placeholder="Nome comercial ou apelido"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Logotipo (Upload ou URL) & Instagram */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase block">
                  Identidade Visual & Mídias Sociais:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Logotipo */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                      Logotipo / Foto (Upload ou URL):
                    </label>
                    <div className="flex items-center gap-2">
                      {formLogoUrl ? (
                        <div className="relative w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 p-0.5 shrink-0 overflow-hidden group">
                          <img
                            src={formLogoUrl}
                            alt="Logo Preview"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setFormLogoUrl('')}
                            className="absolute inset-0 bg-red-950/80 text-red-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remover imagem"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-slate-600 shrink-0">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={formLogoUrl}
                          onChange={(e) => setFormLogoUrl(e.target.value)}
                          placeholder="https://exemplo.com/logo.png"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white placeholder-slate-600"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-bold text-cyan-400 flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" /> Fazer Upload
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <span className="text-[10px] text-slate-500">JPG, PNG ou SVG</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                      Instagram do Parceiro:
                    </label>
                    <div className="relative">
                      <Instagram className="w-4 h-4 absolute left-3 top-2.5 text-pink-400" />
                      <input
                        type="text"
                        value={formInstagram}
                        onChange={(e) => setFormInstagram(e.target.value)}
                        placeholder="@parafusosdelta ou link do perfil"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inscrição Estadual / RG e Segmento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    {formTipoPessoa === 'PJ' ? 'Inscrição Estadual (IE):' : 'RG (Registro Geral):'}
                  </label>
                  <input
                    type="text"
                    value={formTipoPessoa === 'PJ' ? formInscricaoEstadual : formRg}
                    onChange={(e) =>
                      formTipoPessoa === 'PJ'
                        ? setFormInscricaoEstadual(e.target.value)
                        : setFormRg(e.target.value)
                    }
                    placeholder={formTipoPessoa === 'PJ' ? 'Ex: 062.345.890-0012 ou ISENTO' : 'Ex: MG-12.345.678'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Segmento Industrial:
                  </label>
                  <select
                    value={formSegmento}
                    onChange={(e) => setFormSegmento(e.target.value as SegmentoIndustrial)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500"
                  >
                    {SEGMENTOS_DISPONIVEIS.map((seg) => (
                      <option key={seg} value={seg}>
                        {seg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Endereço */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase block">
                  Endereço & Localização:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Logradouro (Rua, Av, Rodovia)"
                      value={formLogradouro}
                      onChange={(e) => setFormLogradouro(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Número / KM"
                      value={formNumero}
                      onChange={(e) => setFormNumero(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={formBairro}
                      onChange={(e) => setFormBairro(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={formCidade}
                      onChange={(e) => setFormCidade(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="UF (Ex: MG)"
                      value={formUf}
                      onChange={(e) => setFormUf(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="CEP (00000-000)"
                      value={formCep}
                      onChange={(e) => setFormCep(formatCep(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Contatos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Comercial */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase block">
                    Contato Comercial / Comprador:
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Nome do Comprador ou Contato"
                    value={formContatoComNome}
                    onChange={(e) => setFormContatoComNome(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="email"
                    required
                    placeholder="E-mail"
                    value={formContatoComEmail}
                    onChange={(e) => setFormContatoComEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Telefone / WhatsApp"
                    value={formContatoComTelefone}
                    onChange={(e) => setFormContatoComTelefone(formatPhone(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                {/* Técnico */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-mono font-bold text-amber-400 uppercase block">
                    Contato Técnico / Engenharia (Opcional):
                  </span>
                  <input
                    type="text"
                    placeholder="Nome do Engenheiro / Inspetor"
                    value={formContatoTecNome}
                    onChange={(e) => setFormContatoTecNome(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="email"
                    placeholder="E-mail técnico"
                    value={formContatoTecEmail}
                    onChange={(e) => setFormContatoTecEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Telefone técnico"
                    value={formContatoTecTelefone}
                    onChange={(e) => setFormContatoTecTelefone(formatPhone(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                  Observações Técnicas / Restrições de Fornecimento:
                </label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  placeholder="Ex: Exigência mandatória de Ensaio de Líquido Penetrante, Tratamento térmico sob norma ASTM..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              {/* Botões do Rodapé do Modal */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-950/80 transition-all"
                >
                  {editingCompany ? 'Salvar Alterações' : 'Concluir Cadastro do Parceiro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
