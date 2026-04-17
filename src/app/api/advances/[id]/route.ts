import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const id = params.id

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
    const { error } = await supabase
      .from('advances')
      .delete()
      .eq('id', id)

    if (error) throw error

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const id = params.id

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
    const { amount, date, description, user_id, receipt_url } = body

    if (!amount || !date || !user_id || !receipt_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabase
      .from('advances')
      .update({
        amount,
        date,
        description,
        user_id,
        receipt_url
      })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

