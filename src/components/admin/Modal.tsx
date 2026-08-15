import React from 'react'

export default function Modal({ open, onClose, title, children }: { open: boolean, onClose: ()=>void, title?: string, children?: React.ReactNode }){
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="bg-white rounded shadow-lg max-w-2xl w-full z-10 p-6">
        {title && <div className="font-medium mb-4">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  )
}
