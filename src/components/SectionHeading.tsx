import React from 'react'

type Props = {
  title: string
  subtitle?: string
}

const SectionHeading = ({ title, subtitle }: Props) => (
  <div className="flex items-end justify-between gap-6 border-b border-black/10 pb-3 sm:pb-4">
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold text-charcoal sm:text-2xl md:text-[28px]">{title}</h2>
      {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-taupe">{subtitle}</p>}
    </div>
    <span className="hidden h-px w-12 bg-mocha/50 sm:block" aria-hidden="true" />
  </div>
)

export default SectionHeading
