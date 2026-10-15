// src/lib/services/commercialService.ts - Serviço de Persistência e Operações Comerciais & Multi-Empresa
import {
  CompanyPartner,
  SalesOrderQuote,
  OrganizationEntity,
  UserApprovalRequest,
  RawMaterialItem
} from '../types/commercial';

// Dados iniciais padrão de empresas parceiras industriais
export const DEFAULT_COMPANIES: CompanyPartner[] = [
  {
    id: 'comp-01',
    cnpj: '33592510000154',
    razao_social: 'VALE S.A.',
    nome_fantasia: 'Complexo Mineração Minas Gerais',
    inscricao_estadual: '062.345.890-0012',
    is_cliente: true,
    is_fornecedor: false,
    segmento: 'Mineração',
    endereco: {
      logradouro: 'Rodovia BR-040, KM 540',
      numero: 'S/N',
      bairro: 'Zona Rural / Mina de Águas Claras',
      cidade: 'Nova Lima',
      uf: 'MG',
      cep: '34000-000'
    },
    contato_comercial: {
      nome: 'Carlos Eduardo Nogueira',
      email: 'carlos.nogueira@vale.com',
      telefone: '(31) 3348-1200',
      cargo: 'Gerente de Suprimentos MRO'
    },
    contato_tecnico: {
      nome: 'Eng. Marcelo Queiroz',
      email: 'marcelo.queiroz@vale.com',
      telefone: '(31) 98744-5512',
      cargo: 'Engenheiro de Confiabilidade Mecânica'
    },
    logo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=200&q=80',
    instagram: '@valeglobal',
    linkedin: 'https://www.linkedin.com/company/vale',
    website: 'https://www.vale.com',
    celular_notificacoes: '(31) 98744-5512',
    receber_notificacoes_whatsapp: true,
    observacoes: 'Fixadores especiais ASTM A325 e A193 B7 para britadores e transportadores de correia.',
    created_at: '2026-01-10T08:30:00Z'
  },
  {
    id: 'comp-02',
    cnpj: '60894730000105',
    razao_social: 'USINAS SIDERURGICAS DE MINAS GERAIS S.A. - USIMINAS',
    nome_fantasia: 'Usiminas Ipatinga',
    inscricao_estadual: '313.123.456-0089',
    is_cliente: true,
    is_fornecedor: true,
    segmento: 'Siderurgia & Metalurgia',
    endereco: {
      logradouro: 'Avenida Pedro Linhares Gomes',
      numero: '5431',
      bairro: 'Usiminas',
      cidade: 'Ipatinga',
      uf: 'MG',
      cep: '35160-900'
    },
    contato_comercial: {
      nome: 'Juliana Mendes Rezende',
      email: 'juliana.rezende@usiminas.com',
      telefone: '(31) 3829-2000',
      cargo: 'Especialista em Compras de Fixadores'
    },
    contato_tecnico: {
      nome: 'Eng. Ricardo Silveira',
      email: 'ricardo.silveira@usiminas.com',
      telefone: '(31) 99123-4567',
      cargo: 'Engenheiro Chefe de Laminação'
    },
    logo_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=200&q=80',
    instagram: '@usiminasoficial',
    linkedin: 'https://www.linkedin.com/company/usiminas',
    website: 'https://www.usiminas.com',
    celular_notificacoes: '(31) 99123-4567',
    receber_notificacoes_whatsapp: true,
    observacoes: 'Cliente e fornecedor de tarugos laminados e barras redondas trefiladas SAE 4140.',
    created_at: '2026-02-15T10:15:00Z'
  },
  {
    id: 'comp-03',
    cnpj: '33000167000101',
    razao_social: 'PETROLEO BRASILEIRO S.A. - PETROBRAS',
    nome_fantasia: 'Petrobras Regap',
    inscricao_estadual: '062.888.999-0033',
    is_cliente: true,
    is_fornecedor: false,
    segmento: 'Óleo, Gás & Petroquímica',
    endereco: {
      logradouro: 'Rodovia Fernão Dias, KM 427',
      numero: 'S/N',
      bairro: 'Distrito Industrial',
      cidade: 'Betim',
      uf: 'MG',
      cep: '32530-000'
    },
    contato_comercial: {
      nome: 'Fernando Alencar',
      email: 'fernando.alencar@petrobras.com.br',
      telefone: '(31) 3529-5000',
      cargo: 'Comprador Técnico Offshore/Refinaria'
    },
    contato_tecnico: {
      nome: 'Eng. Rodrigo Bastos',
      email: 'rodrigo.bastos@petrobras.com.br',
      telefone: '(31) 98455-1122',
      cargo: 'Inspetor de Equipamentos Estáticos'
    },
    observacoes: 'Exigência mandatória de Ensaio de Ultrassom, PMI e Certificado 3.1 conforme EN 10204.',
    created_at: '2026-03-01T14:00:00Z'
  },
  {
    id: 'comp-04',
    cnpj: '00394460005887',
    razao_social: 'GERDAU AÇOMINAS S.A.',
    nome_fantasia: 'Gerdau Usina Ouro Branco',
    inscricao_estadual: '459.777.888-0050',
    is_cliente: false,
    is_fornecedor: true,
    segmento: 'Siderurgia & Metalurgia',
    endereco: {
      logradouro: 'Rodovia MG-443, KM 07',
      numero: 'S/N',
      bairro: 'Fazenda da Varginha',
      cidade: 'Ouro Branco',
      uf: 'MG',
      cep: '36420-000'
    },
    contato_comercial: {
      nome: 'Thiago Valadares',
      email: 'thiago.valadares@gerdau.com',
      telefone: '(31) 3749-1111',
      cargo: 'Executivo de Vendas Aços Especiais'
    },
    observacoes: 'Fornecedor certificado ISO 9001 de barras comerciais de 6 metros em SAE 4140, 4340 e B7.',
    created_at: '2026-01-05T09:00:00Z'
  }
];

