import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Category } from '../../types/models'

const CategoryNavigation = ({ categories }: { categories: Category[] }) => {
  const visibleCategories = categories
    .filter((category) => category.active !== false && !category.parentId && category.featured !== false)
    .sort((a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)
    )

  const allItems = visibleCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    href: `/category/${cat.slug || cat.id}`,
    image: cat.image,
  }))

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
                <span className="font-serif text-xl text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-primary)]" aria-hidden="true">
                  {item.name.charAt(0)}
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
