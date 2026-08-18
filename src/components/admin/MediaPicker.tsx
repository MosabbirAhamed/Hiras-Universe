"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import LoadingSpinner from './LoadingSpinner'

type MediaItem = {
  id: string
  filename: string
  url: string
}

export default function MediaPicker({ value, onChange, multiple }: { value?: string[]; onChange: React.Dispatch<string[]>; multiple?: boolean }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<MediaItem[]>([])
  const [selected, setSelected] = useState<string[]>(value || [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadItems() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/uploads', { signal: controller.signal })
        const data: unknown = await response.json().catch(() => null)
        if (!response.ok) {
          const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'Could not load the media library.'
          throw new Error(message)
        }
        if (!Array.isArray(data)) throw new Error('The server returned invalid media data.')

        const isMediaItem = (item: unknown): item is MediaItem => (
          typeof item === 'object'
          && item !== null
          && 'id' in item
          && typeof item.id === 'string'
          && 'filename' in item
          && typeof item.filename === 'string'
          && 'url' in item
          && typeof item.url === 'string'
        )
        if (!data.every(isMediaItem)) throw new Error('The server returned invalid media data.')

        setItems(data)
      } catch (loadError) {
        if (controller.signal.aborted) return
        setError(loadError instanceof Error ? loadError.message : 'Could not load the media library.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadItems()
    return () => controller.abort()
  }, [reloadKey])

  useEffect(() => { setSelected(value || []) }, [value])

  function toggle(url: string) {
    setSelected(current => {
      if (current.includes(url)) return current.filter(selectedUrl => selectedUrl !== url)
      return multiple ? [...current, url] : [url]
    })
  }

  function setPrimary(url: string) {
    setSelected(current => (
      current.includes(url) ? [url, ...current.filter(selectedUrl => selectedUrl !== url)] : current
    ))
  }

  function moveUp(i: number) { if (i === 0) return; const copy = [...selected]; const tmp = copy[i - 1]; copy[i - 1] = copy[i]; copy[i] = tmp; setSelected(copy) }
  function moveDown(i: number) { if (i === selected.length - 1) return; const copy = [...selected]; const tmp = copy[i + 1]; copy[i + 1] = copy[i]; copy[i] = tmp; setSelected(copy) }

  function apply() {
    onChange(selected.filter(Boolean))
    setOpen(false)
  }

  return (
    <div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(true)} className="px-3 py-2 border rounded">Choose from Media</button>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 md:w-3/4 max-h-[80vh] overflow-auto p-4 rounded">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Media Library</h3>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-2 py-1 border rounded">Close</button>
                <button type="button" onClick={apply} className="px-3 py-1 bg-mocha text-ivory rounded">Insert</button>
              </div>
            </div>
            {loading ? (
              <div role="status" className="flex min-h-48 items-center justify-center gap-3 text-sm text-gray-600">
                <LoadingSpinner size={20} />
                <span>Loading media library...</span>
              </div>
            ) : error ? (
              <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setReloadKey(key => key + 1)}
                  className="mt-3 min-h-[40px] rounded border border-red-300 bg-white px-3 py-2 font-medium text-red-700 transition hover:bg-red-100"
                >
                  Try again
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center rounded border border-dashed border-gray-300 px-4 text-center text-sm text-gray-600">
                No media files are available.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                {items.map(it => (
                  <div key={it.id} className={`rounded border p-1 ${selected.includes(it.url) ? 'ring-2 ring-mocha' : ''}`}>
                    <div className="mb-1 flex h-24 w-full items-center justify-center overflow-hidden bg-gray-50">
                      <Image src={it.url} alt={it.filename} width={120} height={96} className="h-full w-full object-contain" />
                    </div>
                    <div className="mb-1 text-xs">{it.filename}</div>
                    <div className="flex flex-wrap items-center gap-1">
                      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={selected.includes(it.url)} onChange={() => toggle(it.url)} />Select</label>
                      <button type="button" onClick={() => setPrimary(it.url)} className="rounded border px-2 py-1 text-xs">Primary</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selected.length > 0 && (
              <div className="mt-4">
                <div className="font-medium mb-2">Selected</div>
                <div className="flex gap-2 overflow-auto">
                  {selected.map((url, i) => {
                    const it = items.find(x => x.url === url)
                    if (!it) return null
                    return (
                      <div key={url} className="p-2 border rounded">
                        <div className="w-24 h-24 mb-2"><Image src={it.url} width={96} height={96} className="object-contain w-full h-full" alt="selected" /></div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => moveUp(i)} className="px-2 py-1 border rounded">Up</button>
                          <button type="button" onClick={() => moveDown(i)} className="px-2 py-1 border rounded">Down</button>
                          <button type="button" onClick={() => { setSelected(selected.filter(s => s !== url)) }} className="px-2 py-1 border rounded">Remove</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
