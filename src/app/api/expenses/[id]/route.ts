import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      attachments (*),
      expense_participants (
        *,
        profiles (full_name)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    const { title, description, amount, date, category, status, quantity, file_url, label, participants } = body

    // Participants Validation
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json({ error: 'Ao menos um pagador (sócio) deve ser informado.' }, { status: 400 })
    }

    const participantsSum = participants.reduce((acc, p) => acc + Number(p.amount_paid), 0)
    if (Math.abs(participantsSum - Number(amount)) > 0.01) {
      return NextResponse.json({ error: `A soma dos pagamentos (R$ ${participantsSum}) não bate com o total (R$ ${amount}).` }, { status: 400 })
    }

    // Update expense
    const { error: expenseError } = await supabase
      .from('expenses')
      .update({
        title,
        description,
        amount,
        date,
        category,
        status,
        quantity: Number(quantity) || 1
      })
      .eq('id', id)

    if (expenseError) throw expenseError

    // Sync Participants: Delete old, Insert new
    await supabase.from('expense_participants').delete().eq('expense_id', id)
    
    const participantsData = participants.map(p => ({
      expense_id: id,
      user_id: p.user_id,
      amount_paid: p.amount_paid
    }))

    const { error: participantsError } = await supabase
      .from('expense_participants')
      .insert(participantsData)

    if (participantsError) throw participantsError

    // Handle attachment logic
    // First clear old attachments
    await supabase.from('attachments').delete().eq('expense_id', id)
    
    // Add new if provided
    if (file_url) {
       if (!/^https?:\/\/(drive|docs)\.google\.com\//.test(file_url)) {
         return NextResponse.json({ error: 'Invalid attachment URL. Must be a Google Drive link.' }, { status: 400 })
       }
       const { error: attachError } = await supabase.from('attachments').insert({
         expense_id: id,
         file_url,
         label: label || 'Comprovante'
       })
       if (attachError) throw attachError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
