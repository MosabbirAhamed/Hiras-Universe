import { promises as fs } from 'fs'
import path from 'path'
import { Media } from '../../types/models'

const dataPath = path.join(process.cwd(), 'data')
const uploadsPath = path.join(process.cwd(), 'public', 'uploads')

async function readJson<T>(name: string): Promise<T> {
  const p = path.join(dataPath, name)
  const raw = await fs.readFile(p, 'utf-8')
  return JSON.parse(raw) as T
}

async function writeJson<T>(name: string, data: T) {
  const p = path.join(dataPath, name)
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf-8')
}

export async function getAllMedia(): Promise<Media[]> {
  try {
    const list = await readJson<Media[]>('media.json')
    return list
  } catch (err) {
    return []
  }
}

export async function saveAllMedia(list: Media[]) {
  return writeJson('media.json', list)
}

function safeId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8)
}

export async function createMediaFromUpload(opts: { filename: string; buffer: Buffer; mimeType: string }) {
  if (!opts || !opts.filename) throw new Error('invalid')
  if (!fs) throw new Error('fs missing')
  if (!opts.buffer) throw new Error('no data')

  if (!await exists(uploadsPath)) await fs.mkdir(uploadsPath, { recursive: true })
  const savePath = path.join(uploadsPath, opts.filename)
  await fs.writeFile(savePath, opts.buffer)

  // try to detect dimensions for SVG and common raster types
  let width: number|undefined = undefined
  let height: number|undefined = undefined
  try {
    const ext = path.extname(opts.filename).toLowerCase()
    if (ext === '.svg') {
      const txt = opts.buffer.toString('utf-8')
      const w = txt.match(/width="([0-9.]+)"/) || txt.match(/width:([0-9.]+)px/)
      const h = txt.match(/height="([0-9.]+)"/) || txt.match(/height:([0-9.]+)px/)
      if (w) width = Number(w[1])
      if (h) height = Number(h[1])
    } else {
      // For raster formats we leave undefined (can be filled by image-size later)
    }
  } catch (e) {
    // ignore
  }

  const media: Media = {
    id: safeId(),
    filename: opts.filename,
    url: `/uploads/${opts.filename}`,
    mimeType: opts.mimeType || 'application/octet-stream',
    size: opts.buffer.length,
    width,
    height,
    createdAt: new Date().toISOString(),
    altText: '',
    metadata: {}
  }

  const list = await getAllMedia()
  list.unshift(media)
  await saveAllMedia(list)
  return media
}

export async function deleteMediaById(id: string) {
  const list = await getAllMedia()
  const idx = list.findIndex(m => m.id === id)
  if (idx === -1) return false
  const item = list[idx]
  const filePath = path.join(uploadsPath, item.filename)
  if (await exists(filePath)) await fs.unlink(filePath)
  list.splice(idx, 1)
  await saveAllMedia(list)
  return true
}

async function exists(p: string) {
  try { await fs.access(p); return true } catch { return false }
}

export async function findMediaById(id: string) {
  const list = await getAllMedia()
  return list.find(m => m.id === id)
}

export async function findMediaByFilename(filename: string) {
  const list = await getAllMedia()
  return list.find(m => m.filename === filename)
}

export {}
