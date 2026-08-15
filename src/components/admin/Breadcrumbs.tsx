"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Breadcrumbs(){
  const pathname = usePathname() || '/admin'
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length <= 1) return null
  const crumbs = parts.map((p,i)=> ({ label: p.replace(/[-_]/g,' '), href: '/' + parts.slice(0,i+1).join('/') }))
  return (
    <nav className="text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
      {crumbs.map((c,i)=> (
        <span key={c.href} className="inline-flex items-center">
          <Link href={c.href} className="hover:underline">{c.label}</Link>
          {i < crumbs.length-1 && <span className="px-2">/</span>}
        </span>
      ))}
    </nav>
  )
}
