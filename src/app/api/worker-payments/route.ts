import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('worker_payments')
    .select(`
      *,
      workers (name, specialty)
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
    const { 
      worker_id, 
      worker_name, 
      amount, 
      date, 
      payment_type, 
      description, 
      participants,
      status
    } = body

    if (!worker_id || !amount || !date || !payment_type || !participants) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 })
    }

    // 1. Create the Expense entry
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        title: `Pagamento: ${worker_name}`,
        description: description || `Pagamento tipo ${payment_type}`,
        amount,
        date,
        category: 'Mão de Obra',
        status: status || 'Pago',
        quantity: 1,
        created_by: user.id
      })
      .select()
      .single()

    if (expenseError) throw expenseError

    // 2. Insert Participants for the expense
    const participantsData = participants.map((p: any) => ({
      expense_id: expenseData.id,
      user_id: p.user_id,
      amount_paid: p.amount_paid
    }))

    const { error: participantsError } = await supabase
      .from('expense_participants')
      .insert(participantsData)

    if (participantsError) throw participantsError

    // 3. Create the Worker Payment entry linked to the expense
    const { data: paymentData, error: paymentError } = await supabase
      .from('worker_payments')
      .insert({
        worker_id,
        expense_id: expenseData.id,
        amount,
        date,
        payment_type,
        description,
        status: status || 'Pago'
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    return NextResponse.json({ success: true, payment: paymentData, expense_id: expenseData.id }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
