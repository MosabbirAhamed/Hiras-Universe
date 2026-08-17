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
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-[18px] border border-black/10 bg-white/70 transition duration-300 hover:-translate-y-0.5 hover:border-mocha/25 hover:shadow-[0_18px_40px_rgba(65,49,37,0.09)]">

      {/* Product Image */}
      <div className="relative aspect-[4/5.4] w-full overflow-hidden bg-cream">

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

        {/* Sale Badge */}
        {onSale && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-[#7d4038] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
            Sale
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">

        <div>
          {/* Category */}
          {category && (
            <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#626753]">
              {category}
            </div>
          )}

          {/* Product Name */}
          <h3 className="min-h-[44px] font-serif text-[17px] font-semibold leading-[1.35] text-charcoal">
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
          <div className="mt-3 min-h-[22px]">
            {salePrice ? (
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-bold text-[#7d4038]">
                  {pricePrefix ? `${pricePrefix} ` : ''}
                  {salePrice}
                </span>

                <span className="text-xs text-taupe line-through">
                  {price}
                </span>
              </div>
            ) : (
              <div className="text-sm font-bold text-mocha">
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