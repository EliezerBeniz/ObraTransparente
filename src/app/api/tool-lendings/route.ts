import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tool_lendings')
    .select(`
      *,
      worker:workers(id, name, specialty)
    `)
    .order('lend_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify Admin Role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleData?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { 
      tool_description, 
      worker_id, 
      borrower_name, 
      lend_date, 
      expected_return_date, 
      status, 
      photo_links, 
      notes 
    } = body

    if (!tool_description || !lend_date) {
      return NextResponse.json({ error: 'Descrição da ferramenta e data de empréstimo são obrigatórias.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tool_lendings')
      .insert({ 
        tool_description, 
        worker_id, 
        borrower_name, 
        lend_date, 
        expected_return_date, 
        status: status || 'Pendente', 
        photo_links: photo_links || [], 
        notes,
        created_by: user.id
      })
      .select(`
        *,
        worker:workers(id, name, specialty)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
