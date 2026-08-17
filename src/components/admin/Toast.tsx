"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

type ToastType = 'success' | 'error'
type ToastState = { message: string; type: ToastType }
type ToastContextValue = { show: (_message: string, _type?: ToastType) => void }

const ToastCtx = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function show(message: string, type: ToastType = 'success') {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, type })
    timerRef.current = setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {toast && (
        <div
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded border px-4 py-3 text-sm shadow-lg ${toast.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-green-200 bg-green-50 text-green-800'
            }`}
        >
          {toast.message}
        </div>
      )}
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}

export default ToastProvider
