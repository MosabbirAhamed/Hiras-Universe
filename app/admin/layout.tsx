import React from 'react'
import AdminLayout from '../../src/components/admin/AdminLayout'
import ToastProvider from '../../src/components/admin/Toast'

export const metadata = { title: 'Admin - Hira\'s Universe' }

export default function AdminRootLayout({ children }: { children: React.ReactNode }){
  return (
    <ToastProvider>
      <AdminLayout>{children}</AdminLayout>
    </ToastProvider>
  )
}
