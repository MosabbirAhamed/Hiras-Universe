"use client"
import React, { useState, useEffect, useMemo } from 'react'

function buildCssFromTheme(theme:any){
  if (!theme) return ''
  const parts:string[] = []
  const c = theme.colors || {}
  parts.push(`:root { --color-primary: ${c.primary}; --color-secondary: ${c.secondary}; --color-accent: ${c.accent}; --color-background: ${c.background}; --color-surface: ${c.surface}; --color-text: ${c.text}; --color-muted: ${c.muted}; --color-border: ${c.border}; --color-sale: ${c.sale}; --color-on-primary: ${c.onPrimary}; --color-link: ${c.link}; }`)
  const l = theme.layout || {}
  if (l.containerWidth) parts.push(`:root { --container-width: ${l.containerWidth}; }`)
  if (l.borderRadius) parts.push(`:root { --radius-base: ${l.borderRadius}; }`)
  if (l.radiusButton) parts.push(`:root { --radius-button: ${l.radiusButton}; }`)
  if (l.radiusCard) parts.push(`:root { --radius-card: ${l.radiusCard}; }`)
  if (l.sectionSpacing) parts.push(`:root { --section-spacing: ${l.sectionSpacing}; }`)
  return parts.join('\n')
}

export default function AdminTheme() {
  const [theme, setTheme] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(()=>{ fetch('/api/theme').then(r=>r.json()).then(setTheme) }, [])
  const previewCss = useMemo(()=> buildCssFromTheme(theme), [theme])

  if (!theme) return <div>Loading...</div>

  function updateColor(key:string, val:string){ setTheme({...theme, colors:{...theme.colors, [key]: val}}); setDirty(true) }
  function updateFont(key:string, val:string){ setTheme({...theme, fonts:{...theme.fonts, [key]: val}}); setDirty(true) }
  function updateLayout(key:string, val:string){ setTheme({...theme, layout:{...theme.layout, [key]: val}}); setDirty(true) }

  async function save(){ setLoading(true); const res = await fetch('/api/theme', { method: 'PUT', body: JSON.stringify(theme), headers: { 'content-type':'application/json'} }); setLoading(false); if (res.ok){ setDirty(false); alert('Saved') } else { alert('Save failed') } }

  async function resetUnsaved(){ if (!dirty) return; if (!confirm('Reset unsaved changes?')) return; const r = await fetch('/api/theme'); const t = await r.json(); setTheme(t); setDirty(false) }

  async function resetToDefault(){ if (dirty && !confirm('You have unsaved changes — reset to default anyway?')) return; if (!confirm('Reset theme to default? This will overwrite saved settings.')) return; setLoading(true); const def = await (await fetch('/api/theme/default')).json(); await fetch('/api/theme', { method: 'PUT', body: JSON.stringify(def), headers:{'content-type':'application/json'} }); setTheme(def); setDirty(false); setLoading(false); alert('Reset to default') }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Theme / Appearance</h2>
        <div className="grid gap-3 max-w-2xl">
          <div>
            <div className="font-medium mb-2">Colors</div>
            {Object.keys(theme.colors||{}).map((k:string)=>(
              <div key={k} className="flex items-center gap-2 mb-2">
                <div className="w-24">{k}</div>
                <input value={theme.colors[k]} onChange={e=>updateColor(k, e.target.value)} className="border p-2 rounded" />
                <div className="w-8 h-6" style={{ background: theme.colors[k] }} />
              </div>
            ))}
          </div>

          <div>
            <div className="font-medium mb-2">Fonts</div>
            <div className="flex items-center gap-2 mb-2"><div className="w-24">Heading</div><input value={theme.fonts.heading} onChange={e=>updateFont('heading', e.target.value)} className="border p-2 rounded" /></div>
            <div className="flex items-center gap-2 mb-2"><div className="w-24">Body</div><input value={theme.fonts.body} onChange={e=>updateFont('body', e.target.value)} className="border p-2 rounded" /></div>
          </div>

          <div>
            <div className="font-medium mb-2">Layout</div>
            <div className="flex items-center gap-2 mb-2"><div className="w-24">Container</div><input value={theme.layout.containerWidth} onChange={e=>updateLayout('containerWidth', e.target.value)} className="border p-2 rounded" /></div>
            <div className="flex items-center gap-2 mb-2"><div className="w-24">Button radius</div><input value={theme.layout.radiusButton} onChange={e=>updateLayout('radiusButton', e.target.value)} className="border p-2 rounded" /></div>
            <div className="flex items-center gap-2 mb-2"><div className="w-24">Card radius</div><input value={theme.layout.radiusCard} onChange={e=>updateLayout('radiusCard', e.target.value)} className="border p-2 rounded" /></div>
            <div className="flex items-center gap-2 mb-2"><div className="w-24">Section spacing</div><input value={theme.layout.sectionSpacing} onChange={e=>updateLayout('sectionSpacing', e.target.value)} className="border p-2 rounded" /></div>
          </div>

          <div className="flex gap-2">
            <button onClick={save} className="px-4 py-2 bg-mocha text-ivory rounded">{loading? 'Saving...':'Save changes'}</button>
            <button onClick={resetUnsaved} className="px-4 py-2 bg-cream border border-cream rounded">Reset unsaved</button>
            <button onClick={resetToDefault} className="px-4 py-2 bg-ivory border border-cream rounded">Reset to default</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Live preview</h3>
        <div className="border p-4 rounded bg-white" style={{ minHeight: 420, overflow: 'auto' }}>
          <style dangerouslySetInnerHTML={{ __html: previewCss }} />
          <div className="site-container">
            <header className="py-4 flex items-center justify-between">
              <div className="text-xl font-semibold">Hira&apos;s Universe</div>
              <nav className="flex gap-3"><a href="#">Shop</a><a href="#">About</a><a href="#">Contact</a></nav>
            </header>

            <section className="mt-6 mb-6">
              <div className="overflow-hidden rounded-lg bg-cream p-6">
                <h1 className="text-3xl md:text-5xl font-serif font-semibold">Elegance in Modesty</h1>
                <p className="mt-2 text-sm text-muted">Editorial intro copy here.</p>
                <div className="mt-4"><button className="btn-primary px-4 py-2">Shop collection</button></div>
              </div>
            </section>

            <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <article className="card-surface p-3">
                <div className="product-image bg-ivory mb-3" style={{height:200}}></div>
                <h4 className="text-sm font-medium">Product name</h4>
                <div className="mt-2"><span className="text-sm text-mocha font-semibold">$79</span></div>
                <div className="mt-3"><button className="w-full btn-ghost px-3 py-2">Add to bag</button></div>
              </article>
              <article className="card-surface p-3">
                <div className="product-image bg-ivory mb-3" style={{height:200}}></div>
                <h4 className="text-sm font-medium">Product name</h4>
                <div className="mt-2"><span className="text-sm text-mocha font-semibold">$129</span></div>
                <div className="mt-3"><button className="w-full btn-primary px-3 py-2">Add to bag</button></div>
              </article>
            </section>

            <footer className="mt-8 pt-4 border-t">
              <div className="text-sm">© Hira&apos;s Universe</div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
