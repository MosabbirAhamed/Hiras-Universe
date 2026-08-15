import React from 'react'
import Image from 'next/image'

const EditorialBanner = () => {
  return (
    <div className="mt-3 rounded-lg overflow-hidden bg-cream">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 md:p-12 flex flex-col justify-center">
          <h3 className="text-2xl font-serif font-semibold text-charcoal">Timeless Modesty</h3>
          <p className="mt-3 text-sm md:text-base text-taupe max-w-lg">Discover seasonal editorials that celebrate modesty with refined tailoring and natural fabrics.</p>
          <div className="mt-6">
            <button className="px-5 py-3 rounded-md bg-ivory border border-cream">Explore Collection</button>
          </div>
        </div>
        <div className="relative h-56 md:h-auto">
          <Image src="/products/hero-1.webp" alt="Timeless Modesty" fill style={{ objectFit: 'cover' }} />
        </div>
      </div>
    </div>
  )
}

export default EditorialBanner
