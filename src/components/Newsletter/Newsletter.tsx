import React from 'react'

const Newsletter = () => {
  return (
    <div className="mt-4 rounded-lg bg-ivory border border-cream p-4 md:p-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-medium text-charcoal">Join the Hira&apos;s Universe</h3>
          <p className="text-sm text-taupe mt-1">Be the first to know about new arrivals and exclusive collections.</p>
        </div>
        <form className="mt-3 md:mt-0 flex gap-2 w-full md:w-auto">
          <label className="sr-only" htmlFor="newsletter-email">Email</label>
          <input id="newsletter-email" aria-label="Email" type="email" placeholder="Your email" className="flex-1 md:flex-none rounded-md border border-cream px-3 py-2" />
          <button className="rounded-md bg-mocha text-ivory px-4 py-2 min-h-[44px]">Subscribe</button>
        </form>
      </div>
    </div>
  )
}

export default Newsletter