// Dados padrão de pedidos industriais e pipeline CRM
export const DEFAULT_ORDERS: SalesOrderQuote[] = [
  {
    id: 'ord-01',
    codigo_documento: 'COT-2026-0089',
    tipo: 'cotacao',
    status: 'cotacao_enviada',
    company_id: 'comp-01',
    company_name: 'VALE S.A.',
    cnpj: '33592510000154',
    data_abertura: '2026-10-12',
    data_previsao: '2026-10-28',
    prazo_dias: 15,
    condicao_pagamento: '45 DDL',
    responsavel_comercial: 'Edson Manoel',
    valor_total: 48500.0,
    observacoes: 'Cotação para manutenção programada do britador primário Carajás.',
    itens: [
      {
        id: 'item-01',
        tipo_item: 'padrao',
        descricao: 'Parafuso Sextavado ASTM A325 Ø 1" x 6" UNC (P=8 TPI) c/ Porca 2H',
        standard_code: 'ASTM A325',
        bitola: '1"',
        comprimento: 152.4,
        material: 'Aço Liga Temperado e Revenido',
        classe: 'A325 Tipo 1',
        tratamento: 'Galvanizado a Fogo (HDG)',
        quantidade: 850,
        preco_unitario: 42.5,
        preco_total: 36125.0
      },
      {
        id: 'item-02',
        tipo_item: 'especial_desenho',
        descricao: 'Prisioneiro Especial B7 com Espigão Reduzido p/ Flange M36 x 320mm',
        standard_code: 'ASTM A193 B7',
        bitola: 'M36',
        comprimento: 320,
        material: 'SAE 4140 B7',
        classe: 'Grade B7',
        tratamento: 'Fosfatizado e Oleado',
        quantidade: 120,
        preco_unitario: 103.12,
        preco_total: 12375.0,
        drawing_code: 'DES-VALE-2026-FL01'
      }
    ]
  },
  {
    id: 'ord-02',
    codigo_documento: 'PED-2026-0044',
    tipo: 'pedido',
    status: 'aprovado_cliente',
    company_id: 'comp-02',
    company_name: 'USIMINAS IPATINGA',
    cnpj: '60894730000105',
    data_abertura: '2026-10-08',
    data_previsao: '2026-10-24',
    prazo_dias: 12,
    condicao_pagamento: '30 DDL',
    responsavel_comercial: 'Edson Manoel',
    valor_total: 72400.0,
    observacoes: 'Aprovado via Pedido de Compra USIMINAS Nº 450099812.',
    itens: [
      {
        id: 'item-03',
        tipo_item: 'padrao',
        descricao: 'Parafuso Cabeça Sextavada DIN 931 M30 x 200mm Classe 10.9',
        standard_code: 'DIN 931',
        bitola: 'M30',
        comprimento: 200,
        material: 'Aço Liga SAE 4140',
        classe: '10.9',
        tratamento: 'Geomet 500 Plus',
        quantidade: 400,
        preco_unitario: 181.0,
        preco_total: 72400.0
      }
    ]
  },
  {
    id: 'ord-03',
    codigo_documento: 'PED-2026-0039',
    tipo: 'pedido',
    status: 'em_fabricacao',
    company_id: 'comp-03',
    company_name: 'PETROBRAS REGAP',
    cnpj: '33000167000101',
    data_abertura: '2026-10-02',
    data_previsao: '2026-10-20',
    prazo_dias: 18,
    condicao_pagamento: '60 DDL',
    op_numero: 'OP-2026-0182',
    responsavel_comercial: 'Edson Manoel',
    valor_total: 115000.0,
    observacoes: 'Em produção na linha de laminação e corte CNC. Inspetor externo Petrobras agendado.',
    itens: [
      {
        id: 'item-04',
        tipo_item: 'padrao',
        descricao: 'Estojo ASTM A193 B7 1.1/4" x 450mm com 2 Porcas Pesadas A194 2H',
        standard_code: 'ASTM A193 B7',
        bitola: '1.1/4"',
        comprimento: 450,
        material: 'SAE 4140 Beneficiado',
        classe: 'B7 / 2H',
        tratamento: 'Xylan 1070 PTFE Azul',
        quantidade: 500,
        preco_unitario: 230.0,
        preco_total: 115000.0
      }
    ]
  },
  {
    id: 'ord-04',
    codigo_documento: 'PED-2026-0035',
    tipo: 'pedido',
    status: 'pronto_cq',
    company_id: 'comp-01',
    company_name: 'VALE S.A.',
    cnpj: '33592510000154',
    data_abertura: '2026-09-25',
    data_previsao: '2026-10-16',
    prazo_dias: 14,
    condicao_pagamento: '45 DDL',
    op_numero: 'OP-2026-0165',
    responsavel_comercial: 'Edson Manoel',
    valor_total: 38200.0,
    observacoes: 'Liberado pelo Controle de Qualidade Delta. Certificado 3.1 gerado e anexado.',
    itens: [
      {
        id: 'item-05',
        tipo_item: 'padrao',
        descricao: 'Parafuso Allen Cabeça Cilíndrica DIN 912 M24 x 140mm Classe 12.9',
        standard_code: 'DIN 912',
        bitola: 'M24',
        comprimento: 140,
        material: 'Aço Liga Especial',
        classe: '12.9',
        tratamento: 'Oxidado Negro c/ Óleo Protetivo',
        quantidade: 600,
        preco_unitario: 63.66,
        preco_total: 38200.0
      }
    ]
  },
  {
    id: 'ord-05',
    codigo_documento: 'PED-2026-0028',
    tipo: 'pedido',
    status: 'faturado_expedido',
    company_id: 'comp-02',
    company_name: 'USIMINAS IPATINGA',
    cnpj: '60894730000105',
    data_abertura: '2026-09-15',
    data_previsao: '2026-10-05',
    prazo_dias: 10,
    condicao_pagamento: '30 DDL',
    op_numero: 'OP-2026-0140',
    responsavel_comercial: 'Edson Manoel',
    valor_total: 94800.0,
    observacoes: 'Expedido via Transportadora Braspress com NF-e 45210 e romaneio por lote.',
    itens: [
      {
        id: 'item-06',
        tipo_item: 'especial_desenho',
        descricao: 'Parafuso Especial de Cabeça Quadrada para Guias de Laminação M42 x 280mm',
        standard_code: 'Especial Sob Desenho',
        bitola: 'M42',
        comprimento: 280,
        material: 'Aço Ferramenta WNr 1.2379',
        classe: 'Especial Tratado',
        tratamento: 'Têmpera por Indução + Nitretação',
        quantidade: 150,
        preco_unitario: 632.0,
        preco_total: 94800.0,
        drawing_code: 'DES-USI-LAM-004'
      }
    ]
  }
];

