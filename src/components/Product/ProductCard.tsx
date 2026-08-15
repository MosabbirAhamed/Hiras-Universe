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

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-black/10 bg-white/55 transition duration-300 hover:-translate-y-0.5 hover:border-mocha/25 hover:shadow-[0_14px_32px_rgba(34,34,34,0.08)]">

      {/* Product Image */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-cream">

        {productHref ? (
          <Link
            href={productHref}
            className="absolute inset-0 block"
            aria-label={`View ${title}`}
          >
            <Image
              src={image ?? '/products/placeholder.svg'}
              alt={title}
              fill
              sizes="(max-width: 640px) 176px, 220px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
            />
          </Link>
        ) : (
          <Image
            src={image ?? '/products/placeholder.svg'}
            alt={title}
            fill
            sizes="(max-width: 640px) 176px, 220px"
            className="object-cover"
          />
        )}

        {/* Wishlist */}
        <button
          type="button"
          aria-label={`Save ${title} to wishlist`}
          className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/90 text-mocha shadow-sm transition-colors hover:bg-white"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.84 4.61c-1.54-1.34-3.77-1.46-5.4-.28L12 7.08 8.56 4.33C6.93 3.15 4.7 3.27 3.16 4.61 1.34 6.15 1.34 8.56 3.16 10.1L12 18.94l8.84-8.84c1.82-1.54 1.82-3.95 0-5.49z"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </button>

        {/* Sale Badge */}
        {onSale && (
          <div className="absolute left-2.5 top-2.5 z-10 rounded bg-mocha px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ivory">
            Sale
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">

        <div>
          {/* Category */}
          {category && (
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-taupe">
              {category}
            </div>
          )}

          {/* Product Name */}
          <h3 className="min-h-[40px] text-sm font-semibold leading-5 text-charcoal">
            {productHref ? (
              <Link
                href={productHref}
                className="transition-colors hover:text-mocha"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>

          {/* Price */}
          <div className="mt-2.5 min-h-[21px]">
            {salePrice ? (
              <div className="flex items-baseline gap-3">
                <span className="text-sm text-sale font-semibold">
                  {pricePrefix ? `${pricePrefix} ` : ''}
                  {salePrice}
                </span>

                <span className="text-xs text-taupe line-through">
                  {price}
                </span>
              </div>
            ) : (
              <div className="text-sm font-semibold text-mocha">
                {pricePrefix ? `${pricePrefix} ` : ''}
                {price}
              </div>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="mt-auto pt-4">

          {hasVariants && productHref ? (
            <Link
              href={productHref}
              aria-label={`Select options for ${title}`}
              className="btn-ghost block min-h-[44px] w-full px-3 py-2 text-center text-xs font-semibold uppercase leading-[26px] tracking-wider active:scale-[0.99]"
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