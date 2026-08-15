import React from 'react'
import Link from 'next/link'
import { getNavigation } from '../../lib/repositories/fileRepo'

export const MobileNav = async () => {
  const nav = await getNavigation()
  const items = (nav || []).filter((n:any)=>n.mobileVisible !== false && n.active).sort((a:any,b:any)=>a.order-b.order)
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ivory border-t border-cream safe-area p-2 md:hidden">
      <div className="max-w-3xl mx-auto px-4 flex justify-between">
        {items.slice(0,5).map((n:any)=> <Link key={n.id} href={n.url}>{n.label}</Link>)}
      </div>
    </nav>
  )
}

export default MobileNav
