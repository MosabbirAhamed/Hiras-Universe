/* eslint-disable no-unused-vars */
"use client"
import React, { useEffect, useState } from 'react'

export type NavItem = {
  id: string
  label: string
  url?: string
  type?: string
  icon?: string | null
  active?: boolean
  desktopVisible?: boolean
  mobileVisible?: boolean
  badge?: string | null
  location?: string
  children?: NavItem[]
}

function clone<T>(v:T){ return JSON.parse(JSON.stringify(v)) as T }

function findParent(list:NavItem[], id:string, parent:NavItem|null = null): { node?:NavItem, parent?:NavItem|null, index?:number }{
  for (let i=0;i<list.length;i++){
    const it = list[i]
    if (it.id===id) return { node: it, parent, index: i }
    if (it.children){
      const res = findParent(it.children, id, it)
      if (res.node) return res
    }
  }
  return {}
}

function removeById(list:NavItem[], id:string): NavItem[]{
  return list.filter(i=> i.id!==id).map(i=> ({ ...i, children: i.children? removeById(i.children, id): [] }))
}

export default function TreeMenuEditor({ value, onChange, onEdit }:{ value:NavItem[], onChange:(v:NavItem[])=>void, onEdit?: (id:string)=>void }){
  const [items, setItems] = useState<NavItem[]>(value || [])
  useEffect(()=> setItems(value || []), [value])

  function update(newTree:NavItem[]){ setItems(newTree); onChange(newTree) }

  function moveUp(id:string){
    const t = clone(items)
    const found = findParent(t, id)
    if (!found.node) return
    const parent = found.parent
    const idx = found.index ?? 0
    if (parent==null){ // top-level
      if (idx! <= 0) return
      const arr = t
      const tmp = arr[idx!-1]
      arr[idx!-1] = arr[idx!]
      arr[idx!] = tmp
      update(t)
      return
    }
    const siblings = parent.children || []
    if (idx! <= 0) return
    const tmp = siblings[idx!-1]
    siblings[idx!-1] = siblings[idx!]
    siblings[idx!] = tmp
    update(t)
  }

  function moveDown(id:string){
    const t = clone(items)
    const found = findParent(t, id)
    if (!found.node) return
    const parent = found.parent
    const idx = found.index ?? 0
    const siblings = (parent? parent.children : t) || []
    if (idx! >= siblings.length-1) return
    const tmp = siblings[idx!+1]
    siblings[idx!+1] = siblings[idx!]
    siblings[idx!] = tmp
    update(t)
  }

  function indent(id:string){
    const t = clone(items)
    const found = findParent(t, id)
    if (!found.node) return
    const parent = found.parent
    const idx = found.index ?? 0
    if (parent==null){ // top-level, can indent under previous sibling
      if (idx! <= 0) return
      const prev = t[idx!-1]
      const node = t.splice(idx!,1)[0]
      prev.children = prev.children || []
      prev.children.push(node)
      update(t)
      return
    }
    // indent under previous sibling of parent
    const siblings = parent.children || []
    if (idx! <= 0) return
    const prev = siblings[idx!-1]
    const node = siblings.splice(idx!,1)[0]
    prev.children = prev.children || []
    prev.children.push(node)
    update(t)
  }

  function outdent(id:string){
    const t = clone(items)
    const found = findParent(t, id)
    if (!found.node) return
    const parent = found.parent
    const idx = found.index ?? 0
    if (!parent) return
    // remove from parent's children and insert after parent in grandparent
    const grand = findParent(t, parent.id)
    const node = parent.children!.splice(idx!,1)[0]
    if (!grand.parent){
      // parent is top-level
      const top = t
      const parentIndex = top.findIndex(x=>x.id===parent.id)
      top.splice(parentIndex+1,0,node)
      update(t)
      return
    }
    // otherwise insert after parent in grand.parent.children
    const gp = grand.parent
    const parentIndex = gp!.children!.findIndex(x=>x.id===parent.id)
    gp!.children!.splice(parentIndex+1,0,node)
    update(t)
  }

  function remove(id:string){
    const t = clone(items)
    const nt = removeById(t, id)
    update(nt)
  }

  function duplicate(id:string){
    const t = clone(items)
    const found = findParent(t, id)
    if (!found.node) return
    const node = clone(found.node)
    node.id = Date.now().toString(36) + Math.random().toString(36).slice(2,8)
    if (!found.parent){
      t.splice((found.index||0)+1,0,node)
    } else {
      found.parent.children = found.parent.children || []
      found.parent.children.splice((found.index||0)+1,0,node)
    }
    update(t)
  }

  function toggleActive(id:string){
    const t = clone(items)
    const found = findParent(t, id)
    if (!found.node) return
    found.node.active = !found.node.active
    update(t)
  }

  return (
    <div className="bg-white border rounded">
      {items.length===0 && <div className="p-4 text-sm text-gray-500">No items</div>}
      {items.map(i=> <ItemRow key={i.id} item={i} depth={0} onEdit={(id)=> onEdit?.(id)} onMoveUp={moveUp} onMoveDown={moveDown} onIndent={indent} onOutdent={outdent} onDuplicate={duplicate} onRemove={remove} onToggle={toggleActive} />)}
    </div>
  )
}

function ItemRow({ item, depth, onEdit, onMoveUp, onMoveDown, onIndent, onOutdent, onDuplicate, onRemove, onToggle }:{ item:NavItem, depth:number, onEdit:(id:string)=>void, onMoveUp:(id:string)=>void, onMoveDown:(id:string)=>void, onIndent:(id:string)=>void, onOutdent:(id:string)=>void, onDuplicate:(id:string)=>void, onRemove:(id:string)=>void, onToggle:(id:string)=>void }){
  return (
    <div>
      <div className="flex items-center justify-between p-2 border-b bg-white" style={{ paddingLeft: depth * 16 }}>
        <div className="flex items-center gap-3">
          <div className="text-gray-400">≡</div>
          <div>
            <div className={`font-medium ${item.active? '':'opacity-60'}`}>{item.label} {item.badge? <span className="ml-2 text-xs bg-cream px-1 rounded">{item.badge}</span>:null}</div>
            <div className="text-xs text-taupe">{item.type||'custom'} {item.url? `• ${item.url}`:''}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={()=>onMoveUp(item.id)} className="px-2 py-1 border rounded text-sm">↑</button>
          <button onClick={()=>onMoveDown(item.id)} className="px-2 py-1 border rounded text-sm">↓</button>
          <button onClick={()=>onIndent(item.id)} className="px-2 py-1 border rounded text-sm">→</button>
          <button onClick={()=>onOutdent(item.id)} className="px-2 py-1 border rounded text-sm">←</button>
          <button onClick={()=>onToggle(item.id)} className="px-2 py-1 border rounded text-sm">{item.active? 'Disable':'Enable'}</button>
          <button onClick={()=>onEdit(item.id)} className="px-2 py-1 border rounded text-sm">Edit</button>
          <button onClick={()=>onDuplicate(item.id)} className="px-2 py-1 border rounded text-sm">Dup</button>
          <button onClick={()=>onRemove(item.id)} className="px-2 py-1 border rounded text-sm text-red-600">Del</button>
        </div>
      </div>
      {item.children && item.children.length>0 && (
        <div>
          {item.children.map(c=> <ItemRow key={c.id} item={c} depth={depth+1} onEdit={onEdit} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onIndent={onIndent} onOutdent={onOutdent} onDuplicate={onDuplicate} onRemove={onRemove} onToggle={onToggle} />)}
        </div>
      )}
    </div>
  )
}
