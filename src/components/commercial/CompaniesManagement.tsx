// src/components/commercial/CompaniesManagement.tsx - Gestão de Parceiros Comerciais PJ (Clientes e Fornecedores)
'use client';

import React, { useState, useEffect } from 'react';
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
  Users
} from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyPartner | null>(null);

  // Form fields
  const [formCnpj, setFormCnpj] = useState('');
  const [formRazaoSocial, setFormRazaoSocial] = useState('');
  const [formNomeFantasia, setFormNomeFantasia] = useState('');
  const [formInscricaoEstadual, setFormInscricaoEstadual] = useState('');
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

  useEffect(() => {
    setCompanies(getSavedCompanies());
  }, []);

  const handleOpenNew = () => {
    setEditingCompany(null);
    setFormCnpj('');
    setFormRazaoSocial('');
    setFormNomeFantasia('');
    setFormInscricaoEstadual('');
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
    setFormCnpj(comp.cnpj);
    setFormRazaoSocial(comp.razao_social);
    setFormNomeFantasia(comp.nome_fantasia || '');
    setFormInscricaoEstadual(comp.inscricao_estadual || '');
    setFormIsCliente(comp.is_cliente);
    setFormIsFornecedor(comp.is_fornecedor);
    setFormSegmento(comp.segmento);
    setFormLogradouro(comp.endereco.logradouro);
    setFormNumero(comp.endereco.numero);
    setFormComplemento(comp.endereco.complemento || '');
    setFormBairro(comp.endereco.bairro);
    setFormCidade(comp.endereco.cidade);
    setFormUf(comp.endereco.uf);
    setFormCep(comp.endereco.cep);
    setFormContatoComNome(comp.contato_comercial.nome);
    setFormContatoComEmail(comp.contato_comercial.email);
    setFormContatoComTelefone(comp.contato_comercial.telefone);
    setFormContatoComCargo(comp.contato_comercial.cargo || 'Comprador');
    setFormContatoTecNome(comp.contato_tecnico?.nome || '');
    setFormContatoTecEmail(comp.contato_tecnico?.email || '');
    setFormContatoTecTelefone(comp.contato_tecnico?.telefone || '');
    setFormContatoTecCargo(comp.contato_tecnico?.cargo || 'Engenheiro');
    setFormObservacoes(comp.observacoes || '');
    setCnpjFeedback(null);
    setIsModalOpen(true);
  };

  const handleConsultCnpj = async () => {
    const clean = formCnpj.replace(/\D/g, '');
    if (clean.length !== 14) {
      setCnpjFeedback('O CNPJ deve conter 14 dígitos numéricos.');
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
          setFormCep(data.endereco.cep || '');
        }
        if (data.contato?.telefone && !formContatoComTelefone) {
          setFormContatoComTelefone(data.contato.telefone);
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

    const newComp: CompanyPartner = {
      id: editingCompany ? editingCompany.id : `comp-${Date.now()}`,
      cnpj: formCnpj.replace(/\D/g, '') || formCnpj,
      razao_social: formRazaoSocial,
      nome_fantasia: formNomeFantasia || formRazaoSocial,
      inscricao_estadual: formInscricaoEstadual,
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
              Gestão de Parceiros Comerciais (Empresas PJ)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cadastro unificado de Clientes e Fornecedores com consulta e preenchimento automático via Receita Federal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/60 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Empresa PJ</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Razão Social, CNPJ, Cidade ou Segmento..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-stretch md:self-auto overflow-x-auto">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtrar:
          </span>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'cliente'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Apenas Clientes
          </button>
          <button
            type="button"
            onClick={() => setFilterType('fornecedor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'fornecedor'
                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Apenas Fornecedores
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ambos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'ambos'
                ? 'bg-purple-950 text-purple-300 border border-purple-700'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Cliente & Fornecedor
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCompanies.map((comp) => (
          <div
            key={comp.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            {/* Header com Razão Social e Badges */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-white leading-tight">
                    {comp.razao_social}
                  </h3>
                  {comp.nome_fantasia && comp.nome_fantasia !== comp.razao_social && (
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      {comp.nome_fantasia}
                    </div>
                  )}
                </div>

                {/* Badges de Tipo */}
                <div className="flex items-center gap-1.5 shrink-0">
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

              {/* Informações Fiscais & Segmento */}
              <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">CNPJ:</span>
                  <span className="font-mono text-slate-200 font-bold">{comp.cnpj}</span>
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
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Inscr. Estadual:</span>
                  <span className="font-mono text-slate-300">{comp.inscricao_estadual || 'Isento / Não inf.'}</span>
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
                  <Phone className="w-3 h-3 text-slate-500 shrink-0" /> {comp.contato_comercial.telefone}
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
                    <Phone className="w-3 h-3 text-slate-500 shrink-0" /> {comp.contato_tecnico.telefone}
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
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Nenhuma empresa encontrada</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Não encontramos nenhum parceiro com os filtros selecionados. Cadastre uma nova empresa acima ou ajuste os termos da busca.
          </p>
        </div>
      )}

      {/* =========================================================================
          MODAL DE CADASTRO / EDIÇÃO DE EMPRESA PJ
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  {editingCompany ? 'Editar Empresa Parceira' : 'Cadastrar Nova Empresa PJ'}
                </h3>
                <p className="text-xs text-slate-400">
                  Preencha o CNPJ para carregar os dados cadastrais diretamente da Receita Federal.
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
              {/* Classificação: Cliente e/ou Fornecedor */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase block">
                  Classificação da Pessoa Jurídica:
                </span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                    <input
                      type="checkbox"
                      checked={formIsCliente}
                      onChange={(e) => setFormIsCliente(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                    />
                    <span>[✓] Cliente (Comprador de Fixadores)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                    <input
                      type="checkbox"
                      checked={formIsFornecedor}
                      onChange={(e) => setFormIsFornecedor(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                    />
                    <span>[✓] Fornecedor (Aços, Barras, Tratamentos ou Insumos)</span>
                  </label>
                </div>
              </div>

              {/* CNPJ e Botão Buscar na Receita */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                  CNPJ da Empresa:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formCnpj}
                    onChange={(e) => setFormCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleConsultCnpj}
                    disabled={isSearchingCnpj}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-950/60 transition-all disabled:opacity-50"
                  >
                    {isSearchingCnpj ? (
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Consultar Receita</span>
                  </button>
                </div>
                {cnpjFeedback && (
                  <p className="text-[11px] font-mono text-cyan-400 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    {cnpjFeedback}
                  </p>
                )}
              </div>

              {/* Razão Social e Nome Fantasia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Razão Social:
                  </label>
                  <input
                    type="text"
                    required
                    value={formRazaoSocial}
                    onChange={(e) => setFormRazaoSocial(e.target.value)}
                    placeholder="Nome empresarial completo"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Nome Fantasia:
                  </label>
                  <input
                    type="text"
                    value={formNomeFantasia}
                    onChange={(e) => setFormNomeFantasia(e.target.value)}
                    placeholder="Nome comercial da unidade"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Inscrição Estadual e Segmento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Inscrição Estadual (IE):
                  </label>
                  <input
                    type="text"
                    value={formInscricaoEstadual}
                    onChange={(e) => setFormInscricaoEstadual(e.target.value)}
                    placeholder="Ex: 062.345.890-0012 ou ISENTO"
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
                  <div className="sm:col-span-2">
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
                    placeholder="Nome do Comprador"
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
                    onChange={(e) => setFormContatoComTelefone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
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
                    onChange={(e) => setFormContatoTecTelefone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
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
                  {editingCompany ? 'Salvar Alterações' : 'Concluir Cadastro PJ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
