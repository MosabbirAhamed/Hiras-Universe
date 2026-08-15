import React from 'react'

const items = [
  { title: 'Premium Quality' },
  { title: 'Fast Delivery' },
  { title: 'Secure Payment' },
  { title: 'Easy Returns' }
]

const TrustSection = () => {
  return (
    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it) => (
        <div key={it.title} className="rounded-lg bg-ivory border border-cream p-4 text-center text-sm">
          <div className="font-medium text-charcoal">{it.title}</div>
        </div>
      ))}
    </div>
  )
}

export default TrustSection
