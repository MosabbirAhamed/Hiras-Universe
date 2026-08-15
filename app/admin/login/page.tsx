"use client"
import React, { useState } from 'react'

export default function LoginPage() {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    const res = await fetch('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: pw }), headers: { 'content-type': 'application/json' } })
    if (res.ok) {
      window.location.href = '/admin'
    } else {
      setErr('Invalid password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="max-w-md w-full bg-ivory border border-cream p-6 rounded">
        <h2 className="text-lg font-medium mb-4">Admin Login</h2>
        <label className="block text-sm mb-2">Password</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full mb-3 rounded border border-cream px-3 py-2" />
        {err && <div className="text-red-600 mb-2">{err}</div>}
        <button className="px-4 py-2 bg-mocha text-ivory rounded">Sign in</button>
      </form>
    </div>
  )
}
