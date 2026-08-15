import React from 'react'
import Link from 'next/link'
import type { Category } from '../../types/models'

const CategoryScroller = ({ categories }: { categories: Category[] }) => {
  return (
    <div className="mt-3 -mx-4 px-4 lg:mx-0 lg:px-0">
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar lg:justify-start">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug || c.id}`}
            className="min-w-[120px] flex-shrink-0 text-center rounded-lg bg-ivory border border-cream px-4 py-3 text-sm font-medium text-charcoal shadow-sm hover:bg-cream focus:outline-none focus:ring-2 focus:ring-gold transition"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default CategoryScroller
