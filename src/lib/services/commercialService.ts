// src/lib/services/commercialService.ts - Serviço de Persistência e Operações Comerciais & Multi-Empresa
import {
  CompanyPartner,
  SalesOrderQuote,
  OrganizationEntity,
  UserApprovalRequest
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
  decision: 'aprovado' | 'rejeitado',
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
