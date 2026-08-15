"use client"

import React, { useEffect, useState } from 'react'
import { useToast } from '../../../src/components/admin/Toast'

type Settings = {
  storeName?: string
  description?: string
  contactEmail?: string
  supportEmail?: string
  phone?: string
  address?: string
  currency?: string
  currencySymbol?: string
  social?: Record<string, string>
  footerText?: string
  logo?: string
  favicon?: string
  defaultSeo?: { title?: string; description?: string }
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => null)
        if (!response.ok) throw new Error(data?.error || 'Could not load store settings')
        setSettings(data || {})
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load store settings'))
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
        headers: { 'content-type': 'application/json' }
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Could not save store settings')
      toast?.show('Settings saved successfully')
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save store settings'
      setError(message)
      toast?.show(message)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'mt-1.5 min-h-10 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-mocha focus:ring-2 focus:ring-mocha/10'

  if (loading) return <div className="py-12 text-center text-sm text-taupe">Loading store settings...</div>

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">Store settings</h1>
          <p className="mt-1 text-sm text-taupe">Manage store identity, contact details, and default search metadata.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="min-h-10 rounded bg-mocha px-4 py-2 text-sm font-medium text-ivory transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-cream bg-white p-4 sm:p-5">
          <h2 className="mb-4 font-medium text-charcoal">General</h2>
          <label className="block text-sm font-medium">Store name
            <input className={inputClass} value={settings.storeName || ''} onChange={(event) => setSettings({ ...settings, storeName: event.target.value })} />
          </label>
          <label className="mt-4 block text-sm font-medium">Description
            <textarea className={`${inputClass} min-h-24 resize-y`} value={settings.description || ''} onChange={(event) => setSettings({ ...settings, description: event.target.value })} />
          </label>
          <label className="mt-4 block text-sm font-medium">Logo URL
            <input className={inputClass} value={settings.logo || ''} onChange={(event) => setSettings({ ...settings, logo: event.target.value })} />
          </label>
          <label className="mt-4 block text-sm font-medium">Favicon URL
            <input className={inputClass} value={settings.favicon || ''} onChange={(event) => setSettings({ ...settings, favicon: event.target.value })} />
          </label>
        </section>

        <section className="rounded-lg border border-cream bg-white p-4 sm:p-5">
          <h2 className="mb-4 font-medium text-charcoal">Contact and locale</h2>
          <label className="block text-sm font-medium">Contact email
            <input type="email" className={inputClass} value={settings.contactEmail || ''} onChange={(event) => setSettings({ ...settings, contactEmail: event.target.value })} />
          </label>
          <label className="mt-4 block text-sm font-medium">Support email
            <input type="email" className={inputClass} value={settings.supportEmail || ''} onChange={(event) => setSettings({ ...settings, supportEmail: event.target.value })} />
          </label>
          <label className="mt-4 block text-sm font-medium">Phone
            <input type="tel" className={inputClass} value={settings.phone || ''} onChange={(event) => setSettings({ ...settings, phone: event.target.value })} />
          </label>
          <label className="mt-4 block text-sm font-medium">Address
            <input className={inputClass} value={settings.address || ''} onChange={(event) => setSettings({ ...settings, address: event.target.value })} />
          </label>
        </section>

        <section className="rounded-lg border border-cream bg-white p-4 sm:p-5 lg:col-span-2">
          <h2 className="mb-4 font-medium text-charcoal">SEO defaults</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-sm font-medium">Default SEO title
              <input className={inputClass} value={settings.defaultSeo?.title || ''} onChange={(event) => setSettings({ ...settings, defaultSeo: { ...settings.defaultSeo, title: event.target.value } })} />
            </label>
            <label className="block text-sm font-medium">Default SEO description
              <textarea className={`${inputClass} min-h-24 resize-y`} value={settings.defaultSeo?.description || ''} onChange={(event) => setSettings({ ...settings, defaultSeo: { ...settings.defaultSeo, description: event.target.value } })} />
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}
