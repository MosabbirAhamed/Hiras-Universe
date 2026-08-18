import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

type HeroProps = {
  headline?: string
  sub?: string
  image?: string
}

const trustBadges = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Premium Quality',
    desc: 'Guaranteed',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'Trusted by',
    desc: '10k+ Customers',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'Fast & Reliable',
    desc: 'Delivery',
  },
]

export const Hero = ({
  headline = 'Elegance in\nModesty',
  sub = 'Curated modest fashion and timeless essentials for every moment.',
  image = '/products/hero-1.webp',
}: HeroProps) => {
  return (
    <section className="w-full" aria-label="Hero">
      {/* Hero Card — split layout */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-section-background)] shadow-[0_4px_32px_rgba(0,0,0,0.06)] lg:min-h-[500px]">
        <div className="grid h-full lg:min-h-[500px] lg:grid-cols-[0.9fr_1.1fr]">

          {/* Left — Text content */}
          <div className="relative z-10 flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-16 xl:px-16">
            {/* Eyebrow */}
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Timeless Modesty
            </p>

            {/* Headline */}
            <h1 className="mt-4 font-serif text-[38px] font-bold leading-[1.04] text-[var(--color-heading)] sm:text-[48px] lg:text-[54px] xl:text-[58px]">
              {headline.split('\n').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-[var(--color-muted)] sm:text-[15px]">
              {sub}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/collections/women"
                className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-button-background)] px-6 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-button-text)] transition hover:bg-[var(--color-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] focus:ring-offset-2"
              >
                Shop Women
              </Link>
              <Link
                href="/category/tupi"
                className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-card-background)] px-6 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-heading)] transition hover:border-[var(--color-heading)] hover:bg-[var(--color-main-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] focus:ring-offset-2"
              >
                Shop Tupi
              </Link>
            </div>

            {/* Slide dots */}
            <div className="mt-8 flex gap-2 lg:mt-10" aria-hidden="true">
              <span className="h-2 w-6 rounded-full bg-[var(--color-heading)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
            </div>
          </div>

          {/* Right — Product image */}
          <div className="relative min-h-[280px] sm:min-h-[340px] lg:min-h-full">
            <Image
              src={image || '/products/hero-1.webp'}
              alt="Hira's Universe modest fashion collection — elegant model in modest attire"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover object-center"
            />
            {/* Subtle left fade to blend with text panel on large screens */}
            <div
              className="absolute inset-y-0 left-0 hidden w-16 bg-[linear-gradient(to_right,var(--color-section-background),transparent)] lg:block"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-4 flex snap-x overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card-background)] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hide-scrollbar sm:grid sm:grid-cols-3 sm:divide-x sm:divide-[var(--color-border)] sm:overflow-hidden">
        {trustBadges.map(({ icon, title, desc }) => (
          <div key={title} className="flex min-w-[230px] snap-start items-center gap-3 px-4 py-4 sm:min-w-0 sm:px-5 sm:py-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-section-background)] text-[var(--color-primary)]">
              {icon}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-[var(--color-heading)] sm:text-xs">
                {title}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-[var(--color-muted)] sm:text-[11px]">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Hero