// Dados padrão Multi-Empresa (Entidades do Grupo Delta)
export const DEFAULT_ORGANIZATIONS: OrganizationEntity[] = [
  {
    id: 'org-01',
    codigo: 'DELTA-01',
    nome: 'Delta Parafusos Especiais Ltda (Matriz Contagem)',
    cnpj: '18.452.912/0001-44',
    tipo: 'matriz',
    cidade: 'Contagem',
    uf: 'MG',
    endereco_completo: 'Avenida General David Sarnoff, 3200 - Cidade Industrial, Contagem - MG',
    inscricao_estadual: '186.452.880.0019',
    ativa: true,
    telefone: '(31) 3352-8000',
    email_fiscal: 'fiscal@parafusosdelta.com.br'
  },
  {
    id: 'org-02',
    codigo: 'DELTA-02',
    nome: 'Delta Fixadores Filial Açúcar & Álcool (Sertãozinho)',
    cnpj: '18.452.912/0002-25',
    tipo: 'filial',
    cidade: 'Sertãozinho',
    uf: 'SP',
    endereco_completo: 'Distrito Industrial II, Rua das Indústrias, 450 - Sertãozinho - SP',
    inscricao_estadual: '654.120.999.110',
    ativa: true,
    telefone: '(16) 3946-7700',
    email_fiscal: 'filial.sp@parafusosdelta.com.br'
  },
  {
    id: 'org-03',
    codigo: 'DELTA-03',
    nome: 'Delta Offshore & Óleo e Gás (Macaé)',
    cnpj: '18.452.912/0003-06',
    tipo: 'filial',
    cidade: 'Macaé',
    uf: 'RJ',
    endereco_completo: 'Parque de Tubos, Rodovia Amaral Peixoto KM 168 - Macaé - RJ',
    inscricao_estadual: '87.654.321',
    ativa: true,
    telefone: '(22) 2796-5500',
    email_fiscal: 'filial.macae@parafusosdelta.com.br'
  }
];

