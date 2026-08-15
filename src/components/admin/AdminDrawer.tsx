"use client"
import React from 'react'

export default function AdminDrawer({ open, onClose, title, children }:{ open:boolean, onClose:()=>void, title?:string, children?:React.ReactNode }){
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="w-full md:w-96 bg-white shadow-xl h-full p-4 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button aria-label="Close drawer" onClick={onClose} className="text-taupe">✕</button>
        </div>
        <div>{children}</div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  )
}
