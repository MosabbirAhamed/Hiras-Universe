"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useToast } from '../../../src/components/admin/Toast'

function buildCssFromTheme(theme: any) {
  if (!theme) return ''
  const parts: string[] = []
  const colors = theme.colors || {}
  parts.push(`:root { --color-primary: ${colors.primary}; --color-secondary: ${colors.secondary}; --color-accent: ${colors.accent}; --color-background: ${colors.background}; --color-surface: ${colors.surface}; --color-text: ${colors.text}; --color-muted: ${colors.muted}; --color-border: ${colors.border}; --color-sale: ${colors.sale}; --color-on-primary: ${colors.onPrimary}; --color-link: ${colors.link}; }`)
  const layout = theme.layout || {}
  if (layout.containerWidth) parts.push(`:root { --container-width: ${layout.containerWidth}; }`)
  if (layout.borderRadius) parts.push(`:root { --radius-base: ${layout.borderRadius}; }`)
  if (layout.radiusButton) parts.push(`:root { --radius-button: ${layout.radiusButton}; }`)
  if (layout.radiusCard) parts.push(`:root { --radius-card: ${layout.radiusCard}; }`)
  if (layout.sectionSpacing) parts.push(`:root { --section-spacing: ${layout.sectionSpacing}; }`)
  return parts.join('\n')
}

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
        setTheme(data)
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load theme settings'))
      .finally(() => setLoading(false))
  }, [])

  const previewCss = useMemo(() => buildCssFromTheme(theme), [theme])

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

  async function save() {
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
      setDirty(false)
      toast?.show('Theme saved successfully')
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save theme settings'
      setError(message)
      toast?.show(message)
    } finally {
      setSaving(false)
    }
  }

  async function resetUnsaved() {
    if (!dirty || !confirm('Reset unsaved changes?')) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/theme', { cache: 'no-store' })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Could not reload theme settings')
      setTheme(data)
      setDirty(false)
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Could not reload theme settings')
    } finally {
      setLoading(false)
    }
  }

  async function resetToDefault() {
    if (dirty && !confirm('You have unsaved changes. Reset to default anyway?')) return
    if (!confirm('Reset theme to default? This will overwrite saved settings.')) return
    setSaving(true)
    setError('')
    try {
      const defaultResponse = await fetch('/api/theme/default', { cache: 'no-store' })
      const defaultTheme = await defaultResponse.json().catch(() => null)
      if (!defaultResponse.ok) throw new Error(defaultTheme?.error || 'Could not load default theme')

      const saveResponse = await fetch('/api/theme', {
        method: 'PUT',
        body: JSON.stringify(defaultTheme),
        headers: { 'content-type': 'application/json' }
      })
      const saveData = await saveResponse.json().catch(() => null)
      if (!saveResponse.ok) throw new Error(saveData?.error || 'Could not reset theme')
      setTheme(defaultTheme)
      setDirty(false)
      toast?.show('Theme reset to default')
    } catch (resetError) {
      const message = resetError instanceof Error ? resetError.message : 'Could not reset theme'
      setError(message)
      toast?.show(message)
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
              <h2 className="mb-3 font-medium">Colors</h2>
              <div className="grid gap-3">
                {Object.keys(theme.colors || {}).map((key: string) => (
                  <label key={key} className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
                    <span className="w-28 shrink-0 text-gray-600">{key}</span>
                    <input value={theme.colors[key]} onChange={(event) => updateColor(key, event.target.value)} className={inputClass} />
                    <span aria-hidden="true" className="h-8 w-full rounded border border-gray-200 sm:w-10" style={{ background: theme.colors[key] }} />
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
              <button type="button" onClick={save} disabled={saving} className="min-h-10 rounded bg-mocha px-4 py-2 text-sm font-medium text-ivory transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : 'Save changes'}</button>
              <button type="button" onClick={resetUnsaved} disabled={saving || !dirty} className="min-h-10 rounded border border-cream bg-cream px-4 py-2 text-sm transition hover:bg-cream/70 disabled:cursor-not-allowed disabled:opacity-50">Reset unsaved</button>
              <button type="button" onClick={resetToDefault} disabled={saving} className="min-h-10 rounded border border-cream px-4 py-2 text-sm transition hover:bg-cream/40 disabled:cursor-not-allowed disabled:opacity-50">Reset to default</button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-medium">Live preview</h2>
          <div className="overflow-auto rounded-lg border border-cream bg-white p-4 sm:p-6" style={{ minHeight: 420 }}>
            <style dangerouslySetInnerHTML={{ __html: previewCss }} />
            <div className="site-container">
              <header className="flex flex-col gap-3 border-b border-cream py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xl font-semibold">{"Hira's Universe"}</div>
                <nav className="flex gap-3 text-sm"><a href="#">Shop</a><a href="#">About</a><a href="#">Contact</a></nav>
              </header>
              <section className="my-6">
                <div className="overflow-hidden rounded-lg bg-cream p-5 sm:p-6">
                  <h3 className="text-3xl font-serif font-semibold">Elegance in Modesty</h3>
                  <p className="mt-2 text-sm text-muted">Editorial intro copy here.</p>
                  <div className="mt-4"><button type="button" className="btn-primary px-4 py-2">Shop collection</button></div>
                </div>
              </section>
              <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                {[79, 129].map((price) => (
                  <article key={price} className="card-surface p-3">
                    <div className="product-image mb-3 bg-ivory" style={{ height: 160 }} />
                    <h4 className="text-sm font-medium">Product name</h4>
                    <div className="mt-2"><span className="text-sm font-semibold text-mocha">${price}</span></div>
                    <div className="mt-3"><button type="button" className="btn-primary w-full px-3 py-2 text-sm">Add to bag</button></div>
                  </article>
                ))}
              </section>
              <footer className="mt-8 border-t pt-4 text-sm">&copy; {"Hira's Universe"}</footer>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
