/* eslint-disable no-unused-vars */
"use client"
import React, { useState } from 'react'
import * as Ri from 'react-icons/ri'

const ICONS = [ 'RiHome3Line','RiShoppingBagLine','RiUser3Line','RiStarLine','RiTagLine','RiMenu3Line','RiInfoLine' ]

export default function IconPicker({ value, onChange }:{ value?:string|null, onChange:(_value?:string|null)=>void }){
  const [q, setQ] = useState('')
  const list = ICONS.filter(i=> i.toLowerCase().includes(q.toLowerCase()))
  function renderIcon(name:string){ const Comp:any = (Ri as any)[name]; if (!Comp) return <span className="w-5 h-5 inline-block" />; return <Comp /> }
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search icons" className="border p-2 rounded flex-1" />
        <button onClick={()=>onChange(null)} className="px-2 py-1 border rounded">Clear</button>
      </div>
      <div className="grid grid-cols-6 gap-2">
        <button onClick={()=>onChange(null)} className={`p-2 border rounded ${!value? 'bg-mocha text-ivory':''}`}>No icon</button>
        {list.map(name=> (
          <button key={name} onClick={()=>onChange(name)} className={`p-2 border rounded ${value===name? 'bg-mocha text-ivory':''}`}>{renderIcon(name)}</button>
        ))}
      </div>
    </div>
  )
}
