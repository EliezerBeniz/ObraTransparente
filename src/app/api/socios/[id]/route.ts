import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Verificar se o usuário que está tentando editar é admin
  const { data: roleCheck } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleCheck?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 })
  }

  try {
    const { full_name, role } = await request.json()

    // Atualizar Nome no Perfil
    if (full_name !== undefined) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name })
        .eq('id', id)
      
      if (profileError) throw profileError
    }

    // Atualizar Cargo (Role)
    if (role !== undefined) {
      const { error: roleUpdateError } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', id)
      
      if (roleUpdateError) throw roleUpdateError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
