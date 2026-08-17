"use client"

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import MediaPicker from '../../../src/components/admin/MediaPicker'
import { useToast } from '../../../src/components/admin/Toast'
import type { Category, Product, ProductAttribute, ProductVariant } from '../../../src/types/models'
import { slugify, generateVariantSku, canonicalAttributeKey } from '../../../src/lib/productValidation'

type ProductFormProps = {
  initialProduct?: Product
  categories: Category[]
  mode: 'create' | 'edit'
}

type AttributeFormState = {
  id: string
  name: string
  valuesText: string
}

type VariantFormState = {
  id: string
  sku: string
  attributes: Record<string, string>
  price: string
  salePrice: string
  costPrice: string
  stock: string
  lowStockThreshold: string
  image: string
  active: boolean
}

type FormState = {
  name: string
  slug: string
  shortDescription: string
  description: string
  hasVariants: boolean
  attributes: AttributeFormState[]
  variants: VariantFormState[]
  sku: string
  price: string
  salePrice: string
  costPrice: string
  stock: string
  lowStockThreshold: string
  categoryId: string
  brand: string
  tags: string
  weight: string
  dimensionLength: string
  dimensionWidth: string
  dimensionHeight: string
  dimensionUnit: string
  images: string[]
  primaryImage: string
  featured: boolean
  newArrival: boolean
  bestseller: boolean
  active: boolean
  visibility: 'public' | 'hidden'
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  canonicalUrl: string
  sortOrder: string
}

function value(val: unknown) {
  return val === null || val === undefined ? '' : String(val)
}

function initialState(product?: Product): FormState {
  const images = product?.images || []
  const hasVariants = Boolean(product?.hasVariants && Array.isArray(product.variants) && product.variants.length > 0)

  const attributes: AttributeFormState[] = Array.isArray(product?.attributes)
    ? product.attributes.map((a, i) => ({
      id: a.id || `attr-${i + 1}`,
      name: a.name || '',
      valuesText: (a.values || []).join(', ')
    }))
    : []

  const variants: VariantFormState[] = Array.isArray(product?.variants)
    ? product.variants.map((v, i) => ({
      id: v.id || `var-${i + 1}`,
      sku: v.sku || '',
      attributes: v.attributes || {},
      price: value(v.price),
      salePrice: value(v.salePrice),
      costPrice: value(v.costPrice),
      stock: value(v.stock ?? 0),
      lowStockThreshold: value(v.lowStockThreshold ?? 0),
      image: v.image || '',
      active: v.active !== false
    }))
    : []

  return {
    name: product?.name || '',
    slug: product?.slug || '',
    shortDescription: product?.shortDescription || '',
    description: product?.description || '',
    hasVariants,
    attributes,
    variants,
    sku: product?.sku || '',
    price: value(product?.price),
    salePrice: value(product?.salePrice),
    costPrice: value(product?.costPrice),
    stock: value(product?.stock ?? 0),
    lowStockThreshold: value(product?.lowStockThreshold ?? 0),
    categoryId: product?.categoryId || '',
    brand: product?.brand || '',
    tags: (product?.tags || []).join(', '),
    weight: value(product?.weight),
    dimensionLength: value(product?.dimensions?.length),
    dimensionWidth: value(product?.dimensions?.width),
    dimensionHeight: value(product?.dimensions?.height),
    dimensionUnit: product?.dimensions?.unit || 'cm',
    images,
    primaryImage: product?.primaryImage || images[0] || '',
    featured: product?.featured ?? false,
    newArrival: product?.newArrival ?? false,
    bestseller: product?.bestseller ?? false,
    active: product?.active ?? true,
    visibility: product?.visibility || (product?.active === false ? 'hidden' : 'public'),
    seoTitle: product?.seoTitle || '',
    seoDescription: product?.seoDescription || '',
    seoKeywords: (product?.seoKeywords || []).join(', '),
    canonicalUrl: product?.canonicalUrl || '',
    sortOrder: value(product?.sortOrder ?? 0)
  }
}

function fieldError(errors: Record<string, string>, name: string) {
  return errors[name] ? <div className="text-xs text-red-600 mt-1">{errors[name]}</div> : null
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-cream bg-ivory p-4">
      <h3 className="font-medium mb-3">{title}</h3>
      <div className="grid gap-3">{children}</div>
    </section>
  )
}

