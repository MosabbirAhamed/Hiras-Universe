import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')

require.extensions['.ts'] = (module, filename) => {
    const source = require('node:fs').readFileSync(filename, 'utf8')
    const output = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            esModuleInterop: true
        },
        fileName: filename
    })
    module._compile(output.outputText, filename)
}

const { defaultTheme } = require('../src/lib/repositories/defaultTheme.ts')
const {
    buildThemeCss,
    isHexColor,
    normalizeTheme,
    validateTheme
} = require('../src/lib/themeValidation.ts')

let passed = 0
let total = 0

function test(name, fn) {
    total += 1
    try {
        fn()
        passed += 1
        console.log(`PASS: ${name}`)
    } catch (error) {
        console.error(`FAIL: ${name}`)
        console.error(error)
    }
}

test('accepts only complete six-digit HEX colors', () => {
    assert.equal(isHexColor('#12aBcF'), true)
    assert.equal(isHexColor('#FFF'), false)
    assert.equal(isHexColor('red'), false)
    assert.equal(isHexColor('#123456; color: red'), false)
})

test('normalizes missing legacy values to defaults', () => {
    const normalized = normalizeTheme({
        colors: { primary: '#abcdef' },
        fonts: {},
        layout: {}
    })

    assert.equal(normalized.colors.primary, '#ABCDEF')
    assert.equal(normalized.colors.text, defaultTheme.colors.text)
    assert.equal(normalized.fonts.heading, defaultTheme.fonts.heading)
    assert.equal(normalized.layout.containerWidth, defaultTheme.layout.containerWidth)
})

test('rejects incomplete theme submissions', () => {
    const errors = validateTheme({ colors: {}, fonts: {}, layout: {} })

    assert.ok(errors.some(error => error.includes('primary must be a six-digit HEX color.')))
    assert.ok(errors.some(error => error.includes('heading must be a valid font-family value.')))
    assert.ok(errors.some(error => error.includes('containerWidth has an invalid layout value.')))
})

test('accepts the complete default theme', () => {
    assert.deepEqual(validateTheme(defaultTheme), [])
})

test('falls back from malicious persisted CSS values', () => {
    const normalized = normalizeTheme({
        colors: { primary: '#000000; } body { display: none' },
        fonts: { heading: 'serif; background: red' },
        layout: { containerWidth: '1px; color: red' }
    })

    assert.equal(normalized.colors.primary, defaultTheme.colors.primary)
    assert.equal(normalized.fonts.heading, defaultTheme.fonts.heading)
    assert.equal(normalized.layout.containerWidth, defaultTheme.layout.containerWidth)
})

test('emits only allowlisted variables with normalized values', () => {
    const css = buildThemeCss({
        colors: { primary: '#abcdef', injected: '#123456' },
        fonts: { heading: 'Georgia, serif' },
        layout: { containerWidth: '80rem' },
        malicious: 'body { display: none; }'
    })

    assert.match(css, /^:root \{ .* \}$/)
    assert.ok(css.includes('--color-primary: #ABCDEF;'))
    assert.ok(css.includes('--font-heading: Georgia, serif;'))
    assert.ok(css.includes('--container-width: 80rem;'))
    assert.equal(css.includes('injected'), false)
    assert.equal(css.includes('malicious'), false)
    assert.equal(css.includes('display: none'), false)
})

console.log(`\nTHEME VALIDATION TESTS: ${passed}/${total} PASSED`)
if (passed !== total) process.exitCode = 1
