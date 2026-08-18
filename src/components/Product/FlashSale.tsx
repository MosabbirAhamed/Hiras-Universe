"use client"

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product, Category } from '../../types/models'
import AddToBagButton from './AddToBagButton'

interface FlashSaleProps {
  products: Product[]
  categories: Category[]
}

function formatPrice(val: number) {
  return `Tk ${val.toLocaleString('en-US')}`
}

function calcDiscount(price: number, salePrice: number) {
  if (!salePrice || salePrice >= price) return null
  return Math.round(((price - salePrice) / price) * 100)
}

// Countdown: fires at end of day (00:00:00 of next day)
function getEndOfDay() {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return end.getTime()
}

function useCountdown() {
  // Keep SSR and the first client render neutral; live time starts after hydration.
  const [remaining, setRemaining] = useState<number | null>(null)
  useEffect(() => {
    const endTs = getEndOfDay()
    const updateRemaining = () => {
      setRemaining(Math.max(0, endTs - Date.now()))
    }

    updateRemaining()
    const id = setInterval(updateRemaining, 1000)
    return () => clearInterval(id)
  }, [])

  if (remaining === null) return { h: null, m: null, s: null }

  const totalSec = Math.floor(remaining / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return { h, m, s }
}

function Pad({ n }: { n: number | null }) {
  return <>{n === null ? '--' : String(n).padStart(2, '0')}</>
}

export default function FlashSale({ products, categories }: FlashSaleProps) {
  const { h, m, s } = useCountdown()

  const scrollRef = useRef<HTMLDivElement>(null)

  if (!products.length) return null

  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]))

  function scroll(dir: 'prev' | 'next') {
    if (!scrollRef.current) return
    const card = scrollRef.current.querySelector('article')
    const cardW = card ? card.offsetWidth + 16 : 220
    scrollRef.current.scrollBy({ left: dir === 'next' ? cardW * 2 : -cardW * 2, behavior: 'smooth' })
  }

  return (
    <section aria-labelledby="flash-sale-heading">
      {/* Section header */}
      <div className="mb-5 flex items-center gap-4 sm:gap-6">
        <h2
          id="flash-sale-heading"
          className="font-serif text-[22px] font-bold text-[var(--color-heading)] sm:text-[26px]"
        >
          Flash Sale
        </h2>

        {/* Countdown */}
        <div className="flex items-center gap-1 rounded-lg bg-[#E03D3D] px-3 py-1.5" aria-label="Sale ends in">
          <span className="min-w-[22px] text-center text-[13px] font-bold tabular-nums text-white">
            <Pad n={h} />
          </span>
          <span className="text-[13px] font-bold text-white/70">:</span>
          <span className="min-w-[22px] text-center text-[13px] font-bold tabular-nums text-white">
            <Pad n={m} />
          </span>
          <span className="text-[13px] font-bold text-white/70">:</span>
          <span className="min-w-[22px] text-center text-[13px] font-bold tabular-nums text-white">
            <Pad n={s} />
          </span>
        </div>

        <Link
          href="/products"
          className="ml-auto flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)] transition hover:text-[var(--color-heading)]"
        >
          View All
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Prev / Next arrows */}
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll('prev')}
            aria-label="Scroll left"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-heading)] transition hover:border-[var(--color-heading)] hover:bg-[var(--color-section-background)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll('next')}
            aria-label="Scroll right"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-heading)] transition hover:border-[var(--color-heading)] hover:bg-[var(--color-section-background)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Product carousel */}
      <div
        ref={scrollRef}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 hide-scrollbar sm:-mx-0 sm:px-0"
      >
        {products.map((product) => {
          const categoryName = product.categoryId ? categoryMap[product.categoryId] : undefined
          const discount = product.onSale && product.salePrice && product.price
            ? calcDiscount(product.price, product.salePrice)
            : null
          const displayPrice = product.salePrice ?? product.price
          const href = product.slug ? `/products/${product.slug}` : '/products'

          return (
            <article
              key={product.id}
              className="group relative flex w-[min(72vw,260px)] flex-none snap-start flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card-background)] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)] sm:w-[calc((100%_-_48px)/4)] lg:w-[calc((100%_-_64px)/5)] xl:w-[calc((100%_-_80px)/6)]"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-section-background)]">
                {product.primaryImage || product.images?.[0] ? (
                  <Link href={href} aria-label={`View ${product.name}`} className="absolute inset-0">
                    <Image
                      src={product.primaryImage || product.images?.[0] || ''}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 72vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </Link>
                ) : (
                  <Link href={href} aria-label={`View ${product.name}`} className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(145deg,var(--color-section-background),var(--color-surface))] px-4 text-center">
                    <span className="font-serif text-lg text-[var(--color-primary)]/70">{"Hira's Universe"}</span>
                    <span className="mt-2 text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">Image coming soon</span>
                  </Link>
                )}
                {/* Discount badge */}
                {discount && (
                  <div className="absolute left-2 top-2 rounded-full bg-[#E03D3D] px-2 py-1 text-[9px] font-bold text-white">
                    -{discount}%
                  </div>
                )}
                {/* Wishlist */}
                <button
                  type="button"
                  aria-label={`Add ${product.name} to wishlist`}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[var(--color-muted)] shadow-sm transition hover:text-[var(--color-wishlist)]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-3">
                {categoryName && (
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    {categoryName}
                  </p>
                )}
                <h3 className="line-clamp-2 font-serif text-[13px] font-semibold leading-snug text-[var(--color-heading)]">
                  <Link href={href} className="hover:text-[var(--color-primary)]">
                    {product.name}
                  </Link>
                </h3>
                <div className="mt-1.5 flex h-3.5 items-center gap-1" aria-label="Rated 5 out of 5">
                  <span className="text-[10px] leading-none text-[var(--color-rating)]" aria-hidden="true">★★★★★</span>
                  <span className="text-[9px] leading-none text-[var(--color-muted)]">(25)</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className={`text-sm font-bold ${product.salePrice ? 'text-[#E03D3D]' : 'text-[var(--color-heading)]'}`}>
                    {formatPrice(displayPrice)}
                  </span>
                  {product.salePrice && (
                    <span className="text-[11px] text-[var(--color-muted)] line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <div className="mt-auto pt-3">
                  {product.hasVariants ? (
                    <Link
                      href={href}
                      className="block w-full rounded-[var(--radius-button)] bg-[var(--color-heading)] py-2 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[var(--color-primary)]"
                      aria-label={`Select options for ${product.name}`}
                    >
                      Select Options
                    </Link>
                  ) : (
                    <AddToBagButton id={product.id} title={product.name} stock={product.stock} active={product.active} hasVariants={product.hasVariants} />
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
