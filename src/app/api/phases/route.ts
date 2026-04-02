import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('project_phases')
    .select('*')
    .order('phase_date', { ascending: false })

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
    const { title, description, phase_date } = body

    const { data: newPhase, error } = await supabase
      .from('project_phases')
      .insert({
        title,
        description,
        phase_date
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(newPhase)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