// Dados padrão de solicitações de aprovação de novos usuários
export const DEFAULT_APPROVALS: UserApprovalRequest[] = [
  {
    id: 'appr-01',
    nome: 'Rodrigo Antunes Silva',
    email: 'rodrigo.antunes@anglogold.com',
    empresa_nome: 'AngloGold Ashanti Brasil Mineração',
    empresa_cnpj: '17231456000188',
    perfil_solicitado: 'cliente_comprador',
    status: 'pendente',
    data_solicitacao: '2026-10-14T19:40:00Z',
    observacoes: 'Solicitação de acesso para cotação direta de prisioneiros e parafusos de moinho.'
  },
  {
    id: 'appr-02',
    nome: 'Engª Camila Barbosa',
    email: 'camila.barbosa@arcelormittal.com.br',
    empresa_nome: 'ArcelorMittal Tubarão',
    empresa_cnpj: '27489560000190',
    perfil_solicitado: 'engenharia_especificador',
    status: 'pendente',
    data_solicitacao: '2026-10-15T01:15:00Z',
    observacoes: 'Acesso para parametrização de fixadores para projeto de expansão do alto-forno 3.'
  },
  {
    id: 'appr-03',
    nome: 'Gabriel Toledo',
    email: 'gabriel.toledo@belgo.com.br',
    empresa_nome: 'Belgo Bekaert Arames Ltda',
    empresa_cnpj: '04589230000114',
    perfil_solicitado: 'fornecedor_parceiro',
    status: 'aprovado',
    perfil_atribuido: 'comercial',
    data_solicitacao: '2026-10-10T11:00:00Z',
    data_decisao: '2026-10-10T14:20:00Z',
    decidido_por: 'Edson Manoel (Super Admin)',
    observacoes: 'Fornecedor homologado de rolos de arame SAE 1018 e 10B22.'
  }
];

