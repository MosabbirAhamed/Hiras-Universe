import assert from 'assert'

const BASE_URL = 'http://localhost:3006'

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

  const p3 = products.find(p => p.id === 'p-3')
  assert(p3, 'Product p-3 must exist')
  assert.strictEqual(p3.hasVariants, true, 'p-3 must have hasVariants=true')
  assert.strictEqual(p3.variants.length, 3, 'p-3 must have 3 variants')
  assert.strictEqual(p3.stock, 44, 'p-3 derived stock must be 25+15+4=44')
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
