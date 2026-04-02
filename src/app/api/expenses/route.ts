import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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
    const { title, description, amount, date, category, status, quantity, file_url, label, participants } = body

    // URL Validation
    if (file_url && !/^https?:\/\/(drive|docs)\.google\.com\//.test(file_url)) {
      return NextResponse.json({ error: 'Invalid attachment URL. Must be a Google Drive link.' }, { status: 400 })
    }

    // Participants Validation
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json({ error: 'Ao menos um pagador (sócio) deve ser informado.' }, { status: 400 })
    }

    const participantsSum = participants.reduce((acc, p) => acc + Number(p.amount_paid), 0)
    if (Math.abs(participantsSum - Number(amount)) > 0.01) {
      return NextResponse.json({ error: `A soma dos pagamentos (R$ ${participantsSum}) não bate com o total (R$ ${amount}).` }, { status: 400 })
    }

    // Insert Expense
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        title,
        description,
        amount,
        date,
        category,
        status,
        quantity: Number(quantity) || 1,
        created_by: user.id
      })
      .select()
      .single()

    if (expenseError) throw expenseError

    // Insert Participants
    const participantsData = participants.map(p => ({
      expense_id: expenseData.id,
      user_id: p.user_id,
      amount_paid: p.amount_paid
    }))

    const { error: participantsError } = await supabase
      .from('expense_participants')
      .insert(participantsData)

    if (participantsError) throw participantsError

    // Insert Attachment if provided
    if (file_url) {
      const { error: attachmentError } = await supabase
        .from('attachments')
        .insert({
          expense_id: expenseData.id,
          file_url,
          label: label || 'Comprovante'
        })
        
      if (attachmentError) throw attachmentError
    }

    return NextResponse.json({ success: true, id: expenseData.id }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
