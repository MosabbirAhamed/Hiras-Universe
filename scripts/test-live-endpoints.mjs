import assert from 'assert'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3006'

async function checkUrl(path) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url)
  console.log(`[${res.status}] GET ${path}`)
  assert.strictEqual(res.status, 200, `Expected 200 for ${path}`)
  return res
}

async function run() {
  console.log('Testing live HTTP routes...\n')

  // 1. Check /api/products
  const apiRes = await checkUrl('/api/products')
  const products = await apiRes.json()
  assert(Array.isArray(products), 'Products must be an array')
  assert(products.length >= 3, 'Must have at least 3 products')

  const variantProduct = products.find(p => p.slug === 'signature-handcrafted-tupi')
  assert(variantProduct, 'Signature handcrafted product must exist')
  assert.strictEqual(variantProduct.hasVariants, true, 'Signature product must have hasVariants=true')
  assert.strictEqual(variantProduct.variants.length, 3, 'Signature product must have 3 variants')
  assert.strictEqual(variantProduct.stock, 44, 'Signature product derived stock must be 25+15+4=44')
  console.log('✓ /api/products returned valid normalized variant and simple products')

  // 2. Check Storefront Product Pages
  await checkUrl('/products')
  await checkUrl('/products/signature-handcrafted-tupi')
  await checkUrl('/products/classic-white-tupi')
  await checkUrl('/cart')

  console.log('\nAll live endpoints verified successfully!')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
