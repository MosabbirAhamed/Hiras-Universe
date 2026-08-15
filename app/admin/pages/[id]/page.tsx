"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ fetch(`/api/pages/${params.id}`).then(r=>r.json()).then(setPage) }, [params.id])

  if (!page) return <div>Loading...</div>

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Edit Page</h2>
      <div className="grid gap-3 max-w-2xl">
        <label className="text-sm">Title</label>
        <input className="border p-2 rounded" value={page.title} onChange={e=>setPage({...page, title: e.target.value})} />
        <label className="text-sm">Slug (url)</label>
        <input className="border p-2 rounded" value={page.slug} onChange={e=>setPage({...page, slug: e.target.value})} />
        <label className="text-sm">Content (HTML)</label>
        <textarea className="border p-2 rounded h-40" value={page.content} onChange={e=>setPage({...page, content: e.target.value})} />
        <label className="text-sm">Status</label>
        <select value={page.status} onChange={e=>setPage({...page, status: e.target.value})} className="border p-2 rounded">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-mocha text-ivory rounded" onClick={async ()=>{ setLoading(true); await fetch(`/api/pages/${page.id}`, { method: 'PUT', body: JSON.stringify(page), headers: { 'content-type':'application/json' } }); setLoading(false); router.push('/admin/pages') }}>{loading? 'Saving...':'Save'}</button>
          <button onClick={()=>router.push('/admin/pages')} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </div>
    </div>
  )
}
