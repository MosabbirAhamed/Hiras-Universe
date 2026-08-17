import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowUpRight } from 'react-icons/fi'
import type { Category } from '../../types/models'

const CategoryScroller = ({ categories }: { categories: Category[] }) => {
  if (!categories.length) return null

  return (
    <div className="-mx-4 mt-6 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      <div className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-3 hide-scrollbar lg:grid lg:grid-cols-4 lg:overflow-visible">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug || category.id}`}
            className="group relative min-h-[310px] w-[74vw] max-w-[310px] flex-none snap-start overflow-hidden rounded-[18px] bg-[#ded5c9] focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 sm:w-[280px] lg:w-auto lg:max-w-none"
          >
            <Image
              src={category.image || '/products/placeholder.svg'}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 74vw, (max-width: 1024px) 280px, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
              <span className="min-w-0">
                <span className="block font-serif text-2xl font-semibold leading-tight">{category.name}</span>
                {category.description ? (
                  <span className="mt-1.5 line-clamp-2 block text-xs leading-5 text-white/75">{category.description}</span>
                ) : null}
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/45 bg-black/10 transition-colors group-hover:bg-white group-hover:text-charcoal">
                <FiArrowUpRight aria-hidden="true" />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default CategoryScroller
