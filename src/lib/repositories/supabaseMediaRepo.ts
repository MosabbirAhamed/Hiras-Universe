/**
 * supabaseMediaRepo.ts
 * Drop-in replacement for mediaRepo.ts using Supabase Storage + PostgreSQL.
 * All exported function signatures are identical to mediaRepo.ts.
 */
import { getAdminClient } from '../supabase'
import { Media } from '../../types/models'
import path from 'path'

const BUCKET = 'uploads'

function rowToMedia(r: any): Media {
  return {
    id: r.id,
    filename: r.filename,
    url: r.url,
    mimeType: r.mime_type,
    size: r.size,
    width: r.width ?? undefined,
    height: r.height ?? undefined,
    createdAt: r.created_at,
    altText: r.alt_text ?? '',
    metadata: r.metadata ?? {},
  }
}

function safeId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
}

export async function getAllMedia(): Promise<Media[]> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToMedia)
}

// eslint-disable-next-line no-unused-vars
export async function saveAllMedia(_list: Media[]) { }

export async function createMediaFromUpload(opts: {
  filename: string
  buffer: Buffer
  mimeType: string
}): Promise<Media> {
  const db = getAdminClient()

  // Upload file to Supabase Storage
  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(opts.filename, opts.buffer, {
      contentType: opts.mimeType,
      upsert: false,
    })
  if (uploadError && uploadError.message !== 'The resource already exists') {
    throw new Error(uploadError.message)
  }

  // Get the public URL
  const { data: urlData } = db.storage.from(BUCKET).getPublicUrl(opts.filename)
  const publicUrl = urlData.publicUrl

  // Detect SVG dimensions
  let width: number | undefined
  let height: number | undefined
  const ext = path.extname(opts.filename).toLowerCase()
  if (ext === '.svg') {
    try {
      const txt = opts.buffer.toString('utf-8')
      const w = txt.match(/width="([0-9.]+)"/) || txt.match(/width:([0-9.]+)px/)
      const h = txt.match(/height="([0-9.]+)"/) || txt.match(/height:([0-9.]+)px/)
      if (w) width = Number(w[1])
      if (h) height = Number(h[1])
    } catch (_e) {
      // ignore — dimension detection is best-effort
    }
  }

  const id = safeId()
  const now = new Date().toISOString()

  const { data, error } = await db
    .from('media')
    .insert({
      id,
      filename: opts.filename,
      url: publicUrl,
      mime_type: opts.mimeType || 'application/octet-stream',
      size: opts.buffer.length,
      width: width ?? null,
      height: height ?? null,
      alt_text: '',
      metadata: {},
      created_at: now,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToMedia(data)
}

export async function deleteMediaById(id: string): Promise<boolean> {
  const db = getAdminClient()
  const { data: item, error: findErr } = await db
    .from('media')
    .select('*')
    .eq('id', id)
    .single()
  if (findErr || !item) return false

  // Remove from storage before deleting its database metadata.
  const { error: storageError } = await db.storage.from(BUCKET).remove([item.filename])
  if (storageError) throw new Error(storageError.message)

  // Remove from DB
  const { error } = await db.from('media').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}

export async function findMediaById(id: string): Promise<Media | undefined> {
  const db = getAdminClient()
  const { data, error } = await db.from('media').select('*').eq('id', id).single()
  if (error) return undefined
  return rowToMedia(data)
}

export async function findMediaByFilename(filename: string): Promise<Media | undefined> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('media')
    .select('*')
    .eq('filename', filename)
    .single()
  if (error) return undefined
  return rowToMedia(data)
}

export { }
