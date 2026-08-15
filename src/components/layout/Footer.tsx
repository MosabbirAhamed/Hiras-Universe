import React from 'react'
import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { getNavigation, getSettings } from '../../lib/repositories/fileRepo'

const fallbackLinks = [
  { label: 'Shop all', url: '/products' },
  { label: 'Women', url: '/collections/women' },
  { label: 'Men', url: '/collections/men' },
  { label: 'Tupi', url: '/category/tupi' }
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

const fallbackSocial = {
  facebook: 'https://www.facebook.com/hirasuniverse',
  instagram: 'https://www.instagram.com/hirasuniverse',
  tiktok: 'https://www.tiktok.com/@hirasuniverse',
  youtube: 'https://www.youtube.com/@hirasuniverse'
}

export const Footer = async () => {
  const [nav, settings] = await Promise.all([getNavigation(), getSettings()])
  const navigationLinks = (nav || [])
    .filter((item: any) => item.active && item.location !== 'footer' && item.url)
    .sort((a: any, b: any) => a.order - b.order)
    .slice(0, 4)
    .map((item: any) => ({ label: item.label, url: item.url }))
  const shopLinks = navigationLinks.length ? navigationLinks : fallbackLinks
  const social = { ...fallbackSocial, ...(settings?.social || {}) }

  return (
    <footer className="mt-auto w-full border-t border-black/10 bg-[#2b2927] text-white">
      <div className="site-container py-12 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr] lg:gap-12">
          <div className="max-w-sm">
            <Link href="/" className="font-serif text-2xl font-semibold text-white">{settings?.storeName || "Hira's Universe"}</Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">{settings?.description || 'Curated modest fashion and timeless essentials for everyday elegance.'}</p>
            <Link href="/products" className="mt-6 inline-flex border-b border-white/35 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white">Shop the collection</Link>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/90">Shop</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              {shopLinks.map((link) => <li key={link.url}><Link href={link.url} className="transition-colors hover:text-white">{link.label}</Link></li>)}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/90">Customer care</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              {careLinks.map((link) => <li key={link.url}><Link href={link.url} className="transition-colors hover:text-white">{link.label}</Link></li>)}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/90">Stay connected</h2>
            <p className="mt-4 text-sm leading-6 text-white/65">{"Follow Hira's Universe for new arrivals and thoughtful styling."}</p>
            <div className="mt-5 flex gap-2.5">
              {socialIcons.map(({ key, label, Icon }) => <a key={key} href={social[key]} target="_blank" rel="noreferrer" aria-label={label} title={label} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-[#c5a059] hover:bg-white/10 hover:text-white"><Icon size={15} /></a>)}
            </div>
            {settings?.contactEmail ? <a href={`mailto:${settings.contactEmail}`} className="mt-5 inline-block text-sm text-white/65 transition-colors hover:text-white">{settings.contactEmail}</a> : null}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>{settings?.footerText || `© ${new Date().getFullYear()} Hira${String.fromCharCode(39)}s Universe. All rights reserved.`}</span>
          {settings?.phone ? <span>{settings.phone}</span> : null}
        </div>
      </div>
    </footer>
  )
}

export default Footer
