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
  tipo_pessoa?: 'PJ' | 'PF';
  cnpj: string; // Guarda CPF ou CNPJ formatado
  documento?: string;
  rg?: string;
  razao_social: string; // Razão Social (PJ) ou Nome Completo (PF)
  nome_fantasia?: string;
  inscricao_estadual?: string;
  logo_url?: string; // URL ou Data URL do Logotipo/Foto
  instagram?: string; // Ex: @parafusosdelta ou link do perfil
  linkedin?: string; // Link do LinkedIn da empresa ou perfil profissional
  website?: string; // Website corporativo ou e-commerce
  celular_notificacoes?: string; // Número de celular/WhatsApp que recebe mensagens automáticas do sistema
  receber_notificacoes_whatsapp?: boolean; // Flag de envio automático ativado
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

export interface RawMaterialItem {
  id: string;
  codigo: string; // Ex: 'MP-01', 'ACO-1020'
  tipo_material: 'Barra de aço redonda' | 'Barra sextavada' | 'Barra chata' | 'Tubo mecânico' | 'Outro';
  especificacao_aco: string; // Ex: 'SAE 1020', 'SAE 1045', 'SAE 4340', 'SAE 8640', 'SAE 8220', 'SAE 4140', 'AISI 304', 'AISI 310', 'AISI 320', 'AISI 316', 'AISI 420', 'AISI 321'
  cor_primaria_nome: string;
  cor_primaria_hex: string;
  is_bicolor: boolean;
  cor_secundaria_nome?: string;
  cor_secundaria_hex?: string;
  diametros_disponiveis?: string[];
  comprimento_padrao_mm: number; // 6000
  densidade_g_cm3: number; // 7.85
  fornecedor_homologado?: string;
  observacoes?: string;
}
