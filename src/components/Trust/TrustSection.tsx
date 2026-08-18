import React from 'react'

const trustItems = [
  {
    title: 'Secure Payments',
    desc: '100% safe & secure',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    title: 'Easy Returns',
    desc: '7-day return policy',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    ),
  },
  {
    title: 'Cash on Delivery',
    desc: 'Available nationwide',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: '24/7 Support',
    desc: "We're here to help",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
]

const TrustSection = () => {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="grid grid-cols-2 divide-y divide-[var(--color-border)] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        {trustItems.map(({ title, desc, icon }) => (
          <div key={title} className="flex items-center gap-3.5 p-4 sm:p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5EFE6] text-[#6B4F3B]" aria-hidden="true">
              {icon}
            </span>
            <div className="min-w-0">
              <h4 className="truncate font-serif text-[13px] font-bold text-[var(--color-heading)] sm:text-[14px]">
                {title}
              </h4>
              <p className="mt-0.5 truncate text-[11px] text-[var(--color-muted)]">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrustSection
