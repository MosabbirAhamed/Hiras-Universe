import React from 'react'
import Link from 'next/link'

export const adminNavItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin' },
  { id: 'products', label: 'Products', href: '/admin/products' },
  { id: 'categories', label: 'Categories', href: '/admin/categories' },
  { id: 'orders', label: 'Orders', href: '/admin/orders' },
  { id: 'notifications', label: 'Notifications', href: '/admin/notifications' },
  { id: 'customers', label: 'Customers', href: '/admin/customers' },
  { id: 'media', label: 'Media Library', href: '/admin/media' },
  { id: 'pages', label: 'Pages', href: '/admin/pages' },
  { id: 'homepage', label: 'Homepage', href: '/admin/homepage' },
  { id: 'navigation', label: 'Navigation', href: '/admin/navigation' },
  { id: 'theme', label: 'Theme / Appearance', href: '/admin/theme' },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-100 bg-white md:block">
      <div className="sticky top-0 p-5 lg:p-6">
        <div className="mb-6 border-b border-cream pb-5">
          <div className="font-serif text-xl text-charcoal">{"Hira's Universe"}</div>
          <div className="mt-1 text-xs text-taupe">Store administration</div>
        </div>
        <nav className="space-y-1" aria-label="Admin navigation">
          {adminNavItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex min-h-10 items-center rounded px-3 py-2 text-sm text-gray-600 transition hover:bg-cream/40 hover:text-charcoal"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
