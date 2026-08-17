import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowUpRight, FiCreditCard, FiMapPin, FiPackage } from 'react-icons/fi'

type HeroProps = {
  headline?: string
  sub?: string
  image?: string
}

const services = [
  { title: 'Bangladesh delivery', detail: 'Available across all 64 districts', Icon: FiMapPin },
  { title: 'Flexible payment', detail: 'Cash on delivery and mobile banking', Icon: FiCreditCard },
  { title: 'Order visibility', detail: 'Track your order from dispatch to delivery', Icon: FiPackage }
]

export const Hero = ({
  headline = 'Elegance in\nModesty',
  sub = 'Curated modest fashion and timeless essentials crafted for comfort, confidence and grace.',
  image = '/products/hero-1.webp'
}: HeroProps) => {
  return (
    <section className="space-y-4 pt-3 sm:space-y-5 sm:pt-5">
      <div className="relative min-h-[520px] overflow-hidden rounded-[18px] bg-[#302c28] sm:min-h-[570px] lg:min-h-[610px]">
        <Image
          src={image || '/products/hero-1.webp'}
          alt="Hira's Universe modest fashion collection"
          fill
          priority
          sizes="(max-width: 1400px) 100vw, 1320px"
          className="object-cover object-[62%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-black/30 sm:bg-black/20" aria-hidden="true" />
        <div className="absolute inset-y-0 left-0 w-full bg-[#242321]/45 sm:w-[68%] md:w-[58%] lg:w-[48%]" aria-hidden="true" />

        <div className="relative z-10 flex min-h-[520px] max-w-[700px] flex-col justify-end px-6 py-9 text-white sm:min-h-[570px] sm:px-10 sm:py-12 md:justify-center md:px-14 lg:min-h-[610px] lg:px-16 xl:px-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e1c594] sm:text-xs">
            A considered wardrobe
          </p>
          <h1 className="mt-4 max-w-[620px] whitespace-pre-line font-serif text-[42px] font-semibold leading-[1.02] tracking-[-0.02em] text-white sm:text-6xl lg:text-[72px]">
            {headline}
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/82 sm:mt-6 sm:text-[17px] sm:leading-7">
            {sub}
          </p>
          <div className="mt-7 flex flex-wrap gap-3 sm:mt-9">
            <Link href="/products" className="storefront-button storefront-button--light gap-2">
              Shop all
              <FiArrowUpRight aria-hidden="true" />
            </Link>
            <Link
              href="/category"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/55 px-6 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:border-white hover:bg-white hover:text-charcoal"
            >
              Browse categories
            </Link>
          </div>
        </div>
      </div>

      <div className="grid overflow-hidden rounded-[18px] border border-black/10 bg-white/60 sm:grid-cols-3">
        {services.map(({ title, detail, Icon }, index) => (
          <div
            key={title}
            className={`flex min-h-[84px] items-center gap-3.5 px-4 py-4 sm:px-5 ${index ? 'border-t border-black/10 sm:border-l sm:border-t-0' : ''}`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9e1d5] text-mocha">
              <Icon size={17} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-charcoal">{title}</p>
              <p className="mt-1 text-xs leading-5 text-charcoal/58">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Hero
