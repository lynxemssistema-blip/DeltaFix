// src/app/api/products/route.ts - API for engineered fastener products
import { NextRequest, NextResponse } from 'next/server';
import { saveProductToDatabase, fetchRecentProducts } from '@/lib/supabase/service';
import { ProductItem } from '@/lib/standards/types';

export async function GET() {
  try {
    const products = await fetchRecentProducts();
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ProductItem = await req.json();
    const result = await saveProductToDatabase(body);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
