import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('project_phases')
    .select('*')
    .order('order_index', { ascending: true })
    .order('phase_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleData?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, description, phase_date, status, order_index } = body
    
    // Auto-calculating order if missing (put at end)
    let finalOrder = order_index
    if (finalOrder === undefined) {
      const { data: countData } = await supabase.from('project_phases').select('id')
      finalOrder = (countData?.length || 0) + 1
    }

    const { data: newPhase, error } = await supabase
      .from('project_phases')
      .insert({
        title,
        description,
        phase_date,
        status: status || 'planned',
        order_index: finalOrder
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(newPhase)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
