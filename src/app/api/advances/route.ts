import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('advances')
    .select(`
      *,
      profiles!advances_user_id_fkey (full_name)
    `)
    .order('date', { ascending: false })

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
    const { user_id, amount, date, description, receipt_url } = body

    if (!user_id || !amount || !date || !receipt_url) {
      return NextResponse.json(
        { error: 'Sócio, valor, data e comprovante são obrigatórios.' },
        { status: 400 }
      )
    }

    if (Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'O valor do aporte deve ser positivo.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('advances')
      .insert({ 
        user_id, 
        amount: Number(amount), 
        date, 
        description, 
        receipt_url,
        created_by: user.id 
      })
      .select(`*, profiles!advances_user_id_fkey (full_name)`)
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
