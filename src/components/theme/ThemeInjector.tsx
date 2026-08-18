import React from 'react'
import { getTheme } from '../../lib/repositories/fileRepo'
import { buildThemeCss } from '../../lib/themeValidation'

export default async function ThemeInjector() {
  const theme = await getTheme()
  return <style dangerouslySetInnerHTML={{ __html: buildThemeCss(theme) }} />
}