// Helper functions com persistência no LocalStorage (e sincronização)
export function getSavedCompanies(): CompanyPartner[] {
  if (typeof window === 'undefined') return DEFAULT_COMPANIES;
  try {
    const raw = localStorage.getItem('deltafix_companies');
    if (!raw) {
      localStorage.setItem('deltafix_companies', JSON.stringify(DEFAULT_COMPANIES));
      return DEFAULT_COMPANIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COMPANIES;
  }
}

export function saveCompany(company: CompanyPartner): CompanyPartner[] {
  const list = getSavedCompanies();
  const existingIdx = list.findIndex((c) => c.id === company.id || c.cnpj === company.cnpj);
  let updated: CompanyPartner[];
  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = { ...company, updated_at: new Date().toISOString() };
  } else {
    updated = [company, ...list];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_companies', JSON.stringify(updated));
  }
  return updated;
}

export function deleteCompany(id: string): CompanyPartner[] {
  const list = getSavedCompanies();
  const filtered = list.filter((c) => c.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_companies', JSON.stringify(filtered));
  }
  return filtered;
}

export function getSavedOrders(): SalesOrderQuote[] {
  if (typeof window === 'undefined') return DEFAULT_ORDERS;
  try {
    const raw = localStorage.getItem('deltafix_orders');
    if (!raw) {
      localStorage.setItem('deltafix_orders', JSON.stringify(DEFAULT_ORDERS));
      return DEFAULT_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ORDERS;
  }
}

export function saveOrder(order: SalesOrderQuote): SalesOrderQuote[] {
  const list = getSavedOrders();
  const existingIdx = list.findIndex((o) => o.id === order.id);
  let updated: SalesOrderQuote[];
  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = order;
  } else {
    updated = [order, ...list];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_orders', JSON.stringify(updated));
  }
  return updated;
}

export function updateOrderStatus(orderId: string, newStatus: SalesOrderQuote['status']): SalesOrderQuote[] {
  const list = getSavedOrders();
  const updated = list.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord));
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_orders', JSON.stringify(updated));
  }
  return updated;
}

