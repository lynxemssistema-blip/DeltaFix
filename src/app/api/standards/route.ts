// src/app/api/standards/route.ts - Dynamic Standards Management API for DeltaFix
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/service';
import { DIN_STANDARDS, DIMENSIONS_MAP } from '@/lib/standards/din-data';
import { EngineeringStandard, StandardDimension } from '@/lib/standards/types';

export async function GET() {
  try {
    // 1. Fetch standards from Supabase
    const { data: dbStandards, error: stdError } = await supabaseAdmin
      .from('engineering_standards')
      .select('*')
      .order('code', { ascending: true });

    if (stdError) {
      console.warn('Could not fetch standards from Supabase, falling back to local:', stdError);
    }

    // 2. Fetch dimensions from Supabase
    const { data: dbDimensions, error: dimError } = await supabaseAdmin
      .from('standard_dimensions')
      .select('*');

    if (dimError) {
      console.warn('Could not fetch dimensions from Supabase:', dimError);
    }

    // 3. Assemble combined standards list
    const standardsMap = new Map<string, EngineeringStandard>();

    // Start with default DIN standards
    for (const std of DIN_STANDARDS) {
      standardsMap.set(std.code, std);
    }

    // Overlay or add Supabase standards
    if (Array.isArray(dbStandards)) {
      for (const row of dbStandards) {
        const formulas = row.calculation_formulas || {};
        standardsMap.set(row.code, {
          id: row.id,
          code: row.code,
          family: row.family,
          system: row.system || 'metrico',
          description: row.description,
          geometric_archetype: formulas.geometric_archetype,
          calculation_formulas: formulas,
          created_at: row.created_at,
          updated_at: row.updated_at
        });
      }
    }

    // 4. Assemble dimensions map
    const combinedDimensionsMap: Record<string, Record<string, StandardDimension>> = {
      ...DIMENSIONS_MAP
    };

    if (Array.isArray(dbDimensions) && Array.isArray(dbStandards)) {
      const stdIdToCode = new Map<string, string>();
      for (const s of dbStandards) {
        stdIdToCode.set(s.id, s.code);
      }

      for (const dim of dbDimensions) {
        const stdCode = stdIdToCode.get(dim.standard_id);
        if (!stdCode) continue;

        if (!combinedDimensionsMap[stdCode]) {
          combinedDimensionsMap[stdCode] = {};
        }

        combinedDimensionsMap[stdCode][dim.bitola] = {
          id: dim.id,
          standard_id: dim.standard_id,
          bitola: dim.bitola,
          diametro_nominal: Number(dim.diametro_nominal),
          passo: Number(dim.passo),
          chave: dim.chave ? Number(dim.chave) : undefined,
          altura_cabeca: dim.altura_cabeca ? Number(dim.altura_cabeca) : undefined,
          diametro_cabeca: dim.diametro_cabeca ? Number(dim.diametro_cabeca) : undefined,
          vertice: dim.vertice ? Number(dim.vertice) : undefined,
          diametro_interno: dim.diametro_interno ? Number(dim.diametro_interno) : undefined,
          diametro_externo: dim.diametro_externo ? Number(dim.diametro_externo) : undefined,
          espessura: dim.espessura ? Number(dim.espessura) : undefined,
          comprimentos_validos: Array.isArray(dim.comprimentos_validos) ? dim.comprimentos_validos : [],
          tolerancias: dim.tolerancias || {}
        };
      }
    }

    return NextResponse.json({
      standards: Array.from(standardsMap.values()),
      dimensionsMap: combinedDimensionsMap
    });
  } catch (err: any) {
    console.error('API /api/standards GET error:', err);
    return NextResponse.json(
      {
        standards: DIN_STANDARDS,
        dimensionsMap: DIMENSIONS_MAP,
        error: err.message
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { standard, dimensions } = body;

    if (!standard || !standard.code || !standard.family) {
      return NextResponse.json(
        { error: 'Código da norma e família são obrigatórios.' },
        { status: 400 }
      );
    }

    const formulas = {
      ...(standard.calculation_formulas || {}),
      geometric_archetype: standard.geometric_archetype || 'hex_bolt'
    };

    // 1. Upsert Engineering Standard
    const { data: savedStd, error: stdErr } = await supabaseAdmin
      .from('engineering_standards')
      .upsert(
        {
          code: standard.code.trim().toUpperCase(),
          family: standard.family,
          system: standard.system || 'metrico',
          description: standard.description || `Norma técnica ${standard.code}`,
          calculation_formulas: formulas
        },
        { onConflict: 'code' }
      )
      .select()
      .single();

    if (stdErr) {
      console.error('Error inserting standard:', stdErr);
      return NextResponse.json({ error: stdErr.message }, { status: 500 });
    }

    const standard_id = savedStd.id;

    // 2. Insert or replace dimensions if provided
    if (Array.isArray(dimensions) && dimensions.length > 0) {
      // Delete existing dimensions for this standard to keep it clean
      await supabaseAdmin
        .from('standard_dimensions')
        .delete()
        .eq('standard_id', standard_id);

      const rowsToInsert = dimensions.map((d: any) => ({
        standard_id,
        bitola: d.bitola,
        diametro_nominal: d.diametro_nominal,
        passo: d.passo,
        chave: d.chave || null,
        altura_cabeca: d.altura_cabeca || null,
        diametro_cabeca: d.diametro_cabeca || null,
        vertice: d.vertice || (d.chave ? Number((d.chave * 1.1547).toFixed(2)) : null),
        diametro_interno: d.diametro_interno || null,
        diametro_externo: d.diametro_externo || null,
        espessura: d.espessura || null,
        comprimentos_validos: Array.isArray(d.comprimentos_validos) ? d.comprimentos_validos : [],
        tolerancias: d.tolerancias || {}
      }));

      const { error: dimErr } = await supabaseAdmin
        .from('standard_dimensions')
        .insert(rowsToInsert);

      if (dimErr) {
        console.error('Error inserting dimensions:', dimErr);
      }
    }

    return NextResponse.json({
      success: true,
      standard: savedStd,
      message: `Norma ${savedStd.code} cadastrada com sucesso no banco de dados!`
    });
  } catch (err: any) {
    console.error('API /api/standards POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
