"use client"

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, Category, ProductVariant } from '../../types/models';
import { useCart } from '../../context/CartContext';

function formatPrice(value?: number | null) {
  return typeof value === 'number' ? `Tk ${value.toLocaleString('en-US')}` : undefined;
}

const ProductDetail = ({ product, category, categories }: { product: Product; category?: Category; categories: Category[] }) => {
  const { addItem, isHydrated } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const hasVariants = Boolean(product.hasVariants && Array.isArray(product.variants) && product.variants.length > 0);
  const attributes = useMemo(() => product.attributes || [], [product.attributes]);
  const variants = useMemo(() => product.variants || [], [product.variants]);

  // Default initial selected attributes: use first active in-stock variant if available
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    if (!hasVariants || !product.variants || product.variants.length === 0) return {};
    const firstActive = product.variants.find((v) => v.active && v.stock > 0) || product.variants.find((v) => v.active) || product.variants[0];
    return firstActive ? { ...firstActive.attributes } : {};
  });

  // Find exact matching variant based on all selected attributes
  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    if (!hasVariants) return undefined;
    if (attributes.length === 0) return variants[0];

    const hasAllAttributes = attributes.every((attr) => Boolean(selectedAttributes[attr.name]));
    if (!hasAllAttributes) return undefined;

    return variants.find((v) => {
      return attributes.every((attr) => v.attributes[attr.name] === selectedAttributes[attr.name]);
    });
  }, [hasVariants, attributes, variants, selectedAttributes]);

  const images = product.images?.length ? product.images : product.primaryImage ? [product.primaryImage] : [];
  const [mainImage, ...gallery] = images.length ? [images[0], ...images.slice(1)] : ['/products/placeholder.svg'];
  const [activeImage, setActiveImage] = useState(mainImage);

  // If selected variant has a specific image override, switch to it
  useEffect(() => {
    if (selectedVariant?.image) {
      setActiveImage(selectedVariant.image);
    }
  }, [selectedVariant]);

  const flags = [
    product.newArrival && 'New Arrival',
    product.featured && 'Featured',
    product.bestseller && 'Bestseller',
    product.onSale && 'Sale',
  ].filter(Boolean);

  const categoryHref = category ? `/category/${category.slug || category.id}` : undefined;
  const isProductInactive = product.active === false || product.visibility === 'hidden';

  // Availability & stock derived based on variant or simple product
  const isOutOfStock = hasVariants
    ? isProductInactive || !selectedVariant || !selectedVariant.active || selectedVariant.stockStatus === 'out_of_stock' || selectedVariant.stock <= 0
    : isProductInactive || product.stockStatus === 'out_of_stock' || (typeof product.stock === 'number' && product.stock <= 0);

  const maxStock = isOutOfStock
    ? 0
    : hasVariants
      ? selectedVariant && typeof selectedVariant.stock === 'number'
        ? selectedVariant.stock
        : 99
      : typeof product.stock === 'number'
        ? Math.max(0, product.stock)
        : 99;

  const currentSku = hasVariants && selectedVariant ? selectedVariant.sku : product.sku;

  const effectiveDisplayPrice = hasVariants && selectedVariant
    ? typeof selectedVariant.salePrice === 'number' && selectedVariant.salePrice < selectedVariant.price
      ? { current: selectedVariant.salePrice, original: selectedVariant.price, onSale: true }
      : { current: selectedVariant.price, original: null, onSale: false }
    : typeof product.salePrice === 'number' && product.salePrice < product.price
      ? { current: product.salePrice, original: product.price, onSale: true }
      : { current: product.price, original: null, onSale: false };

  function handleAttributeSelect(attrName: string, value: string) {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName]: value
    }));
    setSelectedQty(1);
  }

  function handleQuantityChange(delta: number) {
    if (isOutOfStock) return;
    setSelectedQty((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxStock) return maxStock;
      return next;
    });
  }

  function handleAddToCart() {
    if (isOutOfStock) return;
    if (hasVariants && !selectedVariant) return;

    setAdding(true);
    addItem(
      product.id,
      selectedQty,
      selectedVariant ? selectedVariant.id : undefined,
      selectedVariant ? selectedVariant.stock : product.stock
    );
    setTimeout(() => {
      setAdding(false);
    }, 400);
  }

  return (
    <main className="storefront-shell">
      <div className="site-container grid grid-cols-1 gap-10 pb-16 pt-8 sm:gap-12 sm:pb-20 sm:pt-12 md:grid-cols-2 md:gap-10 lg:gap-16 lg:pb-24 lg:pt-16">
        {/* Left: Gallery */}
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[18px] border border-black/10 bg-cream shadow-[0_18px_45px_rgba(65,49,37,0.10)]">
            <Image src={activeImage} alt={product.name} fill style={{ objectFit: 'cover' }} priority />
          </div>
          {gallery.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 hide-scrollbar sm:gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  aria-label={`View image ${i + 1} for ${product.name}`}
                  className={`relative h-16 w-16 overflow-hidden rounded-[10px] border transition sm:h-20 sm:w-20 ${activeImage === img ? 'ring-2 ring-mocha border-transparent' : 'border-black/10 opacity-80 hover:opacity-100'
                    }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="flex flex-col justify-start">
          <p className="storefront-eyebrow mb-3">The considered edit</p>
          <h1 className="mb-3 font-serif text-4xl font-semibold leading-[1.05] text-charcoal sm:text-5xl">{product.name}</h1>

          {flags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {flags.map((flag, i) => (
                <span key={i} className="rounded-full bg-oxblood px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                  {flag}
                </span>
              ))}
            </div>
          )}

          <div className="mb-5 flex items-center gap-2 text-sm text-taupe">
            {category && categoryHref && (
              <Link href={categoryHref} className="underline hover:text-charcoal transition">
                {category.name}
              </Link>
            )}
            {category && currentSku && <span>•</span>}
            {currentSku && <span>SKU: {currentSku}</span>}
          </div>

          {/* Pricing */}
          <div className="mb-5 border-b border-black/10 pb-5">
            {effectiveDisplayPrice.onSale ? (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-mocha">{formatPrice(effectiveDisplayPrice.current)}</span>
                <span className="text-base text-taupe line-through">{formatPrice(effectiveDisplayPrice.original)}</span>
              </div>
            ) : (
              <div className="text-3xl font-semibold text-mocha">{formatPrice(effectiveDisplayPrice.current)}</div>
            )}
          </div>

          {/* Stock Status Badge */}
          <div className="mb-5">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${isOutOfStock
                ? 'bg-red-50 text-red-700 border border-red-200'
                : (hasVariants ? selectedVariant?.stockStatus : product.stockStatus) === 'low_stock'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
            >
              {isProductInactive && 'Currently Unavailable'}
              {!isProductInactive && isOutOfStock && 'Out of Stock'}
              {!isProductInactive && !isOutOfStock && (hasVariants ? selectedVariant?.stockStatus : product.stockStatus) === 'low_stock' && `Low Stock (${maxStock} available)`}
              {!isProductInactive && !isOutOfStock && (hasVariants ? selectedVariant?.stockStatus : product.stockStatus) !== 'low_stock' && 'In Stock'}
            </span>
          </div>

          {/* Variant Attributes Selection */}
          {hasVariants && attributes.length > 0 && (
            <div className="mb-6 space-y-5 rounded-[14px] border border-black/10 bg-white/65 p-5 sm:p-6">
              {attributes.map((attr) => (
                <div key={attr.id} className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-semibold text-charcoal tracking-wide uppercase">{attr.name}:</span>
                    <span className="text-taupe">{selectedAttributes[attr.name] || 'Select'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attr.values.map((val) => {
                      const isSelected = selectedAttributes[attr.name] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleAttributeSelect(attr.name, val)}
                          className={`rounded-full border px-4 py-2 text-xs font-medium transition sm:text-sm ${isSelected
                            ? 'bg-mocha text-ivory border-mocha shadow-xs'
                            : 'bg-white text-charcoal border-taupe/30 hover:border-mocha hover:bg-cream/40'
                            }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {product.shortDescription && (
            <div className="mb-6 text-sm leading-7 text-charcoal/65 sm:text-base">
              {product.shortDescription}
            </div>
          )}

          {/* Add to Bag Controls */}
          <div className="mb-6 rounded-[14px] border border-black/10 bg-cream/70 p-4 sm:p-5">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              {/* Quantity Selector */}
              <div className="flex min-h-[48px] items-center justify-between rounded-[10px] border border-black/10 bg-white sm:justify-start">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={selectedQty <= 1 || isOutOfStock}
                  aria-label="Decrease quantity"
                  className="px-3.5 py-2 text-sm font-semibold text-charcoal hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent transition"
                >
                  -
                </button>
                <span className="px-3 text-sm font-medium text-charcoal min-w-[32px] text-center" aria-live="polite">
                  {isOutOfStock ? 0 : selectedQty}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={selectedQty >= maxStock || isOutOfStock}
                  aria-label="Increase quantity"
                  className="px-3.5 py-2 text-sm font-semibold text-charcoal hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent transition"
                >
                  +
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                aria-label={isOutOfStock ? `${product.name} is currently out of stock` : `Add ${product.name} to bag`}
                className={`flex min-h-[48px] flex-1 items-center justify-center rounded-[10px] px-6 py-3 text-sm font-semibold transition shadow-sm ${isOutOfStock
                  ? 'bg-taupe/40 text-taupe cursor-not-allowed'
                  : 'bg-mocha text-ivory hover:opacity-90 active:scale-[0.99]'
                  }`}
              >
                {isProductInactive ? (
                  'Unavailable'
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : adding ? (
                  'Adding...'
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mr-2 stroke-current" strokeWidth="1.5">
                      <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="9" cy="20" r="1" />
                      <circle cx="19" cy="20" r="1" />
                    </svg>
                    Add to Bag
                  </>
                )}
              </button>
            </div>

            {!isOutOfStock && isHydrated && maxStock > 0 && maxStock <= 5 && (
              <p className="mt-2 text-xs text-amber-700">Only {maxStock} left in stock - order soon.</p>
            )}
          </div>

          {/* Full Description */}
          {product.description && (
            <div className="border-t border-black/10 pt-6">
              <h2 className="storefront-eyebrow mb-3">Description</h2>
              <div className="whitespace-pre-line text-sm leading-7 text-charcoal/75">
                {product.description}
              </div>
            </div>
          )}

          {/* Related products */}
          <RelatedProducts product={product} categories={categories} />
        </div>
      </div>
    </main>
  )
}

function RelatedProducts({ product, categories }: { product: Product; categories: Category[] }) {
  void product;
  void categories;
  return null;
}

export default ProductDetail;
