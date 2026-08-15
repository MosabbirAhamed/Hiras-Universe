import React from 'react'

const items = [
  { title: 'Premium quality', desc: 'Thoughtfully selected essentials', icon: '✦' },
  { title: 'Fast delivery', desc: 'Across all 64 districts', icon: '→' },
  { title: 'Secure payment', desc: 'COD and mobile banking', icon: '○' },
  { title: 'Easy returns', desc: 'Simple 7-day exchange', icon: '↻' }
]

const TrustSection = () => {
  return (
    <div className="grid grid-cols-2 gap-3 border-y border-black/10 py-5 sm:gap-4 sm:py-6 md:grid-cols-4">
      {items.map((it) => (
        <div key={it.title} className="flex gap-3 px-1 sm:px-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-sm font-semibold text-mocha" aria-hidden="true">{it.icon}</span>
          <div>
            <div className="text-xs font-semibold capitalize text-charcoal sm:text-sm">{it.title}</div>
            <div className="mt-1 text-[11px] leading-4 text-taupe">{it.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrustSection
