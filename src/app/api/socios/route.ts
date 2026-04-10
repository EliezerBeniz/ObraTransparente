import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabaseServer = await createServerClient()
  const { data: { user: currentUser } } = await supabaseServer.auth.getUser()

  if (!currentUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Confirmar permissão admin ANTES de usar o service_role
  const { data: roleCheck } = await supabaseServer
    .from('user_roles')
    .select('role')
    .eq('user_id', currentUser.id)
    .single()

  if (roleCheck?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 })
  }

  try {
    const { email, password, full_name, role } = await request.json()

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'E-mail, senha e nome são obrigatórios.' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 1. Criar o usuário no Auth (Admin)
    const { data: { user }, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar automaticamente para facilitar
      user_metadata: { full_name }
    })

    if (authError) throw authError
    if (!user) throw new Error('Falha ao criar usuário')

    // 2. Garantir que o perfil exista (usamos upsert para evitar conflito com o trigger do banco)
    const { error: profileUpdateError } = await adminClient
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: full_name
      })

    if (profileUpdateError) throw profileUpdateError

    // 3. O trigger handle_new_user() já insere como 'admin' por padrão.
    // Se o administrador selecionou 'viewer' ou 'convidado', precisamos atualizar.
    if (role === 'viewer' || role === 'convidado') {
      const { error: roleChangeError } = await adminClient
        .from('user_roles')
        .update({ role })
        .eq('user_id', user.id)
      
      if (roleChangeError) throw roleChangeError
    }

    return NextResponse.json({ success: true, user_id: user.id })
  } catch (error: any) {
    console.error('Erro ao cadastrar membro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      user_roles (role)
    `)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabaseServer = await createServerClient()
  const { data: { user: currentUser } } = await supabaseServer.auth.getUser()

  if (!currentUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // 1. Validar se quem está deletando é ADMIN
  const { data: roleCheck } = await supabaseServer
    .from('user_roles')
    .select('role')
    .eq('user_id', currentUser.id)
    .single()

  if (roleCheck?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 })
  }

  try {
    const { id: targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 })
    }

    // 2. Impedir auto-exclusão
    if (targetUserId === currentUser.id) {
      return NextResponse.json({ error: 'Você não pode excluir sua própria conta.' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 3. Verificar se é o último admin
    const { data: admins } = await adminClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')

    const isTargetAdmin = admins?.some(a => a.user_id === targetUserId)
    if (isTargetAdmin && admins && admins.length <= 1) {
      return NextResponse.json({ error: 'Não é possível excluir o último administrador do sistema.' }, { status: 400 })
    }

    // 4. Deletar do Auth (triggers devem limpar profiles/roles se CASCADE estiver configurado, 
    // mas por segurança o código poderia deletar manualmente se falhar)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao excluir sócio:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
