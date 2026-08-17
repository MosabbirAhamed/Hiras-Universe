import React from 'react'
import { FiMail } from 'react-icons/fi'

const Newsletter = () => {
  return (
    <section className="overflow-hidden rounded-[18px] bg-[#7d4038] px-6 py-9 text-white sm:px-10 sm:py-11 lg:px-14">
      <div className="grid items-center gap-7 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#edd3bc]">Collection notes</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">A quieter way to discover what is new</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Email updates are being prepared. The latest available pieces can always be found in the current collection.</p>
        </div>
        <div className="flex min-h-14 items-center gap-3 rounded-full border border-white/25 bg-white/10 px-5 text-white/75">
          <FiMail className="shrink-0" aria-hidden="true" />
          <span className="text-sm">Email updates coming soon</span>
        </div>
      </div>
    </section>
  )
}

export default Newsletter
