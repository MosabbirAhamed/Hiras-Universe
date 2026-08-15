"use client"
import React, { useState } from 'react'

export default function NotificationsDrawer({ open, onClose }: { open: boolean, onClose: ()=>void }){
  const [items] = useState(() => [
    { id: '1', title: 'Order #1001 placed', time: '2m ago' },
    { id: '2', title: 'New user registered', time: '1h ago' }
  ])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-96 bg-white h-full p-4 border-l">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Notifications</h3>
          <button onClick={onClose} className="px-2">Close</button>
        </div>
        <div className="space-y-2 overflow-auto h-full">
          {items.map(it => (
            <div key={it.id} className="p-2 border rounded">
              <div className="text-sm font-medium">{it.title}</div>
              <div className="text-xs text-gray-500">{it.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
