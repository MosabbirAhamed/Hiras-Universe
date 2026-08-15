"use client"
import React, { useEffect, useState } from 'react'
import { useToast } from '../../../src/components/admin/Toast'

type Settings = {
  storeName?: string
  description?: string
  contactEmail?: string
  supportEmail?: string
  phone?: string
  address?: string
  currency?: string
  currencySymbol?: string
  social?: any
  footerText?: string
  logo?: string
  favicon?: string
  defaultSeo?: any
}

export default function AdminSettings(){
  const [s, setS] = useState<Settings>({})
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(()=>{ fetch('/api/settings').then(r=>r.json()).then(setS).catch(()=>{}) }, [])

  async function save(){
    setLoading(true)
    try{
      const res = await fetch('/api/settings', { method: 'PUT', body: JSON.stringify(s), headers: { 'content-type':'application/json' } })
      setLoading(false)
      if (res.ok){ toast?.show('Settings saved'); return }
      const txt = await res.text(); toast?.show('Save failed: '+txt)
    }catch(e:any){ setLoading(false); toast?.show('Save failed: '+String(e)) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-medium">Store Settings</h1>
        <div>
          <button onClick={save} className="px-3 py-2 bg-mocha text-ivory rounded">{loading? 'Saving...':'Save Settings'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded p-4">
          <h3 className="font-medium mb-2">General</h3>
          <label className="block text-xs">Store name</label>
          <input className="w-full border p-2 rounded" value={s.storeName||''} onChange={e=>setS({...s, storeName: e.target.value})} />
          <label className="block text-xs mt-2">Description</label>
          <textarea className="w-full border p-2 rounded" value={s.description||''} onChange={e=>setS({...s, description: e.target.value})} />
          <label className="block text-xs mt-2">Logo URL</label>
          <input className="w-full border p-2 rounded" value={s.logo||''} onChange={e=>setS({...s, logo: e.target.value})} />
          <label className="block text-xs mt-2">Favicon URL</label>
          <input className="w-full border p-2 rounded" value={s.favicon||''} onChange={e=>setS({...s, favicon: e.target.value})} />
        </div>

        <div className="bg-white border rounded p-4">
          <h3 className="font-medium mb-2">Contact & Locale</h3>
          <label className="block text-xs">Contact email</label>
          <input className="w-full border p-2 rounded" value={s.contactEmail||''} onChange={e=>setS({...s, contactEmail: e.target.value})} />
          <label className="block text-xs mt-2">Support email</label>
          <input className="w-full border p-2 rounded" value={s.supportEmail||''} onChange={e=>setS({...s, supportEmail: e.target.value})} />
          <label className="block text-xs mt-2">Phone</label>
          <input className="w-full border p-2 rounded" value={s.phone||''} onChange={e=>setS({...s, phone: e.target.value})} />
          <label className="block text-xs mt-2">Address</label>
          <input className="w-full border p-2 rounded" value={s.address||''} onChange={e=>setS({...s, address: e.target.value})} />
        </div>

        <div className="bg-white border rounded p-4 md:col-span-2">
          <h3 className="font-medium mb-2">SEO Defaults</h3>
          <label className="block text-xs">Default SEO title</label>
          <input className="w-full border p-2 rounded" value={(s.defaultSeo?.title)||''} onChange={e=>setS({...s, defaultSeo: { ...(s.defaultSeo||{}), title: e.target.value }})} />
          <label className="block text-xs mt-2">Default SEO description</label>
          <textarea className="w-full border p-2 rounded" value={(s.defaultSeo?.description)||''} onChange={e=>setS({...s, defaultSeo: { ...(s.defaultSeo||{}), description: e.target.value }})} />
        </div>
      </div>
    </div>
  )
}
