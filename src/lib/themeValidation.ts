import { defaultTheme } from './repositories/defaultTheme'

export type StorefrontTheme = typeof defaultTheme
export type ThemeColorKey = keyof StorefrontTheme['colors']
export type ThemeFontKey = keyof StorefrontTheme['fonts']
export type ThemeLayoutKey = keyof StorefrontTheme['layout']

export const COLOR_VARIABLES: Record<ThemeColorKey, string> = {
    bodyBackground: '--color-body-background',
    mainBackground: '--color-main-background',
    sectionBackground: '--color-section-background',
    cardBackground: '--color-card-background',
    primary: '--color-primary',
    secondary: '--color-secondary',
    accent: '--color-accent',
    background: '--color-background',
    surface: '--color-surface',
    text: '--color-text',
    heading: '--color-heading',
    muted: '--color-muted',
    border: '--color-border',
    buttonBackground: '--color-button-background',
    buttonText: '--color-button-text',
    buttonHover: '--color-button-hover',
    sale: '--color-sale',
    saleText: '--color-sale-text',
    onPrimary: '--color-on-primary',
    link: '--color-link',
    linkHover: '--color-link-hover',
    headerBackground: '--color-header-background',
    headerText: '--color-header-text',
    footerBackground: '--color-footer-background',
    footerText: '--color-footer-text',
    announcementBackground: '--color-announcement-background',
    announcementText: '--color-announcement-text',
    inputBackground: '--color-input-background',
    inputBorder: '--color-input-border',
    inputFocus: '--color-input-focus',
    error: '--color-error',
    success: '--color-success',
    wishlist: '--color-wishlist'
}

const FONT_FAMILY_PATTERN = /^[a-zA-Z0-9 ,'"-]+$/
const CSS_LENGTH_PATTERN = /^\d+(?:\.\d+)?(?:px|rem|em|vw|%)$/
const PRODUCT_ASPECT_PATTERN = /^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/
const STYLE_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/

export function isHexColor(value: unknown): value is string {
    return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value)
}

function isSafeFontFamily(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0 && value.length <= 200 && FONT_FAMILY_PATTERN.test(value)
}

function isSafeLayoutValue(key: ThemeLayoutKey, value: unknown): value is string {
    if (typeof value !== 'string' || value.length === 0 || value.length > 40) return false
    if (key === 'productImageAspect') return PRODUCT_ASPECT_PATTERN.test(value)
    if (key === 'headerStyle' || key === 'footerStyle') return STYLE_NAME_PATTERN.test(value)
    return CSS_LENGTH_PATTERN.test(value)
}

export function normalizeTheme(value: unknown): StorefrontTheme {
    const candidate = value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {}
    const candidateColors = candidate.colors && typeof candidate.colors === 'object' && !Array.isArray(candidate.colors)
        ? candidate.colors as Record<string, unknown>
        : {}
    const candidateFonts = candidate.fonts && typeof candidate.fonts === 'object' && !Array.isArray(candidate.fonts)
        ? candidate.fonts as Record<string, unknown>
        : {}
    const candidateLayout = candidate.layout && typeof candidate.layout === 'object' && !Array.isArray(candidate.layout)
        ? candidate.layout as Record<string, unknown>
        : {}

    const colors = { ...defaultTheme.colors }
    for (const key of Object.keys(colors) as ThemeColorKey[]) {
        const color = candidateColors[key]
        if (isHexColor(color)) colors[key] = color.toUpperCase()
    }

    const fonts = { ...defaultTheme.fonts }
    for (const key of Object.keys(fonts) as ThemeFontKey[]) {
        const font = candidateFonts[key]
        if (isSafeFontFamily(font)) fonts[key] = font
    }

    const layout = { ...defaultTheme.layout }
    for (const key of Object.keys(layout) as ThemeLayoutKey[]) {
        const layoutValue = candidateLayout[key]
        if (isSafeLayoutValue(key, layoutValue)) layout[key] = layoutValue
    }

    return { colors, fonts, layout }
}

export function validateTheme(value: unknown): string[] {
    const errors: string[] = []
    if (!value || typeof value !== 'object' || Array.isArray(value)) return ['Theme settings must be an object.']

    const candidate = value as Record<string, unknown>
    const colors = candidate.colors as Record<string, unknown> | undefined
    const fonts = candidate.fonts as Record<string, unknown> | undefined
    const layout = candidate.layout as Record<string, unknown> | undefined

    for (const key of Object.keys(defaultTheme.colors) as ThemeColorKey[]) {
        if (!isHexColor(colors?.[key])) errors.push(`${key} must be a six-digit HEX color.`)
    }
    for (const key of Object.keys(defaultTheme.fonts) as ThemeFontKey[]) {
        if (!isSafeFontFamily(fonts?.[key])) errors.push(`${key} must be a valid font-family value.`)
    }
    for (const key of Object.keys(defaultTheme.layout) as ThemeLayoutKey[]) {
        if (!isSafeLayoutValue(key, layout?.[key])) errors.push(`${key} has an invalid layout value.`)
    }

    return errors
}

export function buildThemeCss(theme: unknown): string {
    const safeTheme = normalizeTheme(theme)
    const declarations: string[] = []

    for (const key of Object.keys(COLOR_VARIABLES) as ThemeColorKey[]) {
        declarations.push(`${COLOR_VARIABLES[key]}: ${safeTheme.colors[key]};`)
    }

    // Direct aliases for convenience
    declarations.push(`--color-body-bg: ${safeTheme.colors.bodyBackground};`)
    declarations.push(`--color-text-muted: ${safeTheme.colors.muted};`)

    declarations.push(`--font-heading: ${safeTheme.fonts.heading};`)
    declarations.push(`--font-body: ${safeTheme.fonts.body};`)
    declarations.push(`--container-width: ${safeTheme.layout.containerWidth};`)
    declarations.push(`--radius-base: ${safeTheme.layout.borderRadius};`)
    declarations.push(`--radius-button: ${safeTheme.layout.radiusButton};`)
    declarations.push(`--radius-card: ${safeTheme.layout.radiusCard};`)
    declarations.push(`--section-spacing: ${safeTheme.layout.sectionSpacing};`)
    declarations.push(`--product-aspect: ${safeTheme.layout.productImageAspect};`)
    declarations.push(`--header-style: ${safeTheme.layout.headerStyle};`)
    declarations.push(`--footer-style: ${safeTheme.layout.footerStyle};`)

    return `:root { ${declarations.join(' ')} }`
}
