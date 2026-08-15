/* eslint-disable no-unused-vars */
"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import type { CartItem, EnrichedCartItem, ID, Product, ProductVariant } from '../types/models'
import CartToast from '../components/cart/CartToast'

const STORAGE_KEY = 'hiras_cart_v1'

export type AddItemResult = {
  success: boolean
  message: string
}

export type CartContextType = {
  items: CartItem[]
  isHydrated: boolean
  isCatalogLoaded: boolean
  isDrawerOpen: boolean
  products: Product[]
  toastMessage: string | null
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  addItem: (productId: ID, quantity?: number, variantId?: ID, explicitMaxStock?: number) => AddItemResult
  removeItem: (productId: ID, variantId?: ID) => void
  updateQuantity: (productId: ID, quantity: number, variantId?: ID, explicitMaxStock?: number) => void
  incrementQuantity: (productId: ID, variantId?: ID, explicitMaxStock?: number) => void
  decrementQuantity: (productId: ID, variantId?: ID) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  isInCart: (productId: ID, variantId?: ID) => boolean
  getEnrichedItems: () => EnrichedCartItem[]
  showToast: (message: string) => void
  clearToast: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function getCartItemKey(productId: ID, variantId?: ID): string {
  return `${productId}::${variantId || 'default'}`
}

/**
 * Safely parse and sanitize cart items from unknown input (localStorage).
 * Deduplicates multiple occurrences with identical (productId, variantId).
 */
export function sanitizeCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []

  const merged = new Map<string, { productId: ID; variantId?: ID; quantity: number }>()

  for (const item of raw) {
    if (
      item !== null &&
      typeof item === 'object' &&
      typeof (item as any).productId === 'string' &&
      (item as any).productId.trim().length > 0 &&
      typeof (item as any).quantity === 'number' &&
      Number.isInteger((item as any).quantity) &&
      (item as any).quantity > 0
    ) {
      const pid = (item as any).productId.trim()
      const vid =
        typeof (item as any).variantId === 'string' && (item as any).variantId.trim().length > 0
          ? (item as any).variantId.trim()
          : undefined
      const key = getCartItemKey(pid, vid)
      const qty = (item as any).quantity

      const existing = merged.get(key)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + qty, 999)
      } else {
        merged.set(key, {
          productId: pid,
          variantId: vid,
          quantity: Math.min(qty, 999)
        })
      }
    }
  }

  return Array.from(merged.values())
}

