import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AddToBagButton from './AddToBagButton'

type Props = {
  id?: string
  title: string
  price: string
  salePrice?: string
  image?: string
  category?: string
  onSale?: boolean
  slug?: string
  stock?: number
  active?: boolean
  hasVariants?: boolean
  pricePrefix?: string
}

function extractNumber(str: string): number | null {
  const match = str.replace(/,/g, '').match(/\d+(\.\d+)?/)
  return match ? parseFloat(match[0]) : null
}

export const ProductCard = ({
  id,
  title,
  price,
  salePrice,
  image,
  category,
  onSale,
  slug,
  stock,
  active,
  hasVariants,
  pricePrefix
}: Props) => {
  const productHref = slug ? `/products/${slug}` : undefined

  // Calculate discount percentage if sale price is provided
  let discountPercent: number | null = null
  if (onSale && salePrice && price) {
    const orig = extractNumber(price)
    const sale = extractNumber(salePrice)
    if (orig && sale && orig > sale) {
      discountPercent = Math.round(((orig - sale) / orig) * 100)
    }
  }

  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card-background)] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
      {/* Product Image Area */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-section-background)]">
        {!image ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(145deg,var(--color-section-background),var(--color-surface))] px-4 text-center">
            <span className="font-serif text-xl text-[var(--color-primary)]/70">{"Hira's Universe"}</span>
            <span className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">Image coming soon</span>
          </div>
        ) : productHref ? (
          <Link
            href={productHref}
            className="absolute inset-0 block"
            aria-label={`View ${title}`}
          >
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 180px, (max-width: 1024px) 240px, 280px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </Link>
        ) : (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 240px, 280px"
            className="object-cover"
          />
        )}

        {/* Sale / Discount Badge Top-Left */}
        {onSale && (
          <div className="absolute left-2.5 top-2.5 z-10 rounded-md bg-[var(--color-sale)] px-2 py-0.5 text-[10px] font-bold tracking-tight text-[var(--color-sale-text)] shadow-sm">
            {discountPercent ? `-${discountPercent}%` : 'Sale'}
          </div>
        )}

        {/* Wishlist Button Top-Right */}
        <button
          type="button"
          aria-label={`Add ${title} to wishlist`}
          className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[var(--color-muted)] shadow-sm backdrop-blur-sm transition-colors hover:text-[var(--color-wishlist)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div>
          {/* Category */}
          {category && (
            <div className="mb-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {category}
            </div>
          )}

          {/* Product Name */}
          <h3 className="line-clamp-2 min-h-[38px] font-serif text-[14px] font-semibold leading-snug text-[var(--color-heading)] sm:text-[15px]">
            {productHref ? (
              <Link
                href={productHref}
                className="transition-colors hover:text-[var(--color-primary)]"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>

          {/* Star Ratings */}
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#EAB308]" aria-label="5 out of 5 stars">
            <span className="flex">★ ★ ★ ★ ★</span>
            <span className="text-[10px] text-[var(--color-muted)]">(25)</span>
          </div>

          {/* Price */}
          <div className="mt-2.5 flex items-baseline gap-2">
            {salePrice ? (
              <>
                <span className="text-sm font-bold text-[var(--color-sale)]">
                  {pricePrefix ? `${pricePrefix} ` : ''}
                  {salePrice}
                </span>
                <span className="text-xs text-[var(--color-muted)] line-through">
                  {price}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-[var(--color-heading)]">
                {pricePrefix ? `${pricePrefix} ` : ''}
                {price}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-3.5">
          {hasVariants && productHref ? (
            <Link
              href={productHref}
              aria-label={`Select options for ${title}`}
              className="flex min-h-[40px] w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-button-background)] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-button-text)] transition hover:bg-[var(--color-button-hover)] active:scale-[0.99]"
            >
              Select Options
            </Link>
          ) : (
            <AddToBagButton
              id={id}
              title={title}
              stock={stock}
              active={active}
              hasVariants={hasVariants}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard