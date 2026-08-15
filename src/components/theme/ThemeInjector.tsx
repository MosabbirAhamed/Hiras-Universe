import React from 'react'
import { getTheme } from '../../lib/repositories/fileRepo'

export default async function ThemeInjector() {
  const theme = await getTheme()
  if (!theme) return null
  const vars: string[] = []
  // colors
  const c = theme.colors || {}
  vars.push(`--color-primary: ${c.primary || '#6B4F3B'};`)
  vars.push(`--color-secondary: ${c.secondary || '#B8A99A'};`)
  vars.push(`--color-accent: ${c.accent || '#B89A6A'};`)
  vars.push(`--color-background: ${c.background || '#F6F1EB'};`)
  vars.push(`--color-surface: ${c.surface || '#F3EDE7'};`)
  vars.push(`--color-text: ${c.text || '#222222'};`)
  vars.push(`--color-muted: ${c.muted || '#DCCCBF'};`)
  vars.push(`--color-border: ${c.border || '#E8E0D6'};`)
  vars.push(`--color-sale: ${c.sale || '#B89A6A'};`)
  vars.push(`--color-on-primary: ${c.onPrimary || '#F6F1EB'};`)
  vars.push(`--color-link: ${c.link || '#6B4F3B'};`)

  // fonts
  const f = theme.fonts || {}
  vars.push(`--font-heading: ${f.heading || "ui-serif, Georgia, 'Times New Roman', serif"};`)
  vars.push(`--font-body: ${f.body || "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"};`)

  // layout & radii
  const l = theme.layout || {}
  if (l.containerWidth) vars.push(`--container-width: ${l.containerWidth};`)
  if (l.borderRadius) vars.push(`--radius-base: ${l.borderRadius};`)
  if (l.radiusButton) vars.push(`--radius-button: ${l.radiusButton};`)
  if (l.radiusCard) vars.push(`--radius-card: ${l.radiusCard};`)
  if (l.sectionSpacing) vars.push(`--section-spacing: ${l.sectionSpacing};`)
  if (l.productImageAspect) vars.push(`--product-aspect: ${l.productImageAspect};`)
  if (l.headerStyle) vars.push(`--header-style: ${l.headerStyle};`)
  if (l.footerStyle) vars.push(`--footer-style: ${l.footerStyle};`)

  const css = `:root { ${vars.join(' ')} }`
  return (<style dangerouslySetInnerHTML={{ __html: css }} />)
}
