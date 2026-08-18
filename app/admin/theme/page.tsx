"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useToast } from '../../../src/components/admin/Toast'
import { buildThemeCss, isHexColor, normalizeTheme, validateTheme } from '../../../src/lib/themeValidation'

const COLOR_CONTROLS = [
  ['bodyBackground', 'Body background', 'The page canvas behind every storefront view.'],
  ['mainBackground', 'Main background', 'The primary content area.'],
  ['sectionBackground', 'Section background', 'Alternating editorial sections.'],
  ['cardBackground', 'Card background', 'Product, cart, and content cards.'],
  ['background', 'Background', 'General storefront background fallback.'],
  ['surface', 'Surface', 'Subtle panels and secondary controls.'],
  ['primary', 'Primary', 'Brand emphasis and primary actions.'],
  ['secondary', 'Secondary', 'Supporting brand surfaces.'],
  ['accent', 'Accent', 'Small highlights and focus details.'],
  ['text', 'Text', 'Default body copy.'], ['heading', 'Heading', 'Headings and strong labels.'],
  ['muted', 'Muted text', 'Secondary descriptions and metadata.'], ['border', 'Border', 'Dividers and card outlines.'],
  ['buttonBackground', 'Button background', 'Primary button fill.'], ['buttonText', 'Button text', 'Primary button label.'],
  ['buttonHover', 'Button hover', 'Primary button hover fill.'], ['onPrimary', 'On primary', 'Text and icons displayed on primary surfaces.'],
  ['link', 'Link', 'Default link color.'],
  ['linkHover', 'Link hover', 'Link hover and focus color.'], ['headerBackground', 'Header background', 'Desktop and mobile header surface.'],
  ['headerText', 'Header text', 'Header navigation and icons.'], ['footerBackground', 'Footer background', 'Footer surface.'],
  ['footerText', 'Footer text', 'Footer copy and navigation.'], ['announcementBackground', 'Announcement background', 'Top announcement bar.'],
  ['announcementText', 'Announcement text', 'Top announcement copy.'], ['sale', 'Sale badge', 'Sale badge background.'],
  ['saleText', 'Sale badge text', 'Sale badge label.'], ['error', 'Error', 'Validation and failure states.'],
  ['success', 'Success', 'Confirmation states.'], ['inputBackground', 'Input background', 'Form field surface.'],
  ['inputBorder', 'Input border', 'Default form field outline.'], ['inputFocus', 'Input focus', 'Focused form field outline.'],
  ['wishlist', 'Wishlist accent', 'Heart and wishlist controls.']
] as const

const PRESETS = {
  'Warm Ivory': { bodyBackground: '#F8F5EF', mainBackground: '#F8F5EF', sectionBackground: '#FCFBF8', cardBackground: '#FFFFFF', primary: '#654A3A', secondary: '#A69888', accent: '#A9824F', text: '#292623', heading: '#211F1D', muted: '#7E756D', border: '#E5DDD3', headerBackground: '#FFFFFF', headerText: '#292623' },
  'Clean White': { bodyBackground: '#FFFFFF', mainBackground: '#FFFFFF', sectionBackground: '#F7F7F5', cardBackground: '#FFFFFF', primary: '#272727', secondary: '#74746C', accent: '#8A6F45', text: '#2A2A28', heading: '#181817', muted: '#70706A', border: '#E4E4DF', headerBackground: '#FFFFFF', headerText: '#20201F' },
  'Minimal Mocha': { bodyBackground: '#FAF9F7', mainBackground: '#FAF9F7', sectionBackground: '#F2EFEB', cardBackground: '#FFFFFF', primary: '#604A3E', secondary: '#8E8075', accent: '#9D784F', text: '#302B28', heading: '#201D1B', muted: '#756C66', border: '#DED8D2', headerBackground: '#FAF9F7', headerText: '#302B28' },
  'Elegant Olive': { bodyBackground: '#FAFAF7', mainBackground: '#FAFAF7', sectionBackground: '#F1F2EC', cardBackground: '#FFFFFF', primary: '#555D48', secondary: '#858B76', accent: '#9A7848', text: '#292B27', heading: '#1D201B', muted: '#6F7468', border: '#DDE0D5', headerBackground: '#FFFFFF', headerText: '#292B27' }
} as const

export default function AdminTheme() {
  const [theme, setTheme] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  useEffect(() => {
    fetch('/api/theme', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => null)
        if (!response.ok) throw new Error(data?.error || 'Could not load theme settings')
        setTheme(normalizeTheme(data))
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load theme settings'))
      .finally(() => setLoading(false))
  }, [])

  const previewCss = useMemo(() => buildThemeCss(theme), [theme])
  const validationErrors = useMemo(() => theme ? validateTheme(theme) : [], [theme])
  const invalidColors = useMemo(() => new Set(
    COLOR_CONTROLS
      .filter(([key]) => !isHexColor(theme?.colors?.[key]))
      .map(([key]) => key)
  ), [theme])

  function updateColor(key: string, value: string) {
    setTheme({ ...theme, colors: { ...theme.colors, [key]: value } })
    setDirty(true)
  }

  function updateFont(key: string, value: string) {
    setTheme({ ...theme, fonts: { ...theme.fonts, [key]: value } })
    setDirty(true)
  }

  function updateLayout(key: string, value: string) {
    setTheme({ ...theme, layout: { ...theme.layout, [key]: value } })
    setDirty(true)
  }

  function applyPreset(colors: Record<string, string>) {
    setTheme({ ...theme, colors: { ...theme.colors, ...colors } })
    setDirty(true)
  }

  async function save() {
    if (saving) return
    if (validationErrors.length > 0) {
      const message = 'Correct the invalid theme values before saving.'
      setError(message)
      toast?.show(message, 'error')
      return
    }

    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/theme', {
        method: 'PUT',
        body: JSON.stringify(theme),
        headers: { 'content-type': 'application/json' },
        cache: 'no-store'
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Could not save theme settings')
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('The server returned invalid theme settings.')
      }
      setTheme(normalizeTheme(data))
      setDirty(false)
      toast?.show('Theme saved successfully')
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save theme settings'
      setError(message)
      toast?.show(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function resetUnsaved() {
    if (loading || !dirty || !confirm('Reset unsaved changes?')) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/theme', { cache: 'no-store' })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Could not reload theme settings')
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('The server returned invalid theme settings.')
      }
      setTheme(normalizeTheme(data))
      setDirty(false)
    } catch (resetError) {
      const message = resetError instanceof Error ? resetError.message : 'Could not reload theme settings'
      setError(message)
      toast?.show(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function resetToDefault() {
    if (saving) return
    if (dirty && !confirm('You have unsaved changes. Reset to default anyway?')) return
    if (!confirm('Reset theme to default? This will overwrite saved settings.')) return
    setSaving(true)
    setError('')
    try {
      const defaultResponse = await fetch('/api/theme/default', { cache: 'no-store' })
      const defaultTheme = await defaultResponse.json().catch(() => null)
      if (!defaultResponse.ok) throw new Error(defaultTheme?.error || 'Could not load default theme')
      if (!defaultTheme || typeof defaultTheme !== 'object' || Array.isArray(defaultTheme)) {
        throw new Error('The server returned invalid default theme settings.')
      }

      const saveResponse = await fetch('/api/theme', {
        method: 'PUT',
        body: JSON.stringify(defaultTheme),
        headers: { 'content-type': 'application/json' }
      })
      const saveData = await saveResponse.json().catch(() => null)
      if (!saveResponse.ok) throw new Error(saveData?.error || 'Could not reset theme')
      if (!saveData || typeof saveData !== 'object' || Array.isArray(saveData)) {
        throw new Error('The server returned invalid theme settings.')
      }
      setTheme(normalizeTheme(saveData))
      setDirty(false)
      toast?.show('Theme reset to default')
    } catch (resetError) {
      const message = resetError instanceof Error ? resetError.message : 'Could not reset theme'
      setError(message)
      toast?.show(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !theme) return <div className="py-12 text-center text-sm text-taupe">Loading theme settings...</div>
  if (!theme) return <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || 'Theme settings are unavailable.'}</div>

  const inputClass = 'min-h-10 min-w-0 flex-1 rounded border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-mocha focus:ring-2 focus:ring-mocha/10'

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">Theme and appearance</h1>
          <p className="mt-1 text-sm text-taupe">Adjust storefront colors, typography, and layout tokens.</p>
        </div>
        {dirty && <span className="inline-flex w-fit rounded bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">Unsaved changes</span>}
      </div>

      {error && <div role="alert" className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-cream bg-white p-4 sm:p-6">
          <div className="grid gap-6">
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-medium">Colors</h2>
                <div className="flex flex-wrap gap-2" aria-label="Theme presets">
                  {Object.entries(PRESETS).map(([name, colors]) => (
                    <button key={name} type="button" onClick={() => applyPreset(colors)} className="rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 transition hover:border-gray-400">{name}</button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                {COLOR_CONTROLS.map(([key, label, description]) => (
                  <label key={key} className="grid gap-2 rounded border border-gray-100 p-3 text-sm sm:grid-cols-[minmax(0,1fr)_3rem_8.5rem] sm:items-center">
                    <span className="min-w-0"><span className="block font-medium text-gray-800">{label}</span><span className="mt-0.5 block text-xs leading-5 text-gray-500">{description}</span></span>
                    <input type="color" aria-label={`${label} color picker`} value={isHexColor(theme.colors[key]) ? theme.colors[key] : '#000000'} onChange={(event) => updateColor(key, event.target.value.toUpperCase())} className="h-10 w-12 cursor-pointer rounded border border-gray-200 bg-white p-1" />
                    <span className="grid gap-1">
                      <input aria-label={`${label} hex value`} aria-invalid={invalidColors.has(key)} value={theme.colors[key]} onChange={(event) => updateColor(key, event.target.value)} className={`${inputClass} ${invalidColors.has(key) ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`} pattern="^#[0-9A-Fa-f]{6}$" />
                      {invalidColors.has(key) && <span className="text-xs text-red-600">Use six-digit HEX, for example #6B4F3B.</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-medium">Fonts</h2>
              <div className="grid gap-3">
                {(['heading', 'body'] as const).map((key) => (
                  <label key={key} className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
                    <span className="w-28 shrink-0 text-gray-600">{key}</span>
                    <input value={theme.fonts?.[key] || ''} onChange={(event) => updateFont(key, event.target.value)} className={inputClass} />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-medium">Layout</h2>
              <div className="grid gap-3">
                {[
                  ['containerWidth', 'Container'],
                  ['radiusButton', 'Button radius'],
                  ['radiusCard', 'Card radius'],
                  ['sectionSpacing', 'Section spacing']
                ].map(([key, label]) => (
                  <label key={key} className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
                    <span className="w-28 shrink-0 text-gray-600">{label}</span>
                    <input value={theme.layout?.[key] || ''} onChange={(event) => updateLayout(key, event.target.value)} className={inputClass} />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-cream pt-5 sm:flex-row sm:flex-wrap">
              <button type="button" onClick={save} disabled={saving || validationErrors.length > 0} className="min-h-10 rounded bg-mocha px-4 py-2 text-sm font-medium text-ivory transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : 'Save changes'}</button>
              <button type="button" onClick={resetUnsaved} disabled={saving || !dirty} className="min-h-10 rounded border border-cream bg-cream px-4 py-2 text-sm transition hover:bg-cream/70 disabled:cursor-not-allowed disabled:opacity-50">Reset unsaved</button>
              <button type="button" onClick={resetToDefault} disabled={saving} className="min-h-10 rounded border border-cream px-4 py-2 text-sm transition hover:bg-cream/40 disabled:cursor-not-allowed disabled:opacity-50">Reset to default</button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-medium">Live preview</h2>
          <div className="overflow-auto rounded-lg border border-cream bg-[var(--color-body-background)] p-4 text-[var(--color-text)] sm:p-6" style={{ minHeight: 420 }}>
            <style dangerouslySetInnerHTML={{ __html: previewCss }} />
            <div className="site-container">
              <header className="flex flex-col gap-3 border-b border-[var(--color-border)] bg-[var(--color-header-background)] px-4 py-4 text-[var(--color-header-text)] sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xl font-semibold">{"Hira's Universe"}</div>
                <nav className="flex gap-3 text-sm"><a href="#">Shop</a><a href="#">About</a><a href="#">Contact</a></nav>
              </header>
              <section className="my-6 bg-[var(--color-section-background)] p-4">
                <div className="overflow-hidden rounded-lg bg-[var(--color-card-background)] p-5 sm:p-6">
                  <h3 className="text-3xl font-serif font-semibold">Elegance in Modesty</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">Editorial intro copy here.</p>
                  <div className="mt-4"><button type="button" className="btn-primary px-4 py-2">Shop collection</button></div>
                </div>
              </section>
              <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                {[79, 129].map((price) => (
                  <article key={price} className="card-surface p-3">
                    <div className="product-image mb-3 bg-[var(--color-surface)]" style={{ height: 160 }} />
                    <h4 className="text-sm font-medium">Product name</h4>
                    <div className="mt-2"><span className="text-sm font-semibold text-[var(--color-primary)]">${price}</span></div>
                    <div className="mt-3"><button type="button" className="btn-primary w-full px-3 py-2 text-sm">Add to bag</button></div>
                  </article>
                ))}
              </section>
              <footer className="mt-8 border-t border-[var(--color-border)] bg-[var(--color-footer-background)] px-4 py-5 text-sm text-[var(--color-footer-text)]">&copy; {"Hira's Universe"}</footer>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
