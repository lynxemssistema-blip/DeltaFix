// src/components/admin/MultiCompanyManagement.tsx - Gestão de Unidades e Multi-Empresa (Matriz e Filiais)
'use client';

import React, { useState, useEffect } from 'react';
import { OrganizationEntity } from '@/lib/types/commercial';
import {
  getSavedOrganizations,
  saveOrganization
} from '@/lib/services/commercialService';
import {
  Building,
  Plus,
  Edit,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  FileCheck,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

interface MultiCompanyManagementProps {
  currentOrgId: string;
  onSelectOrg: (orgId: string) => void;
}

export function MultiCompanyManagement({
  currentOrgId,
  onSelectOrg
}: MultiCompanyManagementProps) {
  const [organizations, setOrganizations] = useState<OrganizationEntity[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationEntity | null>(null);

  // Form fields
  const [formCodigo, setFormCodigo] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [formTipo, setFormTipo] = useState<'matriz' | 'filial'>('filial');
  const [formCidade, setFormCidade] = useState('');
  const [formUf, setFormUf] = useState('MG');
  const [formEndereco, setFormEndereco] = useState('');
  const [formInscricaoEstadual, setFormInscricaoEstadual] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formEmailFiscal, setFormEmailFiscal] = useState('');

  useEffect(() => {
    setOrganizations(getSavedOrganizations());
  }, []);

  const handleOpenNew = () => {
    setEditingOrg(null);
    setFormCodigo(`DELTA-0${organizations.length + 1}`);
    setFormNome('');
    setFormCnpj('');
    setFormTipo('filial');
    setFormCidade('');
    setFormUf('MG');
    setFormEndereco('');
    setFormInscricaoEstadual('');
    setFormTelefone('');
    setFormEmailFiscal('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (org: OrganizationEntity) => {
    setEditingOrg(org);
    setFormCodigo(org.codigo);
    setFormNome(org.nome);
    setFormCnpj(org.cnpj);
    setFormTipo(org.tipo);
    setFormCidade(org.cidade);
    setFormUf(org.uf);
    setFormEndereco(org.endereco_completo);
    setFormInscricaoEstadual(org.inscricao_estadual);
    setFormTelefone(org.telefone);
    setFormEmailFiscal(org.email_fiscal);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrg: OrganizationEntity = {
      id: editingOrg ? editingOrg.id : `org-${Date.now()}`,
      codigo: formCodigo,
      nome: formNome,
      cnpj: formCnpj,
      tipo: formTipo,
      cidade: formCidade,
      uf: formUf,
      endereco_completo: formEndereco,
      inscricao_estadual: formInscricaoEstadual,
      ativa: true,
      telefone: formTelefone,
      email_fiscal: formEmailFiscal
    };

    const updated = saveOrganization(newOrg);
    setOrganizations(updated);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Building className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-wide">
              Gestão de Unidades & Multi-Empresa (Delta Fixadores)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre a Matriz e Filiais industriais com CNPJs e inscrições estaduais independentes para operações fiscais e de produção.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/60 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Unidade / Filial</span>
          </button>
        </div>
      </div>

      {/* Grid ou Tabela de Unidades */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {organizations.map((org) => {
          const isSelected = org.id === currentOrgId;

          return (
            <div
              key={org.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        org.tipo === 'matriz'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      }`}
                    >
                      {org.tipo}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      {org.codigo}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> EM OPERAÇÃO
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-white mt-2 leading-tight">
                  {org.nome}
                </h3>

                <div className="space-y-1.5 mt-3 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-mono text-[10px] uppercase">CNPJ:</span>
                    <span className="font-mono text-slate-200 font-bold">{org.cnpj}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-mono text-[10px] uppercase">Inscr. Estadual:</span>
                    <span className="font-mono text-slate-300">{org.inscricao_estadual}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-mono text-[10px] uppercase">Cidade / UF:</span>
                    <span className="text-cyan-400 font-semibold">
                      {org.cidade} - {org.uf}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{org.endereco_completo}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{org.telefone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{org.email_fiscal}</span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectOrg(org.id)}
                  disabled={isSelected}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-slate-500 cursor-default'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900'
                  }`}
                >
                  {isSelected ? 'Unidade Selecionada' : 'Alternar para esta Unidade'}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(org)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  title="Editar dados da unidade"
                >
                  <Edit className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      ) : (
        /* VISUALIZAÇÃO EM TABELA DE UNIDADES MULTI-EMPRESA */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-3 px-4">Código / Tipo</th>
                  <th className="py-3 px-4">Nome da Unidade</th>
                  <th className="py-3 px-4">CNPJ & IE</th>
                  <th className="py-3 px-4">Cidade / UF</th>
                  <th className="py-3 px-4">Endereço</th>
                  <th className="py-3 px-4">Contato Fiscal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {organizations.map((org) => {
                  const isSelected = org.id === currentOrgId;

                  return (
                    <tr key={org.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Código & Tipo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-white block">{org.codigo}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase border ${
                            org.tipo === 'matriz'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          }`}
                        >
                          {org.tipo}
                        </span>
                      </td>

                      {/* Nome */}
                      <td className="py-3 px-4 font-bold text-white">
                        {org.nome}
                      </td>

                      {/* CNPJ & IE */}
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        <span className="text-slate-200 font-bold block">{org.cnpj}</span>
                        <span className="text-[10px] text-slate-500">IE: {org.inscricao_estadual}</span>
                      </td>

                      {/* Cidade / UF */}
                      <td className="py-3 px-4 text-cyan-400 font-medium whitespace-nowrap">
                        {org.cidade} - {org.uf}
                      </td>

                      {/* Endereço */}
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {org.endereco_completo}
                      </td>

                      {/* Contato Fiscal */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-300">{org.telefone}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{org.email_fiscal}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> ATIVA
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Disponível</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectOrg(org.id)}
                            disabled={isSelected}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                              isSelected
                                ? 'bg-slate-800 text-slate-500 cursor-default'
                                : 'bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900'
                            }`}
                          >
                            {isSelected ? 'Selecionada' : 'Alternar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(org)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400"
                            title="Editar unidade"
                          >
                            <Edit className="w-3.5 h-3.5" />
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

      {/* Modal Nova / Editar Unidade */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                {editingOrg ? 'Editar Unidade / Filial' : 'Nova Unidade Industrial'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Código Interno:
                  </label>
                  <input
                    type="text"
                    required
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Tipo de Unidade:
                  </label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as 'matriz' | 'filial')}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                  >
                    <option value="matriz">Matriz Corporativa</option>
                    <option value="filial">Filial Industrial / CD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Nome da Unidade:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Delta Fixadores Filial Açúcar & Álcool (Sertãozinho)"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    CNPJ da Unidade:
                  </label>
                  <input
                    type="text"
                    required
                    value={formCnpj}
                    onChange={(e) => setFormCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Inscrição Estadual (IE):
                  </label>
                  <input
                    type="text"
                    value={formInscricaoEstadual}
                    onChange={(e) => setFormInscricaoEstadual(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Cidade:
                  </label>
                  <input
                    type="text"
                    required
                    value={formCidade}
                    onChange={(e) => setFormCidade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    UF:
                  </label>
                  <input
                    type="text"
                    required
                    value={formUf}
                    onChange={(e) => setFormUf(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Endereço Completo:
                </label>
                <input
                  type="text"
                  required
                  value={formEndereco}
                  onChange={(e) => setFormEndereco(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Telefone de Contato:
                  </label>
                  <input
                    type="text"
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    E-mail Fiscal / NFe:
                  </label>
                  <input
                    type="email"
                    value={formEmailFiscal}
                    onChange={(e) => setFormEmailFiscal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold uppercase tracking-wider"
                >
                  Salvar Unidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
