import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    const { title, description, date, media, phase_id } = body

    if (!title || !media || !Array.isArray(media) || media.length === 0) {
      return NextResponse.json({ error: 'Título e ao menos uma mídia são obrigatórios.' }, { status: 400 })
    }

    const coverMedia = media.find(m => m.is_cover) || media[0]

    const { data: updatedUpdate, error } = await supabase
      .from('project_updates')
      .update({
        title,
        description,
        date,
        image_url: coverMedia.media_url,
        phase_id: phase_id || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Sync media: easiest way is to delete and re-insert or use a more complex sync logic
    // For simplicity and since media count is low, we delete all and re-insert
    await supabase.from('project_update_media').delete().eq('update_id', id)

    const mediaToInsert = media.map(m => ({
      update_id: id,
      media_url: m.media_url,
      media_type: m.media_type || 'image',
      is_cover: m.is_cover || false
    }))

    const { error: mediaError } = await supabase
      .from('project_update_media')
      .insert(mediaToInsert)

    if (mediaError) throw mediaError

    return NextResponse.json({ ...updatedUpdate, project_update_media: mediaToInsert })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const { error } = await supabase
    .from('project_updates')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
