import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('project_updates')
    .select(`
      *,
      project_phases (title)
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
    const { title, description, date, image_url, phase_id } = body

    if (!title || !image_url) {
      return NextResponse.json({ error: 'Título e URL da imagem são obrigatórios.' }, { status: 400 })
    }

    const { data: newUpdate, error } = await supabase
      .from('project_updates')
      .insert({
        title,
        description,
        date: date || new Date().toISOString().split('T')[0],
        image_url,
        phase_id: phase_id || null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(newUpdate)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
