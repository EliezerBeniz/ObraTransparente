import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('shopping_items')
    .select(`*`)
    .order('expected_date', { ascending: true })

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
      title, 
      description, 
      quantity_text, 
      estimated_amount,
      expected_date, 
      category, 
      status, 
      expense_id 
    } = body

    if (!title || !expected_date) {
      return NextResponse.json({ error: 'Título e Data Prevista são obrigatórios.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('shopping_items')
      .insert({ 
        title, 
        description, 
        quantity_text, 
        estimated_amount,
        expected_date, 
        category, 
        status: status || 'Pendente', 
        expense_id,
        created_by: user.id
      })
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
