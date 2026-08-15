"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '../../context/CartContext'

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
  const { addItem } = useCart()

  const productHref = slug ? `/products/${slug}` : undefined

  const isOutOfStock =
    (typeof stock === 'number' && stock <= 0) ||
    active === false

  function handleAdd() {
    if (id && !isOutOfStock && !hasVariants) {
      addItem(id, 1, undefined, stock)
    }
  }

  return (
    <article className="w-full bg-cream rounded overflow-hidden flex flex-col">

      {/* Product Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t">

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
              className="object-cover transition-transform duration-300 hover:scale-[1.02]"
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
          className="
            absolute
            top-3
            right-3
            z-10
            w-9
            h-9
            rounded-full
            bg-ivory
            border
            border-cream
            flex
            items-center
            justify-center
            text-mocha
          "
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
          <div className="absolute left-3 top-3 z-10 rounded bg-mocha px-2 py-1 text-xs text-ivory">
            Sale
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1">

        <div>
          {/* Category */}
          {category && (
            <div className="mb-1 text-xs text-taupe">
              {category}
            </div>
          )}

          {/* Product Name */}
          <h3 className="text-sm font-medium text-charcoal">
            {productHref ? (
              <Link
                href={productHref}
                className="hover:underline"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>

          {/* Price */}
          <div className="mt-2">
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
              <div className="text-sm text-mocha">
                {pricePrefix ? `${pricePrefix} ` : ''}
                {price}
              </div>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="mt-4">

          {hasVariants && productHref ? (
            <Link
              href={productHref}
              aria-label={`Select options for ${title}`}
              className="
                w-full
                block
                text-center
                text-sm
                font-medium
                border
                rounded-md
                px-3
                py-2
                min-h-[44px]
                leading-[26px]
                transition
                active:scale-[0.99]
                text-charcoal
                bg-ivory
                hover:bg-mocha
                hover:text-ivory
                border-cream
              "
            >
              Select Options
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              aria-label={
                isOutOfStock
                  ? `${title} is out of stock`
                  : `Add ${title} to bag`
              }
              className={`
                w-full
                text-sm
                font-medium
                border
                rounded-md
                px-3
                py-2
                min-h-[44px]
                transition
                active:scale-[0.99]
                ${
                  isOutOfStock
                    ? 'bg-taupe/20 text-taupe/70 border-cream cursor-not-allowed'
                    : 'text-charcoal bg-ivory hover:bg-mocha hover:text-ivory border-cream'
                }
              `}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </button>
          )}

        </div>
      </div>
    </article>
  )
}

export default ProductCard