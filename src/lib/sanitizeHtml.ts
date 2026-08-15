const BLOCKED_TAGS = /<\/?(script|style|iframe|object|embed|meta|link|base|form|input|button|textarea|select|option)[^>]*>/gi
const EVENT_ATTRS = /\s+on[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi
const DANGEROUS_URLS = /\s+(href|src|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi
const DANGEROUS_UNQUOTED_URLS = /\s+(href|src|xlink:href)\s*=\s*javascript:[^\s>]+/gi

export function sanitizeHtml(html: string) {
  return html
    .replace(BLOCKED_TAGS, '')
    .replace(EVENT_ATTRS, '')
    .replace(DANGEROUS_URLS, '')
    .replace(DANGEROUS_UNQUOTED_URLS, '')
}
