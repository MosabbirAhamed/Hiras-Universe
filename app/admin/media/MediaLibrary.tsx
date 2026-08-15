"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useToast } from '../../../src/components/admin/Toast'

export default function MediaLibrary({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState<any[]>(initialItems || [])
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const toast = useToast()

  useEffect(() => { setItems(initialItems || []) }, [initialItems])

  const visibleItems = items.filter((item) => {
    if (!query) return true
    return (item.filename || '').toLowerCase().includes(query.toLowerCase())
  })

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setUploading(true)
    setProgress(10)
    try {
      const b64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(((reader.result as string) || '').split(',')[1] || '')
        reader.onerror = () => reject(new Error('Could not read file'))
        reader.readAsDataURL(file)
      })
      setProgress(60)
      const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: JSON.stringify({ filename, data: b64 }),
        headers: { 'content-type': 'application/json' }
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      setItems((prev) => [json, ...prev])
      toast?.show('Media uploaded successfully')
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Upload failed'
      setError(message)
      toast?.show(message)
    } finally {
      setProgress(100)
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this media item?')) return
    setError('')
    try {
      const res = await fetch('/api/uploads', { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'content-type': 'application/json' } })
      const json = await res.json().catch(() => ({}))
      if (json?.error === 'in_use') {
        if (!confirm(`This media is used by ${(json.usedBy || []).join(', ')}. Delete anyway?`)) return
        const forced = await fetch('/api/uploads', { method: 'DELETE', body: JSON.stringify({ id, force: true }), headers: { 'content-type': 'application/json' } })
        const forcedJson = await forced.json().catch(() => ({}))
        if (!forced.ok || !forcedJson.ok) throw new Error(forcedJson.error || 'Delete failed')
      } else if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Delete failed')
      }
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast?.show('Media deleted')
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Delete failed'
      setError(message)
      toast?.show(message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-cream bg-white p-4 sm:flex-row sm:items-center">
        <input aria-label="Search filename" placeholder="Search filename" value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-10 flex-1 rounded border border-gray-200 px-3 py-2 text-sm" />
        <label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded bg-mocha px-4 py-2 text-sm font-medium text-ivory transition hover:opacity-90">
          {uploading ? `Uploading ${progress}%` : 'Upload media'}
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
        </label>
      </div>
      {error && <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {!items.length && <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">No media has been uploaded yet.</div>}
      {!!items.length && !visibleItems.length && <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">No media matches this search.</div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleItems.map((item) => (
          <article key={item.id || item.filename} className="overflow-hidden rounded-lg border border-cream bg-white p-2">
            <div className="relative aspect-square w-full overflow-hidden rounded bg-gray-50">
              <Image src={item.url} alt={item.filename} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain" />
            </div>
            <div className="p-2">
              <div className="truncate text-sm font-medium" title={item.filename}>{item.filename}</div>
              <div className="mt-1 text-xs text-taupe">{Math.round((item.size || 0) / 1024)} KB</div>
              <div className="mt-3 flex gap-2">
                <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center text-sm text-mocha underline">Open</a>
                <button type="button" onClick={() => handleDelete(item.id)} className="min-h-9 rounded border border-gray-200 px-2 text-sm text-gray-700">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
