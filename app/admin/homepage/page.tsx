"use client"
import React, { useEffect, useState } from 'react'
import MediaPicker from '../../../src/components/admin/MediaPicker'
import { useToast } from '../../../src/components/admin/Toast'

type HomepageSection = { id: string; type?: string; data?: Record<string, any> }

export default function AdminHomepage() {
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  useEffect(() => {
    fetch('/api/homepage', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => null)
        if (!response.ok) throw new Error(data?.error || 'Could not load homepage sections')
        setSections(Array.isArray(data) ? data : [])
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load homepage sections'))
      .finally(() => setLoading(false))
  }, [])

  function move(i: number, direction: -1 | 1) {
    const nextIndex = i + direction
    if (nextIndex < 0 || nextIndex >= sections.length) return
    const copy = [...sections]
      ;[copy[i], copy[nextIndex]] = [copy[nextIndex], copy[i]]
    setSections(copy)
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/homepage', { method: 'PUT', body: JSON.stringify(sections), headers: { 'content-type': 'application/json' } })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Could not save homepage sections')
      toast?.show('Homepage saved successfully')
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save homepage sections'
      setError(message)
      toast?.show(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="rounded-lg border border-cream bg-white p-8 text-sm text-taupe">Loading homepage sections...</div>

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-col gap-3 border-b border-cream pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="font-serif text-2xl font-semibold text-charcoal">Homepage Builder</h1><p className="mt-1 text-sm text-taupe">Arrange the sections that appear on the storefront homepage.</p></div>
        <button type="button" onClick={save} disabled={saving} className="min-h-10 rounded bg-mocha px-4 py-2 text-sm font-medium text-ivory disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : 'Save homepage'}</button>
      </div>
      {error && <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {!sections.length && <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">No homepage sections are configured.</div>}
      <div className="space-y-3">
        {sections.map((section, i) => {
          const title = section.data?.headline ?? section.data?.title ?? 'Untitled section'
          const images = section.data?.images || (section.data?.image ? [section.data.image] : [])
          return <article key={section.id} className="rounded-lg border border-cream bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><div className="text-xs font-semibold uppercase tracking-wider text-taupe">{section.type || 'Section'} · {i + 1}</div><div className="mt-1 truncate font-medium text-charcoal">{title}</div></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move section up" className="min-h-9 rounded border border-gray-200 px-3 text-sm disabled:opacity-40">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1} aria-label="Move section down" className="min-h-9 rounded border border-gray-200 px-3 text-sm disabled:opacity-40">↓</button>
                <button type="button" onClick={() => { const newTitle = window.prompt('Section title', title); if (newTitle != null) setSections((current) => current.map((item, index) => index === i ? { ...item, data: { ...item.data, headline: newTitle } } : item)) }} className="min-h-9 rounded border border-gray-200 px-3 text-sm">Edit title</button>
                {!!(section.data?.image || section.data?.images) && <MediaPicker value={images} onChange={(value: string[]) => setSections((current) => current.map((item, index) => index === i ? { ...item, data: { ...item.data, ...(value.length > 1 ? { images: value } : { image: value[0] }) } } : item))} multiple />}
              </div>
            </div>
          </article>
        })}
      </div>
    </div>
  )
}
