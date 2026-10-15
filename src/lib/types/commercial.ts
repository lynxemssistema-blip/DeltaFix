// src/lib/types/commercial.ts - Modelos de Dados Comerciais, Multi-Empresa e Aprovação DeltaFix

export type SegmentoIndustrial =
  | 'Mineração'
  | 'Siderurgia & Metalurgia'
  | 'Óleo, Gás & Petroquímica'
  | 'Papel & Celulose'
  | 'Automotivo & Autopeças'
  | 'Construção Pesada & Infraestrutura'
  | 'Energia & Eólica'
  | 'Agronegócio & Maquinário'
  | 'Manutenção Industrial & Caldeiraria'
  | 'Outros';

export interface CompanyPartner {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  is_cliente: boolean;
  is_fornecedor: boolean;
  segmento: SegmentoIndustrial;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  contato_comercial: {
    nome: string;
    email: string;
    telefone: string;
    cargo?: string;
  };
  contato_tecnico?: {
    nome: string;
    email: string;
    telefone: string;
    cargo?: string;
  };
  observacoes?: string;
  created_at: string;
  updated_at?: string;
}

export type OrderStatus =
  | 'cotacao_enviada'
  | 'aprovado_cliente'
  | 'em_fabricacao'
  | 'pronto_cq'
  | 'faturado_expedido';

export interface OrderItem {
  id: string;
  tipo_item: 'padrao' | 'especial_desenho';
  descricao: string;
  standard_code?: string;
  bitola: string;
  comprimento?: number;
  material: string;
  classe: string;
  tratamento?: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  drawing_code?: string;
}

export interface SalesOrderQuote {
  id: string;
  codigo_documento: string; // Ex: COT-2026-0042 ou PED-2026-0018
  tipo: 'cotacao' | 'pedido';
  status: OrderStatus;
  company_id: string;
  company_name: string;
  cnpj: string;
  data_abertura: string;
  data_previsao?: string;
  prazo_dias: number;
  condicao_pagamento: string;
  itens: OrderItem[];
  valor_total: number;
  op_numero?: string;
  responsavel_comercial: string;
  observacoes?: string;
}

export interface OrganizationEntity {
  id: string;
  codigo: string;
  nome: string;
  cnpj: string;
  tipo: 'matriz' | 'filial';
  cidade: string;
  uf: string;
  endereco_completo: string;
  inscricao_estadual: string;
  ativa: boolean;
  telefone: string;
  email_fiscal: string;
}

export interface UserApprovalRequest {
  id: string;
  user_id?: string;
  nome: string;
  email: string;
  empresa_nome: string;
  empresa_cnpj: string;
  perfil_solicitado: 'cliente_comprador' | 'engenharia_especificador' | 'fornecedor_parceiro';
  perfil_atribuido?: 'master' | 'engenharia' | 'comercial' | 'pcp_operador' | 'cliente';
  status: 'pendente' | 'aprovado' | 'rejeitado';
  data_solicitacao: string;
  data_decisao?: string;
  decidido_por?: string;
  observacoes?: string;
}