export function getSavedOrganizations(): OrganizationEntity[] {
  if (typeof window === 'undefined') return DEFAULT_ORGANIZATIONS;
  try {
    const raw = localStorage.getItem('deltafix_organizations');
    if (!raw) {
      localStorage.setItem('deltafix_organizations', JSON.stringify(DEFAULT_ORGANIZATIONS));
      return DEFAULT_ORGANIZATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ORGANIZATIONS;
  }
}

export function saveOrganization(org: OrganizationEntity): OrganizationEntity[] {
  const list = getSavedOrganizations();
  const idx = list.findIndex((o) => o.id === org.id);
  let updated: OrganizationEntity[];
  if (idx >= 0) {
    updated = [...list];
    updated[idx] = org;
  } else {
    updated = [...list, org];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_organizations', JSON.stringify(updated));
  }
  return updated;
}

export function getSavedApprovals(): UserApprovalRequest[] {
  if (typeof window === 'undefined') return DEFAULT_APPROVALS;
  try {
    const raw = localStorage.getItem('deltafix_user_approvals');
    if (!raw) {
      localStorage.setItem('deltafix_user_approvals', JSON.stringify(DEFAULT_APPROVALS));
      return DEFAULT_APPROVALS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_APPROVALS;
  }
}

export function addApprovalRequest(req: Omit<UserApprovalRequest, 'id' | 'status' | 'data_solicitacao'>): UserApprovalRequest[] {
  const list = getSavedApprovals();
  const newReq: UserApprovalRequest = {
    ...req,
    id: `appr-${Date.now()}`,
    status: 'pendente',
    data_solicitacao: new Date().toISOString()
  };
  const updated = [newReq, ...list];
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_user_approvals', JSON.stringify(updated));
  }
  return updated;
}

export function decideApprovalRequest(
  id: string,
  decision: 'aprovado' | 'rejeitado' | 'cancelado' | 'pendente',
  decidedBy: string,
  assignedRole?: UserApprovalRequest['perfil_atribuido']
): UserApprovalRequest[] {
  const list = getSavedApprovals();
  const updated = list.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status: decision,
        decidido_por: decidedBy,
        data_decisao: new Date().toISOString(),
        perfil_atribuido: assignedRole || item.perfil_atribuido
      };
    }
    return item;
  });
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_user_approvals', JSON.stringify(updated));
  }
  return updated;
}

export function updateApprovalUser(
  id: string,
  updates: Partial<UserApprovalRequest>
): UserApprovalRequest[] {
  const list = getSavedApprovals();
  const updated = list.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...updates
      };
    }
    return item;
  });
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_user_approvals', JSON.stringify(updated));
  }
  return updated;
}

export function deleteApprovalRequest(id: string): UserApprovalRequest[] {
  const list = getSavedApprovals();
  const updated = list.filter((item) => item.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_user_approvals', JSON.stringify(updated));
  }
  return updated;
}

