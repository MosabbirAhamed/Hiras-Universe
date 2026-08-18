"use client"

import React, { useState } from 'react'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'subscribed'>('idle')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim()) {
      setStatus('subscribed')
      setEmail('')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section
      className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-6 sm:p-8 lg:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
      aria-labelledby="newsletter-heading"
    >
      <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        {/* Left text */}
        <div>
          <h2
            id="newsletter-heading"
            className="font-serif text-[22px] font-bold text-[var(--color-heading)] sm:text-[26px]"
          >
            Stay in the loop
          </h2>
          <p className="mt-1.5 max-w-lg text-[13.5px] leading-relaxed text-[var(--color-muted)]">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
        </div>

        {/* Right input form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row">
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 flex-1 rounded-[var(--radius-button)] border border-[#DCD6CE] bg-[#FBF9F6] px-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/70 focus:border-[#1A1A18] focus:bg-white focus:outline-none"
            aria-label="Email address for newsletter"
          />
          <button
            type="submit"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[#1A1A18] px-6 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#333330] focus:outline-none focus:ring-2 focus:ring-[#1A1A18] focus:ring-offset-2"
          >
            {status === 'subscribed' ? 'Subscribed ✓' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Newsletter
