/* eslint-disable no-unused-vars */
"use client"
import React, { useEffect, useState } from 'react'

export default function SearchSelect({ type, value, onChange }:{ type:'page'|'product'|'category', value?:any, onChange:(_v:any)=>void }){
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any[]>([])
  useEffect(()=>{
    if (!q) return setResults([])
    const endpoint = type === 'category' ? '/api/categories' : `/api/${type}s`
    const t = setTimeout(()=>{ fetch(`${endpoint}?q=${encodeURIComponent(q)}`).then(r=>r.json()).then(d=>setResults(d||[])).catch(()=>setResults([])) }, 250)
    return ()=>clearTimeout(t)
  }, [q, type])
  return (
    <div>
      {value && <div className="mb-2 text-sm">Selected: <strong>{value.title||value.name||value.slug}</strong></div>}
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`Search ${type}s...`} className="w-full border p-2 rounded mb-2" />
      <div className="max-h-48 overflow-auto border rounded">
        {results.map(r=> (
          <button key={r.id} onClick={()=>{ onChange(r); setQ(''); setResults([]) }} className="w-full text-left p-2 hover:bg-ivory">{r.title||r.name||r.slug}</button>
        ))}
        {!results.length && <div className="p-2 text-sm text-taupe">No results</div>}
      </div>
    </div>
  )
}