// =========================================================================
// CODIFICAÇÃO OFICIAL DE AÇO & MATÉRIAS-PRIMAS (PONTAS PINTADAS DA FÁBRICA)
// Conforme placa de identificação física do almoxarifado de barras
// =========================================================================
export const DEFAULT_RAW_MATERIALS: RawMaterialItem[] = [
  {
    id: 'mat-01',
    codigo: 'ACO-1020',
    tipo_material: 'Barra de aço redonda',
    especificacao_aco: 'SAE 1020',
    cor_primaria_nome: 'Branco',
    cor_primaria_hex: '#ffffff',
    is_bicolor: false,
    diametros_disponiveis: ['1/4"', '5/16"', '3/8"', '1/2"', '5/8"', '3/4"', '7/8"', '1"'],
    comprimento_padrao_mm: 6000,
    densidade_g_cm3: 7.85,
    fornecedor_homologado: 'Gerdau Usina Ouro Branco',
    observacoes: 'Aço baixo carbono para fixadores de classe 4.6 / 4.8 e peças estruturais leves.'
  },
  {
    id: 'mat-02',
    codigo: 'ACO-1045',
    tipo_material: 'Barra de aço redonda',
    especificacao_aco: 'SAE 1045',
    cor_primaria_nome: 'Vermelho',
    cor_primaria_hex: '#dc2626',
    is_bicolor: false,
    diametros_disponiveis: ['3/8"', '1/2"', '5/8"', '3/4"', '7/8"', '1"', '1.1/4"', '1.1/2"'],
    comprimento_padrao_mm: 6000,
    densidade_g_cm3: 7.85,
    fornecedor_homologado: 'Gerdau Usina Ouro Branco',
    observacoes: 'Aço médio carbono para parafusos temperados e revenidos classe 8.8.'
  },
  {
    id: 'mat-03',
    codigo: 'ACO-4340',
    tipo_material: 'Barra de aço redonda',
    especificacao_aco: 'SAE 4340',
    cor_primaria_nome: 'Verde',
    cor_primaria_hex: '#16a34a',
    is_bicolor: true,
    cor_secundaria_nome: 'Vermelho',
    cor_secundaria_hex: '#dc2626',
    diametros_disponiveis: ['1/2"', '5/8"', '3/4"', '1"', '1.1/4"', '1.1/2"', '2"', '2.1/2"'],
    comprimento_padrao_mm: 6000,
    densidade_g_cm3: 7.85,
    fornecedor_homologado: 'Açotécnica / Villares Metals',
    observacoes: 'Aço liga Ni-Cr-Mo de altíssima tenacidade para fixadores severos classe 12.9 e setor eólico.'
  },
  {
    id: 'mat-04',
    codigo: 'ACO-8640',
    tipo_material: 'Barra de aço redonda',
    especificacao_aco: 'SAE 8640',
    cor_primaria_nome: 'Laranja',
    cor_primaria_hex: '#ea580c',
    is_bicolor: true,
    cor_secundaria_nome: 'Vermelho',
    cor_secundaria_hex: '#dc2626',
    diametros_disponiveis: ['1/2"', '5/8"', '3/4"', '7/8"', '1"', '1.1/4"'],
    comprimento_padrao_mm: 6000,
    densidade_g_cm3: 7.85,
    fornecedor_homologado: 'Gerdau Usina Ouro Branco',
    observacoes: 'Aço liga de médio teor para parafusos de cabeça forjada e alta resistência.'
  },
  {
    id: 'mat-05',
    codigo: 'ACO-8220',
    tipo_material: 'Barra de aço redonda',
    especificacao_aco: 'SAE 8220',
    cor_primaria_nome: 'Azul',
    cor_primaria_hex: '#2563eb',
    is_bicolor: true,
    cor_secundaria_nome: 'Amarelo',
    cor_secundaria_hex: '#eab308',
    diametros_disponiveis: ['3/8"', '1/2"', '5/8"', '3/4"', '1"'],
    comprimento_padrao_mm: 6000,
    densidade_g_cm3: 7.85,
    fornecedor_homologado: 'Villares Metals',
    observacoes: 'Aço para cementação com núcleo dúctil e superfície de altíssima dureza.'
  },
  {
    id: 'mat-06',
    codigo: 'ACO-4140',
    tipo_material: 'Barra de aço redonda',
    especificacao_aco: 'SAE 4140',
    cor_primaria_nome: 'Verde Escuro',
    cor_primaria_hex: '#14532d',
    is_bicolor: false,
    diametros_disponiveis: ['1/2"', '5/8"', '3/4"', '7/8"', '1"', '1.1/4"', '1.1/2"', '1.3/4"', '2"'],
    comprimento_padrao_mm: 6000,
    densidade_g_cm3: 7.85,
    fornecedor_homologado: 'Gerdau Usina Ouro Branco',
    observacoes: 'Aço cromo-molibdênio para parafusos ASTM A193 B7 e classe 10.9 de alta responsabilidade.'
  },
  {
    id: 'mat-07',
    codigo: 'INOX-304',
    tipo_material: 'Barra de aço redonda',
    especificacao_aco: 'AISI 304',
    cor_primaria_nome: 'Amarelo',
    cor_primaria_hex: '#eab308',
    is_bicolor: false,
    diametros_disponiveis: ['1/4"', '5/16"', '3/8"', '1/2"', '5/8"', '3/4"', '1"'],
    comprimento_padrao_mm: 6000,
    densidade_g_cm3: 7.93,
    fornecedor_homologado: 'Aperam South America',
    observacoes: 'Aço inoxidável austenítico grau A2-70 com excelente resistência à corrosão.'
  },
  {
    id: 'mat-08',
    codigo: 'INOX-310',
    tipo_material: 'Barra de aço redonda',
    especificacao_aco: 'AISI 310',
    cor_primaria_nome: 'Azul Escuro / Preto',
    cor_primaria_hex: '#0f172a',
    is_bicolor: false,
    diametros_disponiveis: ['1/2"', '5/8"', '3/4"', '1"', '1.1/4"'],
    comprimento_padrao_mm: 6000,
    densidade_g_cm3: 7.98,
    fornecedor_homologado: 'Aperam South America',
    observacoes: 'Aço inoxidável refratário para ambientes térmicos severos e fornos até 1150°C.'
  },
  {
    id: 'mat-09',
    codigo: 'INOX-320',
    tipo_material: 'Barra de aço redonda',
    especificacao_aco: 'AISI 320',
    cor_primaria_nome: 'Branco Neve',
    cor_primaria_hex: '#f8fafc',
    is_bicolor: false,
    diametros_disponiveis: ['1/2"', '5/8"', '3/4"', '1"'],
    comprimento_padrao_mm: 6000,
    densidade_g_cm3: 7.95,
    fornecedor_homologado: 'Aperam / Sandvik',
    observacoes: 'Inox austenítico especial com resistência superior a soluções ácidas.'
  },
  {
    id: 'mat-10',
    codigo: 'INOX-316',
    tipo_material: 'Barra de aço redonda',
    especificacao_aco: 'AISI 316',
    cor_primaria_nome: 'Vermelho Carmesim',
    cor_primaria_hex: '#b91c1c',
    is_bicolor: false,
    diametros_disponiveis: ['1/4"', '3/8"', '1/2"', '5/8"', '3/4"', '7/8"', '1"', '1.1/4"'],
    comprimento_padrao_mm: 6000,
    densidade_g_cm3: 8.0,
    fornecedor_homologado: 'Aperam South America',
    observacoes: 'Aço inox austenítico com molibdênio grau A4-80 para plantas químicas e offshore.'
  },
  {
    id: 'mat-11',
    codigo: 'INOX-420',
    tipo_material: 'Barra de aço redonda',
    especificacao_aco: 'AISI 420',
    cor_primaria_nome: 'Verde Médio',
    cor_primaria_hex: '#15803d',
    is_bicolor: false,
    diametros_disponiveis: ['1/2"', '5/8"', '3/4"', '1"'],
    comprimento_padrao_mm: 6000,
    densidade_g_cm3: 7.75,
    fornecedor_homologado: 'Villares Metals',
    observacoes: 'Aço inoxidável martensítico temperável para peças mecânicas de alta dureza.'
  },
  {
    id: 'mat-12',
    codigo: 'INOX-321',
    tipo_material: 'Barra de aço redonda',
    especificacao_aco: 'AISI 321',
    cor_primaria_nome: 'Ciano / Azul Claro',
    cor_primaria_hex: '#06b6d4',
    is_bicolor: false,
    diametros_disponiveis: ['3/8"', '1/2"', '5/8"', '3/4"', '1"'],
    comprimento_padrao_mm: 6000,
    densidade_g_cm3: 7.92,
    fornecedor_homologado: 'Aperam South America',
    observacoes: 'Aço inox estabilizado com Titânio para resistir à corrosão intergranular.'
  }
];

export function getSavedRawMaterials(): RawMaterialItem[] {
  if (typeof window === 'undefined') return DEFAULT_RAW_MATERIALS;
  try {
    const raw = localStorage.getItem('deltafix_raw_materials');
    if (!raw) {
      localStorage.setItem('deltafix_raw_materials', JSON.stringify(DEFAULT_RAW_MATERIALS));
      return DEFAULT_RAW_MATERIALS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_RAW_MATERIALS;
  }
}

export function saveRawMaterial(mat: RawMaterialItem): RawMaterialItem[] {
  const list = getSavedRawMaterials();
  const idx = list.findIndex((m) => m.id === mat.id || m.especificacao_aco === mat.especificacao_aco);
  let updated: RawMaterialItem[];
  if (idx >= 0) {
    updated = [...list];
    updated[idx] = mat;
  } else {
    updated = [mat, ...list];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_raw_materials', JSON.stringify(updated));
  }
  return updated;
}

export function deleteRawMaterial(id: string): RawMaterialItem[] {
  const list = getSavedRawMaterials();
  const filtered = list.filter((m) => m.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_raw_materials', JSON.stringify(filtered));
  }
  return filtered;
}
