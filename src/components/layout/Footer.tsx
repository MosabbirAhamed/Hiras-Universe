import React from 'react'
import { getNavigation } from '../../lib/repositories/fileRepo'
import Link from 'next/link'

export const Footer = async () => {
  const nav = await getNavigation()
  const footer = (nav || []).filter((n:any)=>n.location==='footer' && n.active).sort((a:any,b:any)=>a.order-b.order)
  return (
    <footer className="border-t border-cream mt-10 bg-ivory">
      <div className="site-container px-4 py-6 text-sm text-taupe">
        <div className="grid grid-cols-2 gap-3">
          {footer.length ? footer.map((col:any)=> (
            <div key={col.id}>
              <h4 className="font-medium">{col.label}</h4>
              <ul className="mt-2 text-xs text-taupe">
                {Array.isArray(col.children) ? col.children.map((c:any)=>(<li key={c.id}><Link href={c.url}>{c.label}</Link></li>)) : null}
              </ul>
            </div>
          )) : (
            <div className="space-y-1">
              <h4 className="font-medium text-charcoal">Customer Care</h4>
              <ul className="mt-2 text-xs text-taupe space-y-1">
                <li><Link href="/track-order" className="hover:text-charcoal transition">Track Order</Link></li>
                <li><Link href="/products" className="hover:text-charcoal transition">Browse Collection</Link></li>
              </ul>
            </div>
          )}
        </div>
        <div className="mt-4 text-center text-xs text-taupe">© Hira&apos;s Universe</div>
      </div>
    </footer>
  )
}

export default Footer
