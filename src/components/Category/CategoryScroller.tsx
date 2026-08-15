import React from 'react'
import Link from 'next/link'
import type { Category } from '../../types/models'

const CategoryScroller = ({ categories }: { categories: Category[] }) => {
  return (
    <div className="mt-5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      <div className="flex gap-2.5 overflow-x-auto pb-2 hide-scrollbar lg:justify-start">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug || c.id}`}
            className="min-w-[132px] flex-shrink-0 border border-black/10 bg-white/60 px-5 py-4 text-center text-sm font-semibold text-charcoal shadow-[0_5px_16px_rgba(34,34,34,0.03)] transition hover:border-mocha/30 hover:bg-cream focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default CategoryScroller
