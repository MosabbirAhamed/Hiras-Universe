import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const cards = [
  {
    id: 'promo-new-arrivals',
    eyebrow: 'New Arrivals',
    title: 'Fresh pieces just in',
    href: '/products',
    cta: 'Explore Now',
    image: '/products/hero-1.webp',
    badge: null,
  },
  {
    id: 'promo-tupi',
    eyebrow: 'Tupi Collection',
    title: 'Authentic. Comfortable. Timeless.',
    href: '/category/tupi',
    cta: 'Shop Now',
    image: '/products/hero-1.webp',
    badge: null,
  },
  {
    id: 'promo-offers',
    eyebrow: 'Special Offers',
    title: 'Up to 40% OFF on selected items',
    href: '/products',
    cta: 'Shop Now',
    image: '/products/hero-1.webp',
    badge: 'Up to 40% OFF',
  },
]

const PromotionalCards = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={card.href}
          className="group relative overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-section-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] focus:ring-offset-2"
          style={{ minHeight: '200px' }}
          aria-label={`${card.eyebrow} — ${card.cta}`}
        >
          {/* Background image */}
          <Image
            src={card.image}
            alt={card.eyebrow}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.18) 100%)' }}
            aria-hidden="true"
          />

          {/* Badge */}
          {card.badge && (
            <div className="absolute right-3 top-3 rounded-full bg-[var(--color-sale)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
              {card.badge}
            </div>
          )}

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/80">
              {card.eyebrow}
            </p>
            <h3 className="mt-1.5 font-serif text-[15px] font-semibold leading-snug text-white sm:text-[16px]">
              {card.title}
            </h3>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90 transition-gap group-hover:gap-2.5">
              {card.cta}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default PromotionalCards
