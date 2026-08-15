import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

export { AdminLayout }
