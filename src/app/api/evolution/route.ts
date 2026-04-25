import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('project_updates')
    .select(`
      *,
      project_phases (title),
      project_update_media (*)
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
    const { title, description, date, media, phase_id } = body

    if (!title || !media || !Array.isArray(media) || media.length === 0) {
      return NextResponse.json({ error: 'Título e ao menos uma mídia são obrigatórios.' }, { status: 400 })
    }

    // Determine the image_url (cover) for denormalized access if needed
    // or just keep using the first one marked as is_cover
    const coverMedia = media.find(m => m.is_cover) || media[0]

    const { data: newUpdate, error } = await supabase
      .from('project_updates')
      .insert({
        title,
        description,
        date: date || new Date().toISOString().split('T')[0],
        image_url: coverMedia.media_url, // Keep it for backwards compatibility
        phase_id: phase_id || null
      })
      .select()
      .single()

    if (error) throw error

    // Insert all media
    const mediaToInsert = media.map(m => ({
      update_id: newUpdate.id,
      media_url: m.media_url,
      media_type: m.media_type || 'image',
      is_cover: m.is_cover || false
    }))

    const { error: mediaError } = await supabase
      .from('project_update_media')
      .insert(mediaToInsert)

    if (mediaError) throw mediaError

    return NextResponse.json({ ...newUpdate, project_update_media: mediaToInsert })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
