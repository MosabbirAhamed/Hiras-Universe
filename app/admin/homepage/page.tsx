"use client"
import React, { useEffect, useState } from 'react'
import MediaPicker from '../../../src/components/admin/MediaPicker'

export default function AdminHomepage() {
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/homepage').then(r=>r.json()).then(s => { setSections(s); setLoading(false) })
  }, [])

  function moveUp(i:number){ if(i===0) return; const copy = [...sections]; const tmp = copy[i-1]; copy[i-1]=copy[i]; copy[i]=tmp; setSections(copy) }
  function moveDown(i:number){ if(i===sections.length-1) return; const copy=[...sections]; const tmp = copy[i+1]; copy[i+1]=copy[i]; copy[i]=tmp; setSections(copy) }

  async function save(){
    await fetch('/api/homepage', { method: 'PUT', body: JSON.stringify(sections), headers: { 'content-type': 'application/json' } })
    alert('Saved')
  }

  if (loading) return <div>Loading...</div>
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Homepage Builder</h2>
      <div className="grid gap-3">
        {sections.map((s,i)=> (
          <div key={s.id} className="p-3 bg-ivory border border-cream rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{s.type}</div>
              <div className="text-sm text-taupe">{s.data?.headline ?? s.data?.title ?? ''}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>moveUp(i)} className="px-2 py-1 border rounded">↑</button>
              <button onClick={()=>moveDown(i)} className="px-2 py-1 border rounded">↓</button>
              <button onClick={async ()=>{ const newTitle = prompt('Edit title', s.data?.headline || s.data?.title || ''); if(newTitle!=null){ const copy=[...sections]; copy[i].data = { ...copy[i].data, headline: newTitle }; setSections(copy) } }} className="px-2 py-1 border rounded">Edit</button>
              { (s.data?.image || s.data?.images) && (
                <MediaPicker value={(s.data?.images) || (s.data?.image ? [s.data.image] : [])} onChange={(v: string[])=>{ const copy=[...sections]; if(v.length>1) copy[i].data = { ...copy[i].data, images: v }; else copy[i].data = { ...copy[i].data, image: v[0] }; setSections(copy) }} multiple={true} />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={save} className="px-4 py-2 bg-mocha text-ivory rounded">Save</button>
      </div>
    </div>
  )
}
