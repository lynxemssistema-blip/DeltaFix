// src/app/api/cnpj/[cnpj]/route.ts - Consulta CNPJ com preenchimento automático para PJ
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  try {
    const resolvedParams = await params;
    const rawCnpj = resolvedParams.cnpj || '';
    const cleanCnpj = rawCnpj.replace(/\D/g, '');

    if (cleanCnpj.length !== 14) {
      return NextResponse.json(
        { error: 'CNPJ deve conter 14 dígitos numéricos.' },
        { status: 400 }
      );
    }

    // 1. Tentar BrasilAPI com User-Agent
    try {
      const brasilApiResponse = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
        headers: {
          'User-Agent': 'DeltaFix-Industrial-ERP/1.0 (Contagem-MG)'
        },
        next: { revalidate: 3600 } // Cache por 1 hora
      });

      if (brasilApiResponse.ok) {
        const data = await brasilApiResponse.json();
        return NextResponse.json({
          success: true,
          source: 'brasilapi',
          cnpj: cleanCnpj,
          razao_social: data.razao_social || data.nome_fantasia || '',
          nome_fantasia: data.nome_fantasia || data.razao_social || '',
          situacao_cadastral: data.descricao_situacao_cadastral || 'ATIVA',
          data_inicio_atividade: data.data_inicio_atividade || '',
          cnae_fiscal_descricao: data.cnae_fiscal_descricao || '',
          endereco: {
            logradouro: `${data.descricao_tipo_de_logradouro || ''} ${data.logradouro || ''}`.trim(),
            numero: data.numero || '',
            complemento: data.complemento || '',
            bairro: data.bairro || '',
            cidade: data.municipio || '',
            uf: data.uf || '',
            cep: data.cep || ''
          },
          contato: {
            telefone: data.ddd_telefone_1 || data.ddd_telefone_2 || '',
            email: data.email || ''
          }
        });
      }
    } catch (apiErr) {
      console.warn('BrasilAPI fetch error, tentando fallback ReceitaWS:', apiErr);
    }

    // 2. Fallback ReceitaWS
    try {
      const receitaResponse = await fetch(`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`, {
        headers: {
          'User-Agent': 'DeltaFix-Industrial-ERP/1.0'
        }
      });

      if (receitaResponse.ok) {
        const rData = await receitaResponse.json();
        if (rData.status !== 'ERROR') {
          return NextResponse.json({
            success: true,
            source: 'receitaws',
            cnpj: cleanCnpj,
            razao_social: rData.nome || '',
            nome_fantasia: rData.fantasia || rData.nome || '',
            situacao_cadastral: rData.situacao || 'ATIVA',
            data_inicio_atividade: rData.abertura || '',
            cnae_fiscal_descricao: rData.atividade_principal?.[0]?.text || '',
            endereco: {
              logradouro: rData.logradouro || '',
              numero: rData.numero || '',
              complemento: rData.complemento || '',
              bairro: rData.bairro || '',
              cidade: rData.municipio || '',
              uf: rData.uf || '',
              cep: rData.cep ? rData.cep.replace(/\D/g, '') : ''
            },
            contato: {
              telefone: rData.telefone || '',
              email: rData.email || ''
            }
          });
        }
      }
    } catch (recErr) {
      console.warn('ReceitaWS fetch error:', recErr);
    }

    // Se ambos falharem mas o CNPJ for válido (14 dígitos), retorna estrutura pronta para preenchimento manual
    return NextResponse.json({
      success: false,
      message: 'Não foi possível obter dados automáticos da Receita Federal. Preencha manualmente.',
      cnpj: cleanCnpj,
      razao_social: '',
      nome_fantasia: '',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: ''
      },
      contato: {
        telefone: '',
        email: ''
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erro ao consultar CNPJ' },
      { status: 500 }
    );
  }
}