function computeCartesianProduct(attrs: Array<{ name: string; values: string[] }>): Array<Record<string, string>> {
  const valid = attrs.filter((a) => a.name.trim() && a.values.length > 0)
  if (valid.length === 0) return []

  let results: Array<Record<string, string>> = [{}]
  for (const attr of valid) {
    const next: Array<Record<string, string>> = []
    for (const r of results) {
      for (const v of attr.values) {
        next.push({ ...r, [attr.name.trim()]: v.trim() })
      }
    }
    results = next
  }
  return results
}

export default function ProductForm({ initialProduct, categories, mode }: ProductFormProps) {
  const router = useRouter()
  const toast = useToast()
  const [form, setForm] = useState<FormState>(() => initialState(initialProduct))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [slugTouched, setSlugTouched] = useState(Boolean(initialProduct?.slug))

  const primaryOptions = useMemo(() => form.images, [form.images])

  // Derived stock for variant products
  const derivedVariantStock = useMemo(() => {
    return form.variants
      .filter((v) => v.active)
      .reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0)
  }, [form.variants])

  function setField<K extends keyof FormState>(key: K, next: FormState[K]) {
    setForm((current) => ({ ...current, [key]: next }))
  }

  function handleNameChange(nextName: string) {
    setForm((current) => ({
      ...current,
      name: nextName,
      slug: slugTouched ? current.slug : slugify(nextName)
    }))
  }

  function handleImages(nextImages: string[]) {
    setForm((current) => ({
      ...current,
      images: nextImages,
      primaryImage: nextImages[0] || ''
    }))
  }

  // --- Attribute Management ---
  function addAttribute() {
    setForm((current) => ({
      ...current,
      attributes: [
        ...current.attributes,
        { id: `attr-${Date.now().toString(36)}`, name: '', valuesText: '' }
      ]
    }))
  }

  function updateAttribute(idx: number, patch: Partial<AttributeFormState>) {
    setForm((current) => {
      const copy = [...current.attributes]
      copy[idx] = { ...copy[idx], ...patch }
      return { ...current, attributes: copy }
    })
  }

  function removeAttribute(idx: number) {
    setForm((current) => ({
      ...current,
      attributes: current.attributes.filter((_, i) => i !== idx)
    }))
  }

  // --- Variant Matrix Generation & Management ---
  function generateVariantMatrix() {
    const parsedAttributes = form.attributes.map((a) => ({
      name: a.name.trim(),
      values: a.valuesText
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    }))

    const combos = computeCartesianProduct(parsedAttributes)
    if (combos.length === 0) return

    setForm((current) => {
      // Map existing variants by canonical combination key to preserve edits
      const existingMap = new Map<string, VariantFormState>()
      for (const v of current.variants) {
        const key = canonicalAttributeKey(v.attributes)
        if (key) existingMap.set(key, v)
      }

      const nextVariants: VariantFormState[] = combos.map((combo, idx) => {
        const key = canonicalAttributeKey(combo)
        const existing = existingMap.get(key)

        if (existing) {
          return {
            ...existing,
            attributes: combo
          }
        }

        const autoSku = generateVariantSku(current.sku || current.name, combo)
        return {
          id: `var-${Date.now().toString(36)}-${idx + 1}`,
          sku: autoSku,
          attributes: combo,
          price: current.price || '0',
          salePrice: '',
          costPrice: current.costPrice || '',
          stock: '10',
          lowStockThreshold: current.lowStockThreshold || '0',
          image: current.primaryImage || '',
          active: true
        }
      })

      return { ...current, variants: nextVariants }
    })
  }

  function updateVariant(idx: number, patch: Partial<VariantFormState>) {
    setForm((current) => {
      const copy = [...current.variants]
      copy[idx] = { ...copy[idx], ...patch }
      return { ...current, variants: copy }
    })
  }

  function removeVariant(idx: number) {
    setForm((current) => ({
      ...current,
      variants: current.variants.filter((_, i) => i !== idx)
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setMessage('')
    setErrors({})

    const parsedAttributes: ProductAttribute[] = form.attributes
      .filter((a) => a.name.trim())
      .map((a, i) => ({
        id: a.id || `attr-${i + 1}`,
        name: a.name.trim(),
        values: a.valuesText
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      }))

    const parsedVariants: ProductVariant[] = form.variants.map((v, i) => {
      const priceNum = v.price ? Number(v.price) : 0
      const saleNum = v.salePrice !== '' && !Number.isNaN(Number(v.salePrice)) ? Number(v.salePrice) : null
      const costNum = v.costPrice !== '' && !Number.isNaN(Number(v.costPrice)) ? Number(v.costPrice) : null
      const stockNum = parseInt(v.stock, 10) || 0
      const lowStockNum = parseInt(v.lowStockThreshold, 10) || 0

      return {
        id: v.id || `var-${Date.now().toString(36)}-${i + 1}`,
        sku: v.sku.trim(),
        attributes: v.attributes,
        price: priceNum,
        salePrice: saleNum,
        costPrice: costNum,
        stock: stockNum,
        lowStockThreshold: lowStockNum,
        image: v.image || undefined,
        active: v.active
      }
    })

    const payload = {
      name: form.name,
      slug: form.slug,
      shortDescription: form.shortDescription,
      description: form.description,
      hasVariants: form.hasVariants,
      attributes: form.hasVariants ? parsedAttributes : [],
      variants: form.hasVariants ? parsedVariants : [],
      sku: form.sku,
      price: form.hasVariants ? undefined : form.price,
      salePrice: form.hasVariants ? undefined : form.salePrice,
      costPrice: form.hasVariants ? undefined : form.costPrice,
      currency: 'BDT',
      stock: form.hasVariants ? derivedVariantStock : form.stock,
      lowStockThreshold: form.lowStockThreshold,
      categoryId: form.categoryId,
      brand: form.brand,
      tags: form.tags,
      weight: form.weight,
      dimensions: {
        length: form.dimensionLength,
        width: form.dimensionWidth,
        height: form.dimensionHeight,
        unit: form.dimensionUnit
      },
      images: form.images,
      primaryImage: form.primaryImage,
      featured: form.featured,
      newArrival: form.newArrival,
      bestseller: form.bestseller,
      active: form.active,
      visibility: form.visibility,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      seoKeywords: form.seoKeywords,
      canonicalUrl: form.canonicalUrl,
      sortOrder: form.sortOrder
    }

    const url = mode === 'create' ? '/api/products' : `/api/products/${initialProduct?.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    try {
      const response = await fetch(url, {
        method,
        body: JSON.stringify(payload),
        headers: { 'content-type': 'application/json' }
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setErrors(data?.errors || {})
        throw new Error(data?.error || 'Could not save product.')
      }
      if (!data?.id) throw new Error('The server returned an invalid product response.')

      setForm(initialState(data as Product))
      toast?.show(mode === 'create' ? 'Product created successfully.' : 'Product saved successfully.')
      router.push('/admin/products')
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save product.'
      setMessage(message)
      toast?.show(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 max-w-5xl">
      {message && (
        <div
          className={`rounded border p-3 text-sm ${Object.keys(errors).length ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
            }`}
        >
          {message}
        </div>
      )}

      {/* Basic Information */}
      <Section title="Basic Information">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-sm">
            Product Name *
            <input
              className="mt-1 w-full border p-2 rounded"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
            {fieldError(errors, 'name')}
          </label>
          <label className="text-sm">
            Slug
            <input
              className="mt-1 w-full border p-2 rounded"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                setField('slug', slugify(e.target.value))
              }}
            />
            {fieldError(errors, 'slug')}
          </label>
        </div>
        <label className="text-sm">
          Short description
          <input
            className="mt-1 w-full border p-2 rounded"
            value={form.shortDescription}
            onChange={(e) => setField('shortDescription', e.target.value)}
          />
        </label>
        <label className="text-sm">
          Full description
          <textarea
            className="mt-1 w-full min-h-24 border p-2 rounded"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
        </label>
      </Section>

      {/* Variants Toggle & Management */}
      <Section title="Product Type & Variants">
        <div className="flex items-center gap-3 p-3 bg-white border border-taupe/20 rounded-md">
          <input
            type="checkbox"
            id="hasVariants"
            checked={form.hasVariants}
            onChange={(e) => setField('hasVariants', e.target.checked)}
            className="w-4 h-4 text-mocha rounded"
          />
          <label htmlFor="hasVariants" className="text-sm font-medium text-charcoal cursor-pointer">
            This product has multiple options / variants (e.g. Size, Color, Fabric)
          </label>
        </div>

        {form.hasVariants && (
          <div className="space-y-5 mt-3 pt-3 border-t border-cream">
            {/* Attributes definition */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-charcoal">1. Option Attributes</h4>
                <button
                  type="button"
                  onClick={addAttribute}
                  className="px-3 py-1 bg-cream text-charcoal hover:bg-taupe/20 rounded text-xs font-medium transition"
                >
                  + Add Option (e.g. Size)
                </button>
              </div>

              {form.attributes.length === 0 ? (
                <div className="p-4 bg-white border border-dashed border-taupe/30 rounded text-xs text-taupe text-center">
                  Click &quot;+ Add Option&quot; to define variant dimensions such as Size (52, 54, 56) or Color (White, Black).
                </div>
              ) : (
                <div className="space-y-3">
                  {form.attributes.map((attr, idx) => (
                    <div key={attr.id} className="grid md:grid-cols-[160px_1fr_40px] gap-2 p-3 bg-white border rounded">
                      <div>
                        <label className="text-xs text-taupe">Option Name</label>
                        <input
                          className="mt-1 w-full border p-1.5 rounded text-sm"
                          placeholder="e.g. Size"
                          value={attr.name}
                          onChange={(e) => updateAttribute(idx, { name: e.target.value })}
                        />
                        {fieldError(errors, `attr_${idx}_name`)}
                      </div>
                      <div>
                        <label className="text-xs text-taupe">Option Values (comma separated)</label>
                        <input
                          className="mt-1 w-full border p-1.5 rounded text-sm"
                          placeholder="e.g. 52, 54, 56, 58"
                          value={attr.valuesText}
                          onChange={(e) => updateAttribute(idx, { valuesText: e.target.value })}
                        />
                        {fieldError(errors, `attr_${idx}_values`)}
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeAttribute(idx)}
                          aria-label="Remove option"
                          className="p-1.5 text-taupe hover:text-red-600 transition"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={generateVariantMatrix}
                      className="px-4 py-2 bg-mocha text-ivory text-xs font-medium rounded hover:opacity-90 transition shadow-xs"
                    >
                      Generate Variant Matrix
                    </button>
                    <span className="text-xs text-taupe">
                      Generates combinations from above options without overwriting existing variant prices/stock.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Variant Matrix Rows */}
            <div className="space-y-3 pt-4 border-t border-cream">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-charcoal">
                  2. Variant Matrix ({form.variants.length} combinations)
                </h4>
                <span className="text-xs text-mocha font-medium">
                  Total Active Stock: {derivedVariantStock}
                </span>
              </div>
              {fieldError(errors, 'variants')}

              {form.variants.length === 0 ? (
                <div className="p-4 bg-white border border-dashed border-taupe/30 rounded text-xs text-taupe text-center">
                  No variant combinations generated yet. Define options and click &quot;Generate Variant Matrix&quot;.
                </div>
              ) : (
                <div className="space-y-3 overflow-x-auto">
                  {form.variants.map((variant, vIdx) => {
                    const comboSummary = Object.entries(variant.attributes)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' • ')

                    return (
                      <div
                        key={variant.id}
                        className={`p-3 rounded border text-xs grid gap-3 ${variant.active ? 'bg-white border-cream' : 'bg-gray-50 border-gray-200 opacity-60'
                          }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 border-cream">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-charcoal text-sm">{comboSummary || `Variant #${vIdx + 1}`}</span>
                            <label className="flex items-center gap-1.5 text-xs text-taupe ml-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={variant.active}
                                onChange={(e) => updateVariant(vIdx, { active: e.target.checked })}
                              />
                              Active
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVariant(vIdx)}
                            className="text-taupe hover:text-red-600 transition"
                            aria-label={`Remove variant ${comboSummary}`}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                          <label>
                            SKU *
                            <input
                              className="mt-1 w-full border p-1.5 rounded text-xs"
                              value={variant.sku}
                              onChange={(e) => updateVariant(vIdx, { sku: e.target.value })}
                              required
                            />
                            {fieldError(errors, `variant_${vIdx}_sku`)}
                          </label>
                          <label>
                            Price (Tk) *
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="mt-1 w-full border p-1.5 rounded text-xs"
                              value={variant.price}
                              onChange={(e) => updateVariant(vIdx, { price: e.target.value })}
                              required
                            />
                            {fieldError(errors, `variant_${vIdx}_price`)}
                          </label>
                          <label>
                            Sale Price (Tk)
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="mt-1 w-full border p-1.5 rounded text-xs"
                              value={variant.salePrice}
                              onChange={(e) => updateVariant(vIdx, { salePrice: e.target.value })}
                            />
                            {fieldError(errors, `variant_${vIdx}_salePrice`)}
                          </label>
                          <label>
                            Cost Price (Tk)
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="mt-1 w-full border p-1.5 rounded text-xs"
                              value={variant.costPrice}
                              onChange={(e) => updateVariant(vIdx, { costPrice: e.target.value })}
                            />
                          </label>
                          <label>
                            Stock *
                            <input
                              type="number"
                              min="0"
                              className="mt-1 w-full border p-1.5 rounded text-xs"
                              value={variant.stock}
                              onChange={(e) => updateVariant(vIdx, { stock: e.target.value })}
                              required
                            />
                            {fieldError(errors, `variant_${vIdx}_stock`)}
                          </label>
                          <label>
                            Image Override
                            <select
                              className="mt-1 w-full border p-1.5 rounded text-xs"
                              value={variant.image}
                              onChange={(e) => updateVariant(vIdx, { image: e.target.value })}
                            >
                              <option value="">Default Image</option>
                              {primaryOptions.map((src, i) => (
                                <option key={src} value={src}>
                                  Gallery Image {i + 1}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* Simple Pricing & Inventory (only shown when hasVariants is false) */}
      {!form.hasVariants && (
        <>
          <Section title="Pricing">
            <div className="grid md:grid-cols-3 gap-3">
              <label className="text-sm">
                Price (Tk) *
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 w-full border p-2 rounded"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  required
                />
                {fieldError(errors, 'price')}
              </label>
              <label className="text-sm">
                Sale price (Tk)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 w-full border p-2 rounded"
                  value={form.salePrice}
                  onChange={(e) => setField('salePrice', e.target.value)}
                />
                {fieldError(errors, 'salePrice')}
              </label>
              <label className="text-sm">
                Cost price (Tk)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 w-full border p-2 rounded"
                  value={form.costPrice}
                  onChange={(e) => setField('costPrice', e.target.value)}
                />
                {fieldError(errors, 'costPrice')}
              </label>
            </div>
          </Section>

          <Section title="Inventory">
            <div className="grid md:grid-cols-3 gap-3">
              <label className="text-sm">
                SKU
                <input
                  className="mt-1 w-full border p-2 rounded"
                  value={form.sku}
                  onChange={(e) => setField('sku', e.target.value)}
                />
                {fieldError(errors, 'sku')}
              </label>
              <label className="text-sm">
                Stock *
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full border p-2 rounded"
                  value={form.stock}
                  onChange={(e) => setField('stock', e.target.value)}
                />
                {fieldError(errors, 'stock')}
              </label>
              <label className="text-sm">
                Low stock threshold
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full border p-2 rounded"
                  value={form.lowStockThreshold}
                  onChange={(e) => setField('lowStockThreshold', e.target.value)}
                />
                {fieldError(errors, 'lowStockThreshold')}
              </label>
            </div>
          </Section>
        </>
      )}

      {/* Organization */}
      <Section title="Organization">
        <div className="grid md:grid-cols-3 gap-3">
          <label className="text-sm">
            Category
            <select
              className="mt-1 w-full border p-2 rounded"
              value={form.categoryId}
              onChange={(e) => setField('categoryId', e.target.value)}
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {fieldError(errors, 'categoryId')}
          </label>
          <label className="text-sm">
            Brand
            <input
              className="mt-1 w-full border p-2 rounded"
              value={form.brand}
              onChange={(e) => setField('brand', e.target.value)}
            />
          </label>
          <label className="text-sm">
            Sort order
            <input
              type="number"
              className="mt-1 w-full border p-2 rounded"
              value={form.sortOrder}
              onChange={(e) => setField('sortOrder', e.target.value)}
            />
          </label>
        </div>
        <label className="text-sm">
          Tags
          <input
            className="mt-1 w-full border p-2 rounded"
            value={form.tags}
            onChange={(e) => setField('tags', e.target.value)}
            placeholder="Comma separated"
          />
        </label>
      </Section>

      {/* Media */}
      <Section title="Media">
        <MediaPicker value={form.images} onChange={handleImages} multiple />
        {form.images.length > 0 && (
          <div className="grid md:grid-cols-[1fr_220px] gap-3">
            <div className="flex flex-wrap gap-2">
              {form.images.map((src, i) => (
                <div key={src} className="relative rounded border border-cream bg-white p-2">
                  <Image
                    src={src}
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover"
                    alt={`Product image ${i + 1}`}
                  />
                  {form.primaryImage === src && <div className="mt-1 text-xs text-mocha font-medium">Primary</div>}
                </div>
              ))}
            </div>
            <label className="text-sm">
              Primary image
              <select
                className="mt-1 w-full border p-2 rounded"
                value={form.primaryImage}
                onChange={(e) => setField('primaryImage', e.target.value)}
              >
                {primaryOptions.map((src, i) => (
                  <option key={src} value={src}>
                    Image {i + 1}
                  </option>
                ))}
              </select>
              {fieldError(errors, 'primaryImage')}
            </label>
          </div>
        )}
      </Section>

      {/* Flags */}
      <Section title="Product Flags">
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setField('featured', e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.newArrival}
              onChange={(e) => setField('newArrival', e.target.checked)}
            />
            New arrival
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.bestseller}
              onChange={(e) => setField('bestseller', e.target.checked)}
            />
            Bestseller
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setField('active', e.target.checked)}
            />
            Active
          </label>
          <label className="text-sm">
            Visibility
            <select
              className="mt-1 w-full border p-2 rounded"
              value={form.visibility}
              onChange={(e) => setField('visibility', e.target.value as FormState['visibility'])}
            >
              <option value="public">Public</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
        </div>
      </Section>

      {/* Physical Information */}
      <Section title="Physical Information">
        <div className="grid md:grid-cols-5 gap-3">
          <label className="text-sm">
            Weight (kg)
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full border p-2 rounded"
              value={form.weight}
              onChange={(e) => setField('weight', e.target.value)}
            />
            {fieldError(errors, 'weight')}
          </label>
          <label className="text-sm">
            Length
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full border p-2 rounded"
              value={form.dimensionLength}
              onChange={(e) => setField('dimensionLength', e.target.value)}
            />
          </label>
          <label className="text-sm">
            Width
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full border p-2 rounded"
              value={form.dimensionWidth}
              onChange={(e) => setField('dimensionWidth', e.target.value)}
            />
          </label>
          <label className="text-sm">
            Height
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full border p-2 rounded"
              value={form.dimensionHeight}
              onChange={(e) => setField('dimensionHeight', e.target.value)}
            />
          </label>
          <label className="text-sm">
            Unit
            <input
              className="mt-1 w-full border p-2 rounded"
              value={form.dimensionUnit}
              onChange={(e) => setField('dimensionUnit', e.target.value)}
            />
          </label>
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO">
        <label className="text-sm">
          SEO title
          <input
            className="mt-1 w-full border p-2 rounded"
            value={form.seoTitle}
            onChange={(e) => setField('seoTitle', e.target.value)}
          />
        </label>
        <label className="text-sm">
          SEO description
          <textarea
            className="mt-1 w-full min-h-20 border p-2 rounded"
            value={form.seoDescription}
            onChange={(e) => setField('seoDescription', e.target.value)}
          />
        </label>
        <label className="text-sm">
          SEO keywords
          <input
            className="mt-1 w-full border p-2 rounded"
            value={form.seoKeywords}
            onChange={(e) => setField('seoKeywords', e.target.value)}
            placeholder="Comma separated"
          />
        </label>
        <label className="text-sm">
          Canonical URL
          <input
            className="mt-1 w-full border p-2 rounded"
            value={form.canonicalUrl}
            onChange={(e) => setField('canonicalUrl', e.target.value)}
          />
        </label>
      </Section>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          className="px-6 py-2.5 bg-mocha text-ivory rounded font-medium disabled:opacity-60 transition shadow-sm"
          disabled={saving}
        >
          {saving ? 'Saving...' : mode === 'create' ? 'Create product' : 'Save product'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-4 py-2 border rounded font-medium text-charcoal hover:bg-cream transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
