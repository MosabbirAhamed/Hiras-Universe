import React from 'react'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

type Props = {
  title: string
  subtitle?: string
  eyebrow?: string
  href?: string
  linkLabel?: string
}

const SectionHeading = ({ title, subtitle, eyebrow = 'The edit', href, linkLabel = 'View all' }: Props) => (
  <div className="flex items-end justify-between gap-5 border-b border-black/10 pb-4 sm:pb-5">
    <div className="max-w-2xl">
      <p className="storefront-eyebrow">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-[28px] font-semibold leading-tight text-charcoal sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-xl text-sm leading-6 text-charcoal/58">{subtitle}</p> : null}
    </div>
    {href ? (
      <Link href={href} className="storefront-link mb-1 hidden items-center gap-2 sm:inline-flex">
        {linkLabel}
        <FiArrowRight aria-hidden="true" />
      </Link>
    ) : (
      <span className="mb-2 hidden h-px w-14 bg-mocha/45 sm:block" aria-hidden="true" />
    )}
  </div>
)

export default SectionHeading
