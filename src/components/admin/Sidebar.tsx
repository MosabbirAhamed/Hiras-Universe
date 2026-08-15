import React from 'react'
import Link from 'next/link'

const items = [
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
    <aside className="w-64 hidden md:block bg-white border-r border-gray-100">
      <div className="p-6">
        <div className="font-serif text-xl mb-6">Hira&apos;s Universe</div>
        <nav className="space-y-1">
          {items.map(it => (
            <Link key={it.id} href={it.href} className="block px-3 py-2 rounded hover:bg-gray-50">{it.label}</Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
