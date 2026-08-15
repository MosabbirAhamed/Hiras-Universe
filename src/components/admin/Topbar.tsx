"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import GlobalSearch from './GlobalSearch'
import NotificationsDrawer from './NotificationsDrawer'
import ProfileMenu from './ProfileMenu'
import Breadcrumbs from './Breadcrumbs'
import AdminDrawer from './AdminDrawer'
import { adminNavItems } from './Sidebar'

export default function Topbar() {
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open admin navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded border border-gray-200 text-lg text-gray-700 transition hover:bg-gray-50 md:hidden"
          >
            <span aria-hidden="true">☰</span>
          </button>
          <div className="hidden text-sm text-gray-500 sm:block">Admin</div>
          <div className="hidden min-w-0 md:block">
            <Breadcrumbs />
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            title="Search (Ctrl+K)"
            aria-label="Open search"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="hidden min-h-10 rounded border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 sm:inline-flex"
          >
            Search
          </button>
          <button
            type="button"
            aria-label="Open notifications"
            onClick={() => setNotifOpen(true)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded text-lg text-gray-600 transition hover:bg-gray-50"
          >
            <span aria-hidden="true">🔔</span>
          </button>
          <ProfileMenu />
        </div>
        <GlobalSearch />
        <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
      </header>
      <AdminDrawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Store administration">
        <nav className="space-y-1" aria-label="Admin mobile navigation">
          {adminNavItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center rounded px-3 py-2 text-sm text-gray-700 transition hover:bg-cream/40"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </AdminDrawer>
    </>
  )
}
