"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

type MediaItem = {
  id: string
  filename: string
  url: string
}

export default function MediaPicker({ value, onChange, multiple }: { value?: string[]; onChange: React.Dispatch<string[]>; multiple?: boolean }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<MediaItem[]>([])
  const [selected, setSelected] = useState<string[]>(value || [])

  useEffect(() => { fetch('/api/uploads').then(r=>r.json()).then(setItems) }, [])

  useEffect(() => { setSelected(value || []) }, [value])

  function toggle(url: string) {
    if (selected.includes(url)) setSelected(selected.filter(s => s !== url))
    else setSelected(multiple ? [...selected, url] : [url])
  }

  function setPrimary(url: string) {
    if (!selected.includes(url)) return
    setSelected([url, ...selected.filter(s=>s!==url)])
  }

  function moveUp(i:number) { if(i===0) return; const copy=[...selected]; const tmp=copy[i-1]; copy[i-1]=copy[i]; copy[i]=tmp; setSelected(copy) }
  function moveDown(i:number) { if(i===selected.length-1) return; const copy=[...selected]; const tmp=copy[i+1]; copy[i+1]=copy[i]; copy[i]=tmp; setSelected(copy) }

  function apply() {
    onChange(selected.filter(Boolean))
    setOpen(false)
  }

  return (
    <div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(true)} className="px-3 py-2 border rounded">Choose from Media</button>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 md:w-3/4 max-h-[80vh] overflow-auto p-4 rounded">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Media Library</h3>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-2 py-1 border rounded">Close</button>
                <button type="button" onClick={apply} className="px-3 py-1 bg-mocha text-ivory rounded">Insert</button>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {items.map(it => (
                <div key={it.id} className={`p-1 border rounded ${selected.includes(it.url)?'ring-2 ring-mocha':''}`}>
                  <div className="w-full h-24 mb-1 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <Image src={it.url} alt={it.filename} width={120} height={96} className="object-contain w-full h-full" />
                  </div>
                  <div className="text-xs mb-1">{it.filename}</div>
                  <div className="flex flex-wrap items-center gap-1">
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={selected.includes(it.url)} onChange={()=>toggle(it.url)} />Select</label>
                    <button type="button" onClick={()=>setPrimary(it.url)} className="text-xs px-2 py-1 border rounded">Primary</button>
                  </div>
                </div>
              ))}
            </div>
            {selected.length>0 && (
              <div className="mt-4">
                <div className="font-medium mb-2">Selected</div>
                <div className="flex gap-2 overflow-auto">
                  {selected.map((url,i)=>{
                    const it = items.find(x=>x.url===url)
                    if(!it) return null
                    return (
                      <div key={url} className="p-2 border rounded">
                        <div className="w-24 h-24 mb-2"><Image src={it.url} width={96} height={96} className="object-contain w-full h-full" alt="selected"/></div>
                        <div className="flex gap-1">
                          <button type="button" onClick={()=>moveUp(i)} className="px-2 py-1 border rounded">Up</button>
                          <button type="button" onClick={()=>moveDown(i)} className="px-2 py-1 border rounded">Down</button>
                          <button type="button" onClick={()=>{ setSelected(selected.filter(s=>s!==url)) }} className="px-2 py-1 border rounded">Remove</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
