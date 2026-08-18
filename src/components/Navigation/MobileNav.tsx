import React from 'react'
import Link from 'next/link'
import { getNavigation } from '../../lib/repositories/fileRepo'

export const MobileNav = async () => {
  const nav = await getNavigation()
  const items = (nav || []).filter((n: any) => n.mobileVisible !== false && n.active).sort((a: any, b: any) => a.order - b.order)
  return (
    <nav className="safe-area fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-header-background)] p-2 text-[var(--color-header-text)] md:hidden">
      <div className="mx-auto flex max-w-3xl justify-between px-2">
        {items.slice(0, 5).map((n: any) => (
          <Link
            key={n.id}
            href={n.url}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center px-2 text-center text-xs font-semibold text-[var(--color-header-text)] hover:text-[var(--color-accent)]"
          >
            {n.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default MobileNav
