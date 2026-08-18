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
    <footer className="mt-auto w-full border-t border-[var(--color-border)] bg-white text-[#222222]">
      <div className="site-container py-12 sm:py-16">
        {/* Main 5-column grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-10">

          {/* Col 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex flex-col">
              <span className="font-serif text-[20px] font-bold tracking-tight text-[#181817]">
                Hira&apos;s Universe
              </span>
              <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.28em] text-[var(--color-muted)]">
                Tradition. Refined.
              </span>
            </Link>
            <p className="mt-4 text-[12.5px] leading-relaxed text-[#666660]">
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
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5EFE6] text-[#6B4F3B] transition-colors hover:bg-[#6B4F3B] hover:text-white"
                  >
                    <Icon size={13} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Col 2: Shop */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#181817]">
              Shop
            </h3>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-[#666660]">
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
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#181817]">
              Customer Care
            </h3>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-[#666660]">
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
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#181817]">
              About
            </h3>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-[#666660]">
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
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#181817]">
              Help
            </h3>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-[#666660]">
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
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6 text-[11.5px] text-[var(--color-muted)] sm:flex-row">
          <span>
            {settings?.footerText || `© ${new Date().getFullYear()} Hira's Universe. All rights reserved.`}
          </span>

          {/* Payment Methods Badges */}
          <div className="flex items-center gap-2">
            <span className="rounded border border-[#E0D9D0] bg-[#FAFAF8] px-2 py-0.5 text-[10px] font-bold text-[#E2136E]">
              bKash
            </span>
            <span className="rounded border border-[#E0D9D0] bg-[#FAFAF8] px-2 py-0.5 text-[10px] font-bold text-[#1A1F71]">
              VISA
            </span>
            <span className="rounded border border-[#E0D9D0] bg-[#FAFAF8] px-2 py-0.5 text-[10px] font-bold text-[#EB001B]">
              Mastercard
            </span>
            <span className="rounded border border-[#E0D9D0] bg-[#FAFAF8] px-2 py-0.5 text-[10px] font-bold text-[#F6921E]">
              Nagad
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
