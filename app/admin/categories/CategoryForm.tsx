"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import MediaPicker from '../../../src/components/admin/MediaPicker'
import { useToast } from '../../../src/components/admin/Toast'
import type { Category, Product } from '../../../src/types/models'
import { slugify } from '../../../src/lib/productValidation'

type CategoryFormProps = {
  initialCategory?: Category
  mode: 'create' | 'edit'
}

export default function CategoryForm({ initialCategory, mode }: CategoryFormProps) {
  const router = useRouter()
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState(initialCategory?.name || '')
  const [slug, setSlug] = useState(initialCategory?.slug || '')
  const [description, setDescription] = useState(initialCategory?.description || '')
  const [image, setImage] = useState(initialCategory?.image || '')
  const [bannerImage, setBannerImage] = useState(initialCategory?.bannerImage || '')
  const [parentId, setParentId] = useState(initialCategory?.parentId || '')
  const [featured, setFeatured] = useState(initialCategory?.featured ?? false)
  const [active, setActive] = useState(initialCategory?.active ?? true)
  const [sortOrder, setSortOrder] = useState(String(initialCategory?.sortOrder ?? 0))
  const [seoTitle, setSeoTitle] = useState(initialCategory?.seoTitle || '')
  const [seoDescription, setSeoDescription] = useState(initialCategory?.seoDescription || '')
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialCategory?.selectedProductIds || [])
  const [productToAdd, setProductToAdd] = useState('')
  const [slugTouched, setSlugTouched] = useState(Boolean(initialCategory?.slug))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((response) => response.json()),
      fetch('/api/products').then((response) => response.json()),
    ]).then(([categoryData, productData]) => {
      setCategories(Array.isArray(categoryData) ? categoryData : [])
      setProducts(Array.isArray(productData) ? productData : [])
    }).catch(() => {
      setCategories([])
      setProducts([])
    })
  }, [])

  function handleNameChange(nextName: string) {
    setName(nextName)
    if (!slugTouched) setSlug(slugify(nextName))
  }

  function addProduct() {
    if (!productToAdd || selectedProductIds.includes(productToAdd)) return
    setSelectedProductIds((current) => [...current, productToAdd])
    setProductToAdd('')
  }

  function removeProduct(id: string) {
    setSelectedProductIds((current) => current.filter((productId) => productId !== id))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError('')
    const payload = {
      name: name.trim(),
      slug: (slug || slugify(name)).trim(),
      description: description.trim() || undefined,
      image: image || undefined,
      bannerImage: bannerImage || undefined,
      parentId: parentId || null,
      featured,
      active,
      sortOrder: Number(sortOrder) || 0,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      selectedProductIds,
    }
    const url = mode === 'create' ? '/api/categories' : `/api/categories/${initialCategory?.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'
    try {
      const response = await fetch(url, { method, body: JSON.stringify(payload), headers: { 'content-type': 'application/json' } })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Could not save category.')
      if (!data?.id) throw new Error('The server returned an invalid category response.')
      toast?.show(mode === 'create' ? 'Category created successfully.' : 'Category updated successfully.')
      router.push('/admin/categories')
      router.refresh()
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save category.'
      setError(message)
      toast?.show(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const availableProducts = products.filter((product) => !selectedProductIds.includes(product.id))
  const selectableCategories = categories.filter((category) => category.id !== initialCategory?.id)

  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-5 rounded border border-cream bg-ivory p-6">
      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Name<input className="mt-1 w-full rounded border p-2 font-normal" value={name} onChange={(e) => handleNameChange(e.target.value)} required /></label>
        <label className="text-sm font-medium">Slug<input className="mt-1 w-full rounded border p-2 font-normal" value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)) }} /></label>
      </div>
      <label className="text-sm font-medium">Parent category<select className="mt-1 w-full rounded border p-2 font-normal" value={parentId} onChange={(e) => setParentId(e.target.value)}><option value="">Top-level category</option>{selectableCategories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="text-sm font-medium">Description<textarea className="mt-1 min-h-[90px] w-full rounded border p-2 font-normal" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><div className="mb-1 text-sm font-medium">Category image</div><MediaPicker value={image ? [image] : []} onChange={(value: string[]) => setImage(value[0] || '')} />{image && <div className="relative mt-2 h-24 w-24 overflow-hidden rounded border border-cream bg-white"><Image src={image} alt="Category preview" fill className="object-cover" /></div>}</div>
        <div><div className="mb-1 text-sm font-medium">Banner image</div><MediaPicker value={bannerImage ? [bannerImage] : []} onChange={(value: string[]) => setBannerImage(value[0] || '')} />{bannerImage && <div className="relative mt-2 h-24 w-40 overflow-hidden rounded border border-cream bg-white"><Image src={bannerImage} alt="Banner preview" fill className="object-cover" /></div>}</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3"><label className="text-sm font-medium">Sort order<input type="number" className="mt-1 w-full rounded border p-2 font-normal" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} /></label><label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active</label><label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured</label></div>
      <div className="rounded border border-cream bg-white p-4"><div className="mb-2 text-sm font-medium">Selected products</div><div className="flex gap-2"><select className="min-w-0 flex-1 rounded border p-2 text-sm" value={productToAdd} onChange={(e) => setProductToAdd(e.target.value)}><option value="">Choose a product</option>{availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select><button type="button" onClick={addProduct} className="rounded border px-3 py-2 text-sm">Add</button></div><div className="mt-3 grid gap-2">{selectedProductIds.map((id, index) => { const product = products.find((item) => item.id === id); return <div key={id} className="flex items-center justify-between rounded border border-gray-100 px-3 py-2 text-sm"><span>{index + 1}. {product?.name || id}</span><button type="button" onClick={() => removeProduct(id)} className="text-red-700">Remove</button></div> })}</div></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">SEO title<input className="mt-1 w-full rounded border p-2 font-normal" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} /></label><label className="text-sm font-medium">SEO description<textarea className="mt-1 min-h-[70px] w-full rounded border p-2 font-normal" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} /></label></div>
      <div className="flex gap-2"><button type="submit" disabled={saving} className="rounded bg-mocha px-4 py-2 text-ivory disabled:opacity-60">{saving ? 'Saving...' : mode === 'create' ? 'Create Category' : 'Save Category'}</button><button type="button" onClick={() => router.push('/admin/categories')} className="rounded border px-4 py-2">Cancel</button></div>
    </form>
  )
}
