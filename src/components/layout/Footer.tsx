import React from 'react'
import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { getSettings } from '../../lib/repositories/fileRepo'

const shopLinks = [
  { label: 'Women', url: '/collections/women' },
  { label: 'Men', url: '/collections/men' },
  { label: 'Tupi', url: '/category/tupi' },
  { label: 'Collections', url: '/category' },
  { label: 'Shop All', url: '/products' },
]

const customerCareLinks = [
  { label: 'Track Order', url: '/track-order' },
  { label: 'Shipping & Delivery', url: '/track-order' },
  { label: 'Returns & Exchanges', url: '/track-order' },
  { label: 'FAQs', url: '/track-order' },
  { label: 'Contact Us', url: '/track-order' },
]

const aboutLinks = [
  { label: 'Our Story', url: '/products' },
  { label: 'Quality & Craftsmanship', url: '/products' },
  { label: 'Sustainability', url: '/products' },
  { label: 'Blog', url: '/products' },
]

const helpLinks = [
  { label: 'Privacy Policy', url: '/products' },
  { label: 'Terms & Conditions', url: '/products' },
  { label: 'Return Policy', url: '/products' },
  { label: 'Size Guide', url: '/products' },
]

const socialIcons = [
  { key: 'facebook', label: 'Facebook', defaultUrl: 'https://facebook.com', Icon: FaFacebookF },
  { key: 'instagram', label: 'Instagram', defaultUrl: 'https://instagram.com', Icon: FaInstagram },
  { key: 'tiktok', label: 'TikTok', defaultUrl: 'https://tiktok.com', Icon: FaTiktok },
  { key: 'youtube', label: 'YouTube', defaultUrl: 'https://youtube.com', Icon: FaYoutube },
] as const

export const Footer = async () => {
  const settings = await getSettings()
  const social = settings?.social || {}

  return (
    <footer className="mt-auto w-full border-t border-[#34322e] bg-[var(--color-footer-background)] text-[var(--color-footer-text)]">
      <div className="site-container py-10 sm:py-12">
        {/* Main 5-column grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-10">

          {/* Col 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex flex-col">
              <span className="font-serif text-[20px] font-bold tracking-tight text-[var(--color-footer-text)]">
                Hira&apos;s Universe
              </span>
              <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.28em] text-[var(--color-footer-text)]/60">
                Tradition. Refined.
              </span>
            </Link>
            <p className="mt-4 text-[12.5px] leading-relaxed text-[var(--color-footer-text)]/65">
              {settings?.description || 'Modest fashion that inspires confidence and honors tradition.'}
            </p>
            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-2">
              {socialIcons.map(({ key, label, defaultUrl, Icon }) => {
                const url = (social as any)[key] || defaultUrl
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#4a4741] text-[var(--color-footer-text)]/80 transition-colors hover:bg-[var(--color-footer-text)] hover:text-[#1c1c1a]"
                  >
                    <Icon size={13} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Col 2: Shop */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-footer-text)]">
              Shop
            </h3>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-[var(--color-footer-text)]/65">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.url} className="transition-colors hover:text-[#181817]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-footer-text)]">
              Customer Care
            </h3>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-[var(--color-footer-text)]/65">
              {customerCareLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.url} className="transition-colors hover:text-[#181817]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: About */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-footer-text)]">
              About
            </h3>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-[var(--color-footer-text)]/65">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.url} className="transition-colors hover:text-[#181817]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Help */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-footer-text)]">
              Help
            </h3>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-[var(--color-footer-text)]/65">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.url} className="transition-colors hover:text-[#181817]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom copyright + payment icons */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#3a3833] pt-6 text-[11.5px] text-[var(--color-footer-text)]/55 sm:flex-row">
          <span>
            {settings?.footerText || `© ${new Date().getFullYear()} Hira's Universe. All rights reserved.`}
          </span>

          {/* Payment Methods Badges */}
          <div className="flex items-center gap-2">
            <span className="rounded border border-[#4a4741] bg-transparent px-2 py-0.5 text-[10px] font-bold text-[#f0b1ca]">
              bKash
            </span>
            <span className="rounded border border-[#4a4741] bg-transparent px-2 py-0.5 text-[10px] font-bold text-[#b9c7ee]">
              VISA
            </span>
            <span className="rounded border border-[#4a4741] bg-transparent px-2 py-0.5 text-[10px] font-bold text-[#f08b8b]">
              Mastercard
            </span>
            <span className="rounded border border-[#4a4741] bg-transparent px-2 py-0.5 text-[10px] font-bold text-[#f2bb76]">
              Nagad
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
