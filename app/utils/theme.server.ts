import * as cookie from 'cookie'

import { type Theme } from '~/types'

const cookieName = 'theme'

/**
 * Gets the current theme from the request cookies.
 * Returns 'light' if no theme cookie is set.
 * @param request - The incoming request object
 * @returns The theme name: 'light' or 'dark'
 */
export const getTheme = (request: Request): Theme => {
  const cookieHeader = request.headers.get('cookie')
  const parsedCookie = cookieHeader ? cookie.parse(cookieHeader)[cookieName] : 'light'

  if (parsedCookie === 'light' || parsedCookie === 'dark') {
    return parsedCookie
  }

  return 'light'
}

/**
 * Serializes the given theme name into a cookie string
 * to set the theme cookie with the theme name and path '/'.
 *
 * @param themeName - The theme name to serialize: 'light' or 'dark'
 * @returns The serialized cookie string for the theme
 */
export const setTheme = (themeName: Theme) => {
  return cookie.serialize(cookieName, themeName, { path: '/' })
}
