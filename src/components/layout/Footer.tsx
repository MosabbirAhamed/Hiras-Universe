import React from 'react'
import Link from 'next/link'
import { FiArrowUpRight, FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { getNavigation, getSettings } from '../../lib/repositories/fileRepo'

const fallbackLinks = [
  { label: 'Shop all', url: '/products' },
  { label: 'Browse categories', url: '/category' }
]

const careLinks = [
  { label: 'Track your order', url: '/track-order' },
  { label: 'Shopping bag', url: '/cart' },
  { label: 'Browse categories', url: '/category' }
]

const socialIcons = [
  { key: 'facebook', label: 'Facebook', Icon: FaFacebookF },
  { key: 'instagram', label: 'Instagram', Icon: FaInstagram },
  { key: 'tiktok', label: 'TikTok', Icon: FaTiktok },
  { key: 'youtube', label: 'YouTube', Icon: FaYoutube }
] as const

export const Footer = async () => {
  const [nav, settings] = await Promise.all([getNavigation(), getSettings()])
  const navigationLinks = (nav || [])
    .filter((item: any) => item.active && item.url)
    .sort((a: any, b: any) => a.order - b.order)
    .slice(0, 5)
    .map((item: any) => ({ label: item.label, url: item.url }))
  const shopLinks = navigationLinks.length ? navigationLinks : fallbackLinks
  const social = settings?.social || {}
  const configuredSocial = socialIcons.filter(({ key }) => Boolean(social[key]?.trim()))

  return (
    <footer className="mt-auto w-full bg-[var(--color-footer-background)] text-[var(--color-footer-text)]">
      <div className="site-container py-12 sm:py-16 lg:py-20">
        <div className="grid gap-10 border-b border-current/15 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_1.1fr] lg:gap-14 lg:pb-16">
          <div className="max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">Modest essentials</p>
            <Link href="/" className="mt-3 inline-block font-serif text-3xl font-semibold text-[var(--color-footer-text)] transition-opacity hover:opacity-80">
              {settings?.storeName || "Hira's Universe"}
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--color-footer-text)]/65">
              {settings?.description || 'A considered selection of modest fashion and timeless essentials for everyday life.'}
            </p>
            <Link href="/products" className="mt-7 inline-flex items-center gap-2 border-b border-current/40 pb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-footer-text)] transition-opacity hover:opacity-75">
              Shop the collection
              <FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>

          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-footer-text)]">Explore</h2>
            <ul className="mt-5 space-y-3.5 text-sm text-[var(--color-footer-text)]/65">
              {shopLinks.map((link) => (
                <li key={link.url}><Link href={link.url} className="text-inherit transition-opacity hover:opacity-75">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-footer-text)]">Customer care</h2>
            <ul className="mt-5 space-y-3.5 text-sm text-[var(--color-footer-text)]/65">
              {careLinks.map((link) => (
                <li key={link.url}><Link href={link.url} className="text-inherit transition-opacity hover:opacity-75">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-footer-text)]">Contact</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-[var(--color-footer-text)]/65">
              {settings?.contactEmail ? <a href={`mailto:${settings.contactEmail}`} className="flex items-start gap-3 text-inherit transition-opacity hover:opacity-75"><FiMail className="mt-1 shrink-0" aria-hidden="true" /><span>{settings.contactEmail}</span></a> : null}
              {settings?.phone ? <a href={`tel:${settings.phone}`} className="flex items-start gap-3 text-inherit transition-opacity hover:opacity-75"><FiPhone className="mt-1 shrink-0" aria-hidden="true" /><span>{settings.phone}</span></a> : null}
              {settings?.address ? <p className="flex items-start gap-3"><FiMapPin className="mt-1 shrink-0" aria-hidden="true" /><span>{settings.address}</span></p> : null}
            </div>
            {configuredSocial.length ? (
              <div className="mt-6 flex gap-2.5">
                {configuredSocial.map(({ key, label, Icon }) => (
                  <a key={key} href={social[key]} target="_blank" rel="noreferrer" aria-label={label} title={label} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-current/25 text-[var(--color-footer-text)] transition-opacity hover:opacity-70">
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 text-xs text-[var(--color-footer-text)]/50 sm:flex-row sm:items-center sm:justify-between">
          <span>{settings?.footerText || `© ${new Date().getFullYear()} Hira${String.fromCharCode(39)}s Universe. All rights reserved.`}</span>
          <span>Thoughtfully curated in Bangladesh</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