export function CartProvider({
  children,
  initialProducts = []
}: {
  children: React.ReactNode
  initialProducts?: Product[]
}) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [isCatalogLoaded, setIsCatalogLoaded] = useState(initialProducts.length > 0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from localStorage on mount (hydration safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const validItems = sanitizeCartItems(parsed)
        setItems(validItems)
      }
    } catch {
      // safely ignore storage error
    } finally {
      setIsHydrated(true)
    }
  }, [])

  const cartProductIds = Array.from(new Set(items.map((item) => item.productId))).sort().join(',')

  // Fetch only products referenced by the cart. The storefront does not need the full catalog here.
  useEffect(() => {
    if (!isHydrated) return

    if (!cartProductIds) {
      setProducts([])
      setIsCatalogLoaded(true)
      return
    }

    fetch(`/api/products?ids=${encodeURIComponent(cartProductIds)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Catalog request failed'))))
      .then((data: Product[]) => {
        if (Array.isArray(data)) setProducts(data)
        setIsCatalogLoaded(true)
      })
      .catch(() => setIsCatalogLoaded(true))
  }, [isHydrated, cartProductIds])

  // Save to localStorage whenever items change after hydration
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // safely ignore storage error
    }
  }, [items, isHydrated])

  const productsMap = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]))
  }, [products])

  // Reconcile persisted cart items with authoritative catalog stock (simple & variants)
  useEffect(() => {
    if (!isHydrated || !isCatalogLoaded || products.length === 0) return

    setItems((prevItems) => {
      let changed = false
      const reconciled = prevItems.map((item) => {
        const product = productsMap.get(item.productId)
        if (!product) return item

        if (product.hasVariants && Array.isArray(product.variants)) {
          const variant = product.variants.find((v) => v.id === item.variantId)
          if (variant && typeof variant.stock === 'number' && variant.stock > 0 && item.quantity > variant.stock) {
            changed = true
            return { ...item, quantity: variant.stock }
          }
        } else if (typeof product.stock === 'number' && product.stock > 0 && item.quantity > product.stock) {
          changed = true
          return { ...item, quantity: product.stock }
        }
        return item
      })
      return changed ? reconciled : prevItems
    })
  }, [isHydrated, isCatalogLoaded, products, productsMap])

  const clearToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }
    setToastMessage(null)
  }, [])

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    setToastMessage(msg)
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null)
      toastTimerRef.current = null
    }, 3500)
  }, [])

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), [])

  const getItemMaxStock = useCallback(
    (productId: ID, variantId?: ID, fallbackStock?: number): number => {
      const product = productsMap.get(productId)
      if (product) {
        if (product.active === false || product.visibility === 'hidden') return 0
        if (product.hasVariants && Array.isArray(product.variants)) {
          if (!variantId) return 0
          const variant = product.variants.find((v) => v.id === variantId)
          if (!variant || variant.active === false) return 0
          if (variant.stockStatus === 'out_of_stock') return 0
          if (typeof variant.stock === 'number') return Math.max(0, variant.stock)
          return 999
        }
        if (product.stockStatus === 'out_of_stock') return 0
        if (typeof product.stock === 'number') return Math.max(0, product.stock)
        return 999
      }
      if (typeof fallbackStock === 'number') return Math.max(0, fallbackStock)
      if (isCatalogLoaded) return 0
      return 999
    },
    [productsMap, isCatalogLoaded]
  )

  const addItem = useCallback(
    (productId: ID, quantity = 1, variantId?: ID, explicitMaxStock?: number): AddItemResult => {
      const product = productsMap.get(productId)
      const maxStock = getItemMaxStock(productId, variantId, explicitMaxStock)

      if (
        maxStock <= 0 ||
        (product && (product.stockStatus === 'out_of_stock' || product.active === false || product.visibility === 'hidden'))
      ) {
        let msg = 'This item is currently unavailable.'
        if (product) {
          if (product.hasVariants && variantId) {
            const v = product.variants?.find((x) => x.id === variantId)
            const attrStr = v ? Object.values(v.attributes).join(' / ') : ''
            msg = `${product.name}${attrStr ? ` (${attrStr})` : ''} is currently out of stock.`
          } else {
            msg = `${product.name} is currently out of stock.`
          }
        }
        showToast(msg)
        return { success: false, message: msg }
      }

      if (product?.hasVariants && !variantId) {
        const msg = 'Please select your size and options before adding to bag.'
        showToast(msg)
        return { success: false, message: msg }
      }

      const existingItem = items.find(
        (item) => item.productId === productId && (item.variantId || undefined) === (variantId || undefined)
      )
      const currentQty = existingItem ? existingItem.quantity : 0

      if (currentQty >= maxStock) {
        const msg = `Maximum available stock (${maxStock}) reached for this item.`
        showToast(msg)
        return { success: false, message: msg }
      }

      const targetQty = currentQty + quantity
      const finalQty = Math.min(targetQty, maxStock)

      let resultMsg = 'Added to bag.'
      if (finalQty < targetQty) {
        resultMsg =
          currentQty > 0
            ? `Quantity adjusted to maximum available stock (${maxStock}).`
            : `Only ${maxStock} item(s) available in stock.`
      }

      setItems((prevItems) => {
        const idx = prevItems.findIndex(
          (item) => item.productId === productId && (item.variantId || undefined) === (variantId || undefined)
        )
        if (idx > -1) {
          const copy = [...prevItems]
          copy[idx] = { ...copy[idx], quantity: finalQty }
          return copy
        }
        return [...prevItems, { productId, variantId, quantity: finalQty }]
      })

      showToast(resultMsg)
      setIsDrawerOpen(true)
      return { success: true, message: resultMsg }
    },
    [items, productsMap, getItemMaxStock, showToast]
  )

  const removeItem = useCallback(
    (productId: ID, variantId?: ID) => {
      const product = productsMap.get(productId)
      setItems((prev) =>
        prev.filter(
          (item) => !(item.productId === productId && (item.variantId || undefined) === (variantId || undefined))
        )
      )
      if (product) {
        showToast(`Removed ${product.name} from bag.`)
      } else {
        showToast('Item removed from bag.')
      }
    },
    [productsMap, showToast]
  )

  const updateQuantity = useCallback(
    (productId: ID, newQty: number, variantId?: ID, explicitMaxStock?: number) => {
      if (newQty <= 0) {
        removeItem(productId, variantId)
        return
      }

      const maxStock = getItemMaxStock(productId, variantId, explicitMaxStock)
      const clampedQty = Math.min(newQty, maxStock)

      if (newQty > maxStock) {
        showToast(`Quantity adjusted to maximum available stock (${maxStock}).`)
      }

      setItems((prev) =>
        prev.map((item) => {
          if (item.productId === productId && (item.variantId || undefined) === (variantId || undefined)) {
            return { ...item, quantity: clampedQty }
          }
          return item
        })
      )
    },
    [getItemMaxStock, removeItem, showToast]
  )

  const incrementQuantity = useCallback(
    (productId: ID, variantId?: ID, explicitMaxStock?: number) => {
      const item = items.find(
        (i) => i.productId === productId && (i.variantId || undefined) === (variantId || undefined)
      )
      if (!item) return

      const maxStock = getItemMaxStock(productId, variantId, explicitMaxStock)
      if (item.quantity >= maxStock) {
        showToast(`Maximum available stock (${maxStock}) reached.`)
        return
      }

      setItems((prev) =>
        prev.map((i) => {
          if (i.productId === productId && (i.variantId || undefined) === (variantId || undefined)) {
            return { ...i, quantity: i.quantity + 1 }
          }
          return i
        })
      )
    },
    [items, getItemMaxStock, showToast]
  )

  const decrementQuantity = useCallback((productId: ID, variantId?: ID) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId && (item.variantId || undefined) === (variantId || undefined)) {
            return { ...item, quantity: item.quantity - 1 }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    showToast('Shopping bag cleared.')
  }, [showToast])

  const getItemCount = useCallback(() => {
    if (!isHydrated) return 0
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items, isHydrated])

  const isInCart = useCallback(
    (productId: ID, variantId?: ID) => {
      return items.some(
        (item) => item.productId === productId && (item.variantId || undefined) === (variantId || undefined)
      )
    },
    [items]
  )

  const getEnrichedItems = useCallback((): EnrichedCartItem[] => {
    return items.map((item) => {
      const product = productsMap.get(item.productId)

      // Base product existence and active checks
      const isProductDeleted = isCatalogLoaded && !product
      const isProductInactive = Boolean(product && (product.active === false || product.visibility === 'hidden'))

      if (isProductDeleted || isProductInactive || !product) {
        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          product: product || {
            id: item.productId,
            name: 'Product no longer available',
            price: 0,
            stock: 0,
            stockStatus: 'out_of_stock',
            active: false
          },
          effectivePrice: 0,
          lineTotal: 0,
          isOutOfStock: true,
          isMaxStock: false,
          isUnavailable: true
        }
      }

      // Handle Variant Product
      if (product.hasVariants && Array.isArray(product.variants)) {
        const variant = product.variants.find((v) => v.id === item.variantId)

        if (!variant || variant.active === false) {
          return {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            product: {
              ...product,
              name: `${product.name} (Variant no longer available)`
            },
            variant: undefined,
            selectedAttributes: variant?.attributes || undefined,
            effectivePrice: 0,
            lineTotal: 0,
            isOutOfStock: true,
            isMaxStock: false,
            isUnavailable: true
          }
        }

        const hasValidSalePrice = Boolean(
          typeof variant.salePrice === 'number' &&
          variant.salePrice >= 0 &&
          variant.salePrice < variant.price
        )
        const effectivePrice = hasValidSalePrice ? (variant.salePrice as number) : variant.price
        const maxStock = typeof variant.stock === 'number' ? Math.max(0, variant.stock) : 999
        const isOutOfStock = variant.stockStatus === 'out_of_stock' || variant.stock <= 0
        const isMaxStock = !isOutOfStock && item.quantity >= maxStock

        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          product,
          variant,
          selectedAttributes: variant.attributes,
          effectivePrice,
          lineTotal: effectivePrice * item.quantity,
          isOutOfStock,
          isMaxStock,
          isUnavailable: false
        }
      }

      // Handle Simple Product
      const isStockZero = Boolean(
        product.stockStatus === 'out_of_stock' || (typeof product.stock === 'number' && product.stock <= 0)
      )
      const isOutOfStock = isStockZero

      const hasValidSalePrice = Boolean(
        typeof product.salePrice === 'number' &&
        product.salePrice >= 0 &&
        (typeof product.price !== 'number' || product.salePrice < product.price)
      )
      const effectivePrice = hasValidSalePrice
        ? (product.salePrice as number)
        : typeof product.price === 'number' && product.price >= 0
          ? product.price
          : 0
      const maxStock = typeof product.stock === 'number' ? Math.max(0, product.stock) : 999
      const isMaxStock = !isOutOfStock && item.quantity >= maxStock

      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        product,
        effectivePrice,
        lineTotal: effectivePrice * item.quantity,
        isOutOfStock,
        isMaxStock,
        isUnavailable: false
      }
    })
  }, [items, productsMap, isCatalogLoaded])

  const getSubtotal = useCallback((): number => {
    const enriched = getEnrichedItems()
    return enriched.reduce((sum, item) => sum + item.lineTotal, 0)
  }, [getEnrichedItems])

  const value = useMemo(
    () => ({
      items,
      isHydrated,
      isCatalogLoaded,
      isDrawerOpen,
      products,
      toastMessage,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      removeItem,
      updateQuantity,
      incrementQuantity,
      decrementQuantity,
      clearCart,
      getItemCount,
      getSubtotal,
      isInCart,
      getEnrichedItems,
      showToast,
      clearToast
    }),
    [
      items,
      isHydrated,
      isCatalogLoaded,
      isDrawerOpen,
      products,
      toastMessage,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      removeItem,
      updateQuantity,
      incrementQuantity,
      decrementQuantity,
      clearCart,
      getItemCount,
      getSubtotal,
      isInCart,
      getEnrichedItems,
      showToast,
      clearToast
    ]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartToast />
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
