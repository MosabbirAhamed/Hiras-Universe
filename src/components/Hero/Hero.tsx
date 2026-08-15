import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

type HeroProps = {
  headline?: string
  sub?: string
  image?: string
}

const benefits = [
  {
    title: 'Premium Quality',
    desc: 'Crafted with fine materials',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  },
  {
    title: 'Fast & Reliable Delivery',
    desc: 'All 64 districts in Bangladesh',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    )
  },
  {
    title: 'Secure Payment',
    desc: 'Cash on delivery & mobile banking',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    )
  },
  {
    title: 'Easy Returns',
    desc: 'Hassle-free 7-day exchange',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
      </svg>
    )
  }
]

export const Hero = ({
  headline = 'Elegance in\nModesty',
  sub = 'Curated modest fashion and timeless essentials crafted for comfort, confidence and grace.',
  image = '/products/hero-1.svg'
}: HeroProps) => {
  return (
    <section className="pt-4 sm:pt-6 space-y-6">
      {/* Hero Showcase Card */}
      <div className="overflow-hidden rounded-2xl bg-cream/70 border border-cream shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          {/* Text Content (7 cols on md) */}
          <div className="md:col-span-7 p-6 sm:p-10 md:p-14 lg:p-16 flex flex-col justify-center space-y-5">
            <div>
              <span className="text-2xs sm:text-xs font-semibold uppercase tracking-[0.2em] text-mocha/90 font-sans">
                TIMELESS MODESTY
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-charcoal leading-[1.15] mt-2 whitespace-pre-line">
                {headline}
              </h1>
            </div>

            <p className="text-sm sm:text-base text-taupe leading-relaxed max-w-lg font-sans">
              {sub}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/collections/women"
                className="px-6 sm:px-8 py-3.5 bg-mocha text-ivory text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-md hover:opacity-90 transition shadow-xs inline-block text-center"
              >
                SHOP WOMEN
              </Link>
              <Link
                href="/collections/men"
                className="px-6 sm:px-8 py-3.5 bg-white border border-cream text-charcoal text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-md hover:bg-cream/60 transition shadow-2xs inline-block text-center"
              >
                SHOP MEN
              </Link>
            </div>
          </div>

          {/* Editorial Image Area (5 cols on md) */}
          <div className="md:col-span-5 relative min-h-[300px] md:min-h-[460px] bg-cream">
            <Image
              src={image || '/products/hero-1.svg'}
              alt="Hira's Universe Modest Fashion"
              fill
              priority
              style={{ objectFit: 'cover' }}
              className="transition duration-500"
            />
          </div>
        </div>
      </div>

      {/* 4 Benefits Value Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {benefits.map((b, i) => (
          <div
            key={i}
            className="bg-white/80 border border-cream rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 shadow-2xs hover:border-mocha/30 transition"
          >
            <div className="w-10 h-10 rounded-full bg-ivory border border-cream flex items-center justify-center text-mocha flex-shrink-0">
              {b.icon}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-serif font-bold text-charcoal">
                {b.title}
              </div>
              <div className="text-2xs text-taupe mt-0.5 font-sans">
                {b.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Hero
