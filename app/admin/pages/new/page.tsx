"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
// MediaPicker not required here

export default function NewPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'draft'|'published'|'archived'>('draft')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDesc, setSeoDesc] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const body = { title, slug, content, status, seo: { title: seoTitle, description: seoDesc } }
    const res = await fetch('/api/pages', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })
    if (res.ok) router.push('/admin/pages')
    else alert('Failed')
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">New Page</h2>
      <form onSubmit={submit} className="grid gap-3 max-w-2xl">
        <label className="text-sm">Title</label>
        <input className="border p-2 rounded" value={title} onChange={e=>setTitle(e.target.value)} />
        <label className="text-sm">Slug (url)</label>
        <input className="border p-2 rounded" value={slug} onChange={e=>setSlug(e.target.value)} />
        <label className="text-sm">Content (HTML)</label>
        <textarea className="border p-2 rounded h-40" value={content} onChange={e=>setContent(e.target.value)} />
        <label className="text-sm">Status</label>
        <select value={status} onChange={e=>setStatus(e.target.value as any)} className="border p-2 rounded">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <label className="text-sm">SEO title</label>
        <input className="border p-2 rounded" value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} />
        <label className="text-sm">SEO description</label>
        <input className="border p-2 rounded" value={seoDesc} onChange={e=>setSeoDesc(e.target.value)} />

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-mocha text-ivory rounded">Create</button>
          <button type="button" onClick={()=>router.push('/admin/pages')} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  )
}
