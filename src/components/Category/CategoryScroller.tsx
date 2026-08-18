import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Category } from '../../types/models'

type NavigationItem = {
  id?: string
  label: string
  url?: string
  active?: boolean
  location?: string
  order?: number
}

type Props = {
  categories: Category[]
  navigation?: NavigationItem[]
}

type CategoryLink = {
  id: string
  name: string
  href: string
  image: string
}

const fallbackImages: Record<string, string> = {
  women: '/products/hero-1.webp',
  men: '/products/signature-black-tupi.png',
  tupi: '/products/premium-cotton-tupi.png',
  hijab: '/products/hero-1.webp',
  collections: '/products/embroidered-prayer-tupi.png',
  'shop all': '/products/classic-white-tupi.png',
  'track order': '/products/signature-black-tupi.png',
}

const CategoryNavigation = ({ categories, navigation = [] }: Props) => {
  const visibleCategories = categories
    .filter((category) => category.active !== false && !category.parentId && category.featured !== false)
    .sort((a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)
    )

  const categoriesByName = new Map(
    visibleCategories.map((category) => [category.name.toLowerCase(), category])
  )
  const allItems: CategoryLink[] = []
  const seen = new Set<string>()

  const addItem = (item: Omit<CategoryLink, 'image'> & { image?: string }) => {
    const key = item.name.toLowerCase()
    if (seen.has(key)) return

    seen.add(key)
    allItems.push({
      ...item,
      image: item.image && item.image !== '/products/placeholder.svg'
        ? item.image
        : fallbackImages[key] || '/products/placeholder.svg',
    })
  }

  navigation
    .filter((item) => item.active !== false && (!item.location || item.location === 'header'))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .forEach((item) => {
      const category = categoriesByName.get(item.label.toLowerCase())
      addItem({
        id: item.id || `nav-${item.label}`,
        name: item.label,
        href: item.url || (category ? `/category/${category.slug || category.id}` : '/products'),
        image: category?.image,
      })
    })

  visibleCategories.forEach((category) => {
    addItem({
      id: category.id,
      name: category.name,
      href: `/category/${category.slug || category.id}`,
      image: category.image,
    })
  })

    ;[
      { id: 'category-collections', name: 'Collections', href: '/category' },
      { id: 'category-shop-all', name: 'Shop All', href: '/products' },
      { id: 'category-track-order', name: 'Track Order', href: '/track-order' },
    ].forEach(addItem)

  return (
    <nav className="-mx-4 px-4 sm:-mx-0 sm:px-0" aria-label="Shop by category">
      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 hide-scrollbar sm:gap-7 lg:justify-center lg:gap-9 lg:overflow-visible">
        {allItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex min-w-[88px] snap-start flex-col items-center gap-3 focus:outline-none"
            aria-label={item.name}
          >
            <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-section-background)] shadow-[0_3px_14px_rgba(0,0,0,0.07)] transition duration-300 group-hover:-translate-y-0.5 group-hover:border-[var(--color-primary)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:h-[96px] sm:w-[96px] lg:h-[104px] lg:w-[104px]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 88px, (max-width: 1024px) 96px, 104px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <span className="max-w-[104px] text-center text-[11px] font-semibold leading-tight text-[var(--color-heading)] transition-colors group-hover:text-[var(--color-primary)] sm:text-xs">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default CategoryNavigation
