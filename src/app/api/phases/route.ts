import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  // Fetch phases
  const { data: phases, error: phasesError } = await supabase
    .from('project_phases')
    .select('*')
    .order('order_index', { ascending: true })
    .order('phase_date', { ascending: true })

  if (phasesError) {
    return NextResponse.json({ error: phasesError.message }, { status: 500 })
  }

  // Fetch expense totals per phase
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('amount, phase_id')
    .not('phase_id', 'is', null)

  if (expensesError) {
    return NextResponse.json({ error: expensesError.message }, { status: 500 })
  }

  // Map totals to phases
  const phasesWithCosts = phases.map(phase => {
    const phaseExpenses = expenses.filter(e => e.phase_id === phase.id)
    const totalSpent = phaseExpenses.reduce((acc, e) => acc + Number(e.amount), 0)
    return {
      ...phase,
      total_spent: totalSpent,
      expense_count: phaseExpenses.length
    }
  })

  return NextResponse.json(phasesWithCosts)
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
    const { title, description, phase_date, status, order_index, budget_estimate } = body
    
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
        order_index: finalOrder,
        budget_estimate: Number(budget_estimate) || 0
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(newPhase)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
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
    const { phases } = await request.json() // Array of { id, order_index }
    
    if (!Array.isArray(phases)) {
      throw new Error('Invalid input: phases must be an array')
    }

    // Bulk update order_index
    // We use a loop here because Supabase upsert requires full objects or 
    // we'd need a custom RPC for efficient bulk field-specific updates.
    // For timeline phases, the number of items is small enough.
    const updates = phases.map(p => 
      supabase
        .from('project_phases')
        .update({ order_index: p.order_index })
        .eq('id', p.id)
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
