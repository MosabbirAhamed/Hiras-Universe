"use client"
import React, { useState } from 'react'
import GlobalSearch from './GlobalSearch'
import NotificationsDrawer from './NotificationsDrawer'
import ProfileMenu from './ProfileMenu'
import Breadcrumbs from './Breadcrumbs'

export default function Topbar() {
  const [notifOpen, setNotifOpen] = useState(false)
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="md:hidden">☰</button>
        <div className="text-sm text-gray-600">Admin</div>
        <div className="hidden md:block ml-6">
          <Breadcrumbs />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button title="Search (⌘/Ctrl+K)" onClick={()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'k',metaKey:true}))} className="px-3 py-2 border rounded hidden sm:inline">Search</button>
        <button onClick={()=>setNotifOpen(true)} className="p-2">🔔</button>
        <ProfileMenu />
      </div>
      <GlobalSearch />
      <NotificationsDrawer open={notifOpen} onClose={()=>setNotifOpen(false)} />
    </header>
  )
}
