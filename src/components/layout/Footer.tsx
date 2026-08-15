import React from 'react'
import { getNavigation } from '../../lib/repositories/fileRepo'
import Link from 'next/link'

export const Footer = async () => {
  const nav = await getNavigation()

  const footer = (nav || [])
    .filter((n: any) => n.location === 'footer' && n.active)
    .sort((a: any, b: any) => a.order - b.order)

  return (
    <footer className="w-full border-t border-cream bg-ivory mt-16">
      <div className="site-container px-4 py-8">

        {/* Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {footer.length ? (
            footer.map((col: any) => (
              <div key={col.id} className="space-y-2">

                <h4 className="font-medium text-charcoal">
                  {col.label}
                </h4>

                {Array.isArray(col.children) && col.children.length > 0 && (
                  <ul className="space-y-1 text-xs text-taupe">
                    {col.children.map((c: any) => (
                      <li key={c.id}>
                        <Link
                          href={c.url || '#'}
                          className="hover:text-charcoal transition"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

              </div>
            ))
          ) : (
            <div className="space-y-2">

              <h4 className="font-medium text-charcoal">
                Customer Care
              </h4>

              <ul className="space-y-1 text-xs text-taupe">
                <li>
                  <Link
                    href="/track-order"
                    className="hover:text-charcoal transition"
                  >
                    Track Order
                  </Link>
                </li>

                <li>
                  <Link
                    href="/products"
                    className="hover:text-charcoal transition"
                  >
                    Browse Collection
                  </Link>
                </li>
              </ul>

            </div>
          )}

        </div>

        {/* Copyright */}
        <div className="mt-8 pt-5 border-t border-cream text-center text-xs text-taupe">
          © {new Date().getFullYear()} Hira&apos;s Universe
        </div>

      </div>
    </footer>
  )
}

export default Footer