"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GlobalSearch(){
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any[]>([])
  const router = useRouter()

  useEffect(()=>{
    function onKey(e: KeyboardEvent){ if (e.key === 'k' && (e.ctrlKey||e.metaKey)) { e.preventDefault(); setOpen(o=>!o) } }
    window.addEventListener('keydown', onKey)
    return ()=>window.removeEventListener('keydown', onKey)
  },[])

  useEffect(()=>{
    if (!q) return setResults([])
    const t = setTimeout(()=>{
      fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r=>r.json()).then(setResults).catch(()=>setResults([]))
    }, 250)
    return ()=>clearTimeout(t)
  },[q])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="absolute inset-0 bg-black/40" onClick={()=>setOpen(false)} />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded p-4 shadow">
        <div className="flex items-center gap-2">
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products, pages, orders, customers..." className="w-full border rounded px-3 py-2" />
          <button onClick={()=>setOpen(false)} className="px-3 py-2">Close</button>
        </div>
        <div className="mt-3">
          {results.length === 0 && q && <div className="text-sm text-gray-500">No results</div>}
          <ul className="space-y-1">
            {results.map((r,i)=> (
              <li key={i}>
                <a onClick={(e)=>{ e.preventDefault(); router.push(r.url || '/admin'); setOpen(false) }} href={r.url} className="block p-2 hover:bg-gray-50 rounded">{r.title || r.label || r.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
