import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/dashboard?start=YYYY-MM-DD&end=YYYY-MM-DD
// All aggregations are done server-side via Supabase RPC (PostgreSQL functions).
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start') || null;
  const end   = searchParams.get('end')   || null;

  try {
    const [kpisRes, monthlyRes, categoryRes, advancesRes, topRes, settingsRes] = await Promise.all([
      supabase.rpc('get_dashboard_stats',        { p_start: start, p_end: end }),
      supabase.rpc('get_monthly_expenses',       { p_start: start, p_end: end }),
      supabase.rpc('get_expenses_by_category',   { p_start: start, p_end: end }),
      supabase.rpc('get_advances_by_socio',      { p_start: start, p_end: end }),
      supabase.rpc('get_top_expenses',           { p_limit: 5, p_start: start, p_end: end }),
      supabase.from('project_settings').select('*').single(),
    ]);

    const errors = [kpisRes, monthlyRes, categoryRes, advancesRes, topRes].map(r => r.error).filter(Boolean);
    if (errors.length > 0) {
      console.error('Dashboard RPC errors:', errors);
      return NextResponse.json({ error: errors[0]?.message }, { status: 500 });
    }

    return NextResponse.json({
      kpis:     kpisRes.data?.[0]     ?? null,
      monthly:  monthlyRes.data        ?? [],
      category: categoryRes.data       ?? [],
      advances: advancesRes.data       ?? [],
      top:      topRes.data            ?? [],
      settings: settingsRes.data       ?? null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
