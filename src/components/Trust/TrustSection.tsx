import React from 'react'
import { FiCreditCard, FiMapPin, FiPackage, FiSearch } from 'react-icons/fi'

const items = [
  { title: 'Considered selection', desc: 'A focused edit of modest essentials', Icon: FiSearch },
  { title: 'Nationwide delivery', desc: 'Service across all 64 districts', Icon: FiMapPin },
  { title: 'Flexible payment', desc: 'Cash on delivery and mobile banking', Icon: FiCreditCard },
  { title: 'Order tracking', desc: 'Check progress with your order details', Icon: FiPackage }
]

const TrustSection = () => {
  return (
    <div className="grid overflow-hidden rounded-[18px] border border-black/10 bg-white/65 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ title, desc, Icon }, index) => (
        <div
          key={title}
          className={`flex min-h-[128px] gap-4 p-5 sm:p-6 ${index ? 'border-t border-black/10 sm:[&:nth-child(2)]:border-l sm:[&:nth-child(2)]:border-t-0 lg:border-l lg:border-t-0' : ''} ${index === 2 ? 'sm:border-t lg:border-t-0' : ''}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9e1d5] text-mocha" aria-hidden="true">
            <Icon size={17} />
          </span>
          <div>
            <h3 className="font-serif text-lg font-semibold text-charcoal">{title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-charcoal/58">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrustSection
