"use client"
import React, { useEffect, useState } from 'react'

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8) }
import { useToast } from '../../../src/components/admin/Toast'
import TreeMenuEditor from '../../../src/components/admin/TreeMenuEditor'
import SearchSelect from '../../../src/components/admin/SearchSelect'
import IconPicker from '../../../src/components/admin/IconPicker'

type NavItem = {
  id: string
  label: string
  url?: string
  type?: string
  target?: string
  icon?: string | null
  badge?: string | null
  active?: boolean
  desktopVisible?: boolean
  mobileVisible?: boolean
  
  location?: string
  order?: number
  children?: NavItem[]
}

export default function NavigationAdmin(){
  const [menu, setMenu] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<NavItem|null>(null)
  
  const [activeMenu, setActiveMenu] = useState('header')
  const toast = useToast()

  useEffect(()=>{ fetch('/api/navigation').then(r=>r.json()).then((d)=> setMenu(d || [])) }, [])

  function addItem(){
    const it:NavItem = { id: uid(), label: 'New item', url: '/', type: 'custom', active:true, desktopVisible:true, mobileVisible:true, location: activeMenu, order: menu.length, children: [] }
    setMenu(prev=>[...prev, it])
    setEditing(it)
    setUnsaved(true)
  }

  function saveMenu(){
    setLoading(true)
    fetch('/api/navigation', { method: 'PUT', body: JSON.stringify(menu), headers: { 'content-type':'application/json' } }).then(async r=>{
      setLoading(false)
      if (r.ok){ setUnsaved(false); toast?.show('Navigation saved successfully.') }
      else { const txt = await r.text(); toast?.show('Save failed: '+txt) }
    }).catch(err=>{ setLoading(false); toast?.show('Save failed: '+String(err)) })
  }

  // editItem replaced by openEdit below

  

  function updateEditing(patch:Partial<NavItem>){ if (!editing) return; setEditing({...editing, ...patch} as NavItem); setMenu(updateItem(menu, editing!.id, {...editing, ...patch})) }

  function updateItem(list:NavItem[], id:string, val:NavItem): NavItem[]{
    return list.map(it=>{
      if (it.id===id) return val
      if (it.children) return { ...it, children: updateItem(it.children, id, val) }
      return it
    })
  }

  // legacy manipulation helpers removed in favor of TreeMenuEditor

  const [origMenu, setOrigMenu] = useState<NavItem[]>([])
  useEffect(()=>{ fetch('/api/navigation').then(r=>r.json()).then((d)=> { setMenu(d || []); setOrigMenu(d || []) }) }, [])
  const [unsaved, setUnsaved] = useState(false)
  

  // simple renderer
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-medium">Navigation Management</h1>
        <div className="flex gap-2">
          <button onClick={addItem} className="px-3 py-2 bg-mocha text-ivory rounded">Add Item</button>
          <button onClick={saveMenu} className="px-3 py-2 bg-ivory border border-cream rounded">{loading? 'Saving...':'Save Menu'}</button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-2">
          <button onClick={()=>setActiveMenu('header')} className={`px-3 py-1 rounded ${activeMenu==='header'?'bg-mocha text-ivory':'bg-ivory border border-cream'}`}>Header</button>
          <button onClick={()=>setActiveMenu('mobile')} className={`px-3 py-1 rounded ${activeMenu==='mobile'?'bg-mocha text-ivory':'bg-ivory border border-cream'}`}>Mobile</button>
          <button onClick={()=>setActiveMenu('footer')} className={`px-3 py-1 rounded ${activeMenu==='footer'?'bg-mocha text-ivory':'bg-ivory border border-cream'}`}>Footer</button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className={`px-3 py-1 rounded ${activeMenu==='header'?'bg-mocha text-ivory':'bg-ivory border border-cream'}`} onClick={()=>setActiveMenu('header')}>Header</button>
          <button className={`px-3 py-1 rounded ${activeMenu==='mobile'?'bg-mocha text-ivory':'bg-ivory border border-cream'}`} onClick={()=>setActiveMenu('mobile')}>Mobile</button>
          <button className={`px-3 py-1 rounded ${activeMenu==='footer'?'bg-mocha text-ivory':'bg-ivory border border-cream'}`} onClick={()=>setActiveMenu('footer')}>Footer</button>
        </div>
        <div className="flex items-center gap-3">
          {unsaved && <div className="text-sm text-amber-600">Unsaved changes</div>}
          <button onClick={()=>{ setMenu(origMenu); setUnsaved(false) }} className="px-3 py-2 border rounded">Discard Changes</button>
          <button onClick={saveMenu} className="px-3 py-2 bg-mocha text-ivory rounded">{loading? 'Saving...':'Save Changes'}</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <TreeMenuEditor value={menu.filter(m=>m.location===activeMenu)} onChange={(v)=>{ // replace only for this location
            const others = menu.filter(m=>m.location!==activeMenu)
            setMenu([...others, ...v.map(i=> ({ ...i, location: activeMenu }))])
            setUnsaved(true)
          }} onEdit={(id)=>{ // open edit for clicked item
            const find = (list: any[]): any => {
              for (const it of list){ if (it.id===id) return it; if (it.children) { const r = find(it.children); if (r) return r } }
              return null
            }
            const item = find(menu)
            if (item) setEditing(item)
          }} />
          <div className="mt-2">
            <button onClick={addItem} className="px-3 py-2 border rounded">+ Add Menu Item</button>
          </div>
        </div>

        <div>
          <div className="bg-white border rounded p-4">
            <h3 className="font-medium mb-2">Edit Item</h3>
            {editing ? (
              <div className="space-y-2">
                <label className="block text-xs">Label</label>
                <input value={editing.label} onChange={e=>{ updateEditing({ label: e.target.value }); setUnsaved(true) }} className="w-full border p-2 rounded" />
                <label className="block text-xs">Link Type</label>
                <select value={editing.type} onChange={e=>{ updateEditing({ type: e.target.value }); setUnsaved(true) }} className="w-full border p-2 rounded">
                  <option value="custom">Custom URL</option>
                  <option value="page">Internal Page</option>
                  <option value="product">Product</option>
                  <option value="category">Category</option>
                </select>
                {editing.type==='custom' && (
                  <>
                    <label className="block text-xs">URL</label>
                    <input value={editing.url||''} onChange={e=>{ updateEditing({ url: e.target.value }); setUnsaved(true) }} className="w-full border p-2 rounded" />
                  </>
                )}
                {editing.type==='page' && <SearchSelect type="page" value={editing.url} onChange={(p)=>{ updateEditing({ url: `/cms/${p.slug}`, type: 'page' }); setUnsaved(true) }} />}
                {editing.type==='product' && <SearchSelect type="product" value={editing.url} onChange={(p)=>{ updateEditing({ url: `/products/${p.slug}`, type: 'product' }); setUnsaved(true) }} />}
                {editing.type==='category' && <SearchSelect type="category" value={editing.url} onChange={(p)=>{ updateEditing({ url: `/category/${p.slug}`, type: 'category' }); setUnsaved(true) }} />}

                <label className="block text-xs">Icon</label>
                <IconPicker value={editing.icon} onChange={(v)=>{ updateEditing({ icon: v }); setUnsaved(true) }} />

                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.active} onChange={e=>{ updateEditing({ active: e.target.checked }); setUnsaved(true) }} /> Enabled</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.desktopVisible} onChange={e=>{ updateEditing({ desktopVisible: e.target.checked }); setUnsaved(true) }} /> Desktop visible</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.mobileVisible} onChange={e=>{ updateEditing({ mobileVisible: e.target.checked }); setUnsaved(true) }} /> Mobile visible</label>
                <label className="block text-xs">Badge (optional)</label>
                <input value={editing.badge||''} onChange={e=>{ updateEditing({ badge: e.target.value }); setUnsaved(true) }} className="w-full border p-2 rounded" />

                <div className="flex gap-2">
                  <button onClick={()=>{ setEditing(null) }} className="px-3 py-2 border rounded">Close</button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-taupe">Select an item to edit.</div>
            )}
          </div>
        </div>
      </div>

      
    </div>
  )
}
