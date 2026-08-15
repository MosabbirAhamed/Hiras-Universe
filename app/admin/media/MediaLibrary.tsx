"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'

export default function MediaLibrary({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState<any[]>(initialItems || [])
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => { setItems(initialItems || []) }, [initialItems])

  function matches(item: any) {
    if (!query) return true
    return (item.filename || '').toLowerCase().includes(query.toLowerCase())
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setProgress(10)
    try {
      const b64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          const base64Data = result.split(',')[1] || ''
          resolve(base64Data)
        }
        reader.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
      })
      setProgress(60)
      const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: JSON.stringify({ filename, data: b64 }),
        headers: { 'content-type': 'application/json' }
      })
      const json = await res.json()
      setProgress(100)
      setUploading(false)
      if (res.ok) {
        setItems((prev) => [json, ...prev])
      } else {
        alert(json.error || 'Upload failed')
      }
    } catch {
      setUploading(false)
      alert('Upload failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this media item?')) return
    const res = await fetch('/api/uploads', { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'content-type': 'application/json' } })
    const json = await res.json()
    if (json?.error === 'in_use') {
      if (!confirm('This media is currently used by content: ' + (json.usedBy || []).join(', ') + '. Delete anyway?')) return
      const res2 = await fetch('/api/uploads', { method: 'DELETE', body: JSON.stringify({ id, force: true }), headers: { 'content-type': 'application/json' } })
      const j2 = await res2.json()
      if (j2.ok) setItems(prev => prev.filter(i => i.id !== id))
    } else if (json?.ok) {
      setItems(prev => prev.filter(i => i.id !== id))
    } else {
      alert('Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <input placeholder="Search filename" value={query} onChange={e => setQuery(e.target.value)} className="border p-2 rounded flex-1" />
        <label className="px-3 py-2 bg-cream border rounded cursor-pointer">
          Upload
          <input type="file" onChange={handleFile} className="hidden" />
        </label>
      </div>

      {uploading && <div className="mb-3">Uploading... {progress}%</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.filter(matches).map(item => (
          <div key={item.id || item.filename} className="p-2 bg-ivory border border-cream rounded">
            <div className="relative w-full h-40 bg-gray-50 mb-2 flex items-center justify-center overflow-hidden rounded">
              <Image src={item.url} alt={item.filename} fill style={{ objectFit: 'contain' }} />
            </div>
            <div className="text-sm font-medium truncate">{item.filename}</div>
            <div className="text-xs text-taupe">{Math.round((item.size||0)/1024)} KB</div>
            <div className="flex gap-2 mt-2">
              <a href={item.url} target="_blank" rel="noreferrer" className="text-sm underline">Open</a>
              <button onClick={() => handleDelete(item.id)} className="text-sm border px-2 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
