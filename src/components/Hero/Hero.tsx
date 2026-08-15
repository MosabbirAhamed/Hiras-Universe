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
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  },
  {
    title: 'Fast & Reliable Delivery',
    desc: 'All 64 districts in Bangladesh',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    )
  },
  {
    title: 'Easy Returns',
    desc: 'Hassle-free 7-day exchange',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
      </svg>
    )
  }
]

export const Hero = ({
  headline = 'Elegance in\nModesty',
  sub = 'Curated modest fashion and timeless essentials crafted for comfort, confidence and grace.',
  image = '/products/hero-1.webp'
}: HeroProps) => {
  return (
    <section className="pt-4 sm:pt-6 space-y-6">

      {/* =====================================================
          HERO
      ====================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-cream min-h-[430px] sm:min-h-[480px] md:min-h-[500px] lg:min-h-[520px]">

        {/* Full Clear Background Image */}
        <div className="absolute inset-0">
          <Image
            src={image || '/products/hero-1.webp'}
            alt="Hira's Universe Modest Fashion"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* =================================================
            TEXT CONTENT
            Image-এর empty left side-এর উপর থাকবে
        ================================================== */}
        <div className="relative z-10 min-h-[430px] sm:min-h-[480px] md:min-h-[500px] lg:min-h-[520px]">

          <div className="h-full w-full md:w-[58%] lg:w-[55%] p-6 sm:p-10 md:p-12 lg:p-16 xl:p-20 flex flex-col justify-center">

            {/* Label */}
            <div className="mb-3 sm:mb-4">
              <span className="text-2xs sm:text-xs font-semibold uppercase tracking-[0.2em] text-mocha/90 font-sans">
                TIMELESS MODESTY
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-charcoal leading-[1.08] tracking-tight whitespace-pre-line">
              {headline}
            </h1>

            {/* Description */}
            <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-taupe leading-relaxed max-w-xl font-sans">
              {sub}
            </p>

            {/* Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">

              <Link
                href="/collections/women"
                className="
                  px-6 sm:px-8
                  py-3.5 sm:py-4
                  bg-mocha
                  text-ivory
                  text-xs sm:text-sm
                  font-semibold
                  tracking-wider
                  uppercase
                  rounded-md
                  hover:opacity-90
                  transition
                  inline-flex
                  items-center
                  justify-center
                "
              >
                SHOP WOMEN
              </Link>

              <Link
                href="/collections/men"
                className="
                  px-6 sm:px-8
                  py-3.5 sm:py-4
                  bg-white
                  border
                  border-cream
                  text-charcoal
                  text-xs sm:text-sm
                  font-semibold
                  tracking-wider
                  uppercase
                  rounded-md
                  hover:bg-cream/60
                  transition
                  inline-flex
                  items-center
                  justify-center
                "
              >
                SHOP MEN
              </Link>

            </div>

          </div>
        </div>

      </div>


      {/* =====================================================
          BENEFITS
      ====================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">

        {benefits.map((b, i) => (
          <div
            key={i}
            className="
              bg-white/80
              border
              border-cream
              rounded-xl
              p-4 sm:p-5
              flex
              flex-col
              sm:flex-row
              items-center
              sm:items-start
              text-center
              sm:text-left
              gap-3
              hover:border-mocha/30
              transition
            "
          >

            {/* Icon */}
            <div
              className="
                w-10
                h-10
                rounded-full
                bg-ivory
                border
                border-cream
                flex
                items-center
                justify-center
                text-mocha
                flex-shrink-0
              "
            >
              {b.icon}
            </div>

            {/* Text */}
            <div>
              <div className="text-xs sm:text-sm font-serif font-bold text-charcoal">
                {b.title}
              </div>

              <div className="text-2xs sm:text-xs text-taupe mt-0.5 font-sans leading-relaxed">
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