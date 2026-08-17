import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowUpRight } from 'react-icons/fi'

const EditorialBanner = () => {
  return (
    <div className="mt-6 overflow-hidden rounded-[18px] bg-[#626753] text-white">
      <div className="grid min-h-[420px] md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center p-7 sm:p-10 md:p-12 lg:p-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2cfaa]">The seasonal edit</p>
          <h3 className="mt-3 max-w-md font-serif text-4xl font-semibold leading-[1.06] sm:text-5xl">Timeless modesty, considered anew</h3>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/72 sm:text-base">
            Explore a considered selection of versatile pieces and everyday essentials from the current collection.
          </p>
          <div className="mt-7">
            <Link href="/products" className="storefront-button storefront-button--light gap-2">
              Explore the collection
              <FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="relative min-h-[300px] md:min-h-full">
          <Image
            src="/products/hero-1.webp"
            alt="A selection from the Hira's Universe collection"
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export default EditorialBanner
