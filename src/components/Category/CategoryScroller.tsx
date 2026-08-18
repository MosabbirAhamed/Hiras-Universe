import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Category } from '../../types/models'

// Fixed extra navigation entries appended after dynamic categories
const EXTRA_LINKS = [
  {
    id: 'nav-shop-all',
    name: 'Shop All',
    href: '/products',
    image: null,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a4 4 0 00-8 0v2" />
      </svg>
    ),
  },
  {
    id: 'nav-track',
    name: 'Track Order',
    href: '/track-order',
    image: null,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
]

const CategoryNavigation = ({ categories }: { categories: Category[] }) => {
  const visibleCategories = categories.filter(c => c.active !== false)

  const allItems = [
    ...visibleCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      href: `/category/${cat.slug || cat.id}`,
      image: cat.image,
      icon: null,
    })),
    ...EXTRA_LINKS,
  ]

  return (
    <div className="-mx-4 px-4 sm:-mx-0 sm:px-0">
      <div className="flex gap-5 overflow-x-auto pb-2 hide-scrollbar sm:justify-center lg:overflow-visible">
        {allItems.map(item => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex min-w-[72px] flex-col items-center gap-2.5 focus:outline-none"
            aria-label={item.name}
          >
            {/* Circle */}
            <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-border)] bg-[var(--color-section-background)] transition-all duration-300 group-hover:border-[var(--color-primary)] group-hover:shadow-md sm:h-[80px] sm:w-[80px]">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <span className="text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-primary)]">
                  {item.icon}
                </span>
              )}
            </div>
            {/* Label */}
            <span className="max-w-[80px] text-center text-[11px] font-semibold leading-tight text-[var(--color-heading)] transition-colors group-hover:text-[var(--color-primary)]">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default CategoryNavigation
