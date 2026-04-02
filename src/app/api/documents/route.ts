import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('project_documents')
    .select('*')
    .order('created_at', { ascending: false })

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
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, category, file_url, version, description } = body

    if (!title || !file_url) {
      return NextResponse.json({ error: 'Título e URL são obrigatórios.' }, { status: 400 })
    }

    // URL Validation (must be external links, ideally Google/cloud)
    if (!/^https?:\/\//.test(file_url)) {
      return NextResponse.json({ error: 'Link inválido. Deve ser uma URL completa (http/https).' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('project_documents')
      .insert({
        title,
        category,
        file_url,
        version,
        description
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
