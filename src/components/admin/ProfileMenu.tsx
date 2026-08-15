"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfileMenu(){
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function signOut(){
    try { await fetch('/api/admin/logout', { method: 'POST' }) } catch (e:any) { console.error(e) }
    router.push('/admin/login')
  }

  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow">
          <a href="/admin/profile" className="block px-3 py-2">Profile</a>
          <button onClick={signOut} className="w-full text-left px-3 py-2">Sign out</button>
        </div>
      )}
    </div>
  )
}
