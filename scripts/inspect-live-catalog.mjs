import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const envText = fs.readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
    envText
        .split(/\r?\n/)
        .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/))
        .filter(Boolean)
        .map((match) => [match[1], match[2].replace(/^['"]|['"]$/g, '')])
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Required Supabase environment variables are missing')

const supabase = createClient(url, key, { auth: { persistSession: false } })

const [categories, products, seededProducts, navigation] = await Promise.all([
    supabase.from('categories').select('id,slug'),
    supabase.from('products').select('id,slug,images,primary_image,variants'),
    supabase.from('products').select('id,slug,images,primary_image,variants').like('slug', 'seed-%'),
    supabase.from('settings').select('value').eq('key', 'navigation').maybeSingle(),
])

for (const result of [categories, products, seededProducts, navigation]) {
    if (result.error) throw result.error
}

const categoryRows = categories.data ?? []
const productRows = products.data ?? []
const seedRows = seededProducts.data ?? []
const navigationValue = navigation.data?.value
const navigationRoots = Array.isArray(navigationValue)
    ? navigationValue.map((item) => item?.label).filter(Boolean)
    : []

const emptyImages = seedRows.filter((row) => !Array.isArray(row.images) || row.images.length === 0).length
const noPrimaryImage = seedRows.filter((row) => !row.primary_image).length
const withVariants = seedRows.filter((row) => Array.isArray(row.variants) && row.variants.length > 0).length
const variantSizes = [...new Set(seedRows
    .flatMap((row) => Array.isArray(row.variants) ? row.variants : [])
    .map((variant) => variant?.attributes?.Size)
    .filter(Boolean))].sort()
const catalogSlugs = new Set([
    'women', 'men', 'kids', 'tupi',
    'women-hijabs', 'women-abayas', 'women-modest-dresses', 'women-khimars', 'women-prayer-wear', 'women-tunics', 'women-co-ord-sets',
    'men-panjabi', 'men-jubba', 'men-thobes', 'men-waistcoats', 'men-modest-shirts', 'men-menswear-sets',
    'kids-boys-panjabi', 'kids-girls-dresses', 'kids-hijab', 'kids-prayer-wear', 'kids-co-ords',
    'tupi-classic', 'tupi-embroidered', 'tupi-premium', 'tupi-winter',
])

console.log(JSON.stringify({
    totalCategories: categoryRows.length,
    catalogCategories: categoryRows.filter((row) => catalogSlugs.has(row.slug)).length,
    totalProducts: productRows.length,
    seedProducts: seedRows.length,
    seedProductsWithEmptyImages: emptyImages,
    seedProductsWithoutPrimaryImage: noPrimaryImage,
    seedProductsWithVariants: withVariants,
    seedVariantSizes: variantSizes,
    navigationRoots,
    databaseConnectionConfigured: Boolean(
        env.DATABASE_URL ||
        env.POSTGRES_URL ||
        env.POSTGRES_PRISMA_URL ||
        env.SUPABASE_DB_URL
    ),
}, null, 2))
