import React from 'react'

type Props = {
  title: string
  subtitle?: string
}

const SectionHeading = ({ title, subtitle }: Props) => (
  <div className="flex items-baseline justify-between">
    <div>
      <h2 className="text-lg md:text-2xl font-medium text-charcoal">{title}</h2>
      {subtitle && <p className="text-sm text-taupe mt-1">{subtitle}</p>}
    </div>
  </div>
)

export default SectionHeading
