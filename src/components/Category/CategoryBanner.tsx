import Image from 'next/image'

type Props = {
    alt: string
    src: string
}

export default function CategoryBanner({ alt, src }: Props) {
    return (
        <div className="category-banner relative mt-8 aspect-[16/9] min-h-[150px] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-section-background)] sm:aspect-[20/9] sm:min-h-[210px]">
            <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover object-center"
            />
        </div>
    )
}
