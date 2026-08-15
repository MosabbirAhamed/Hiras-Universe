"use client"
import React, { createContext, useContext, useState } from 'react'

const ToastCtx = createContext<any>(null)

export function ToastProvider({ children }: { children: React.ReactNode }){
  const [msg, setMsg] = useState<string|null>(null)
  function show(m:string){ setMsg(m); setTimeout(()=>setMsg(null), 3000) }
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {msg && <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded">{msg}</div>}
    </ToastCtx.Provider>
  )
}

export function useToast(){ return useContext(ToastCtx) }

export default ToastProvider
