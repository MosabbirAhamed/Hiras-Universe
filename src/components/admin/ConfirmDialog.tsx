import React from 'react'

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }: { open: boolean, title?: string, message?: string, onCancel: ()=>void, onConfirm: ()=>void }){
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onCancel} />
      <div className="bg-white rounded shadow p-6 z-10 max-w-md">
        {title && <h3 className="font-medium mb-2">{title}</h3>}
        <div className="text-sm mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
        </div>
      </div>
    </div>
  )
}
