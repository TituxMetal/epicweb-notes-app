import { createCookie } from '@remix-run/node'
import { CSRF, CSRFError } from 'remix-utils/csrf/server'

const SESSION_SECRETS = process.env.SESSION_SECRETS || ''

const cookie = createCookie('csrf', {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  secrets: SESSION_SECRETS.split(',')
})

export const csrf = new CSRF({ cookie })

export const validateCSRF = async (formData: FormData, headers: Headers) => {
  try {
    await csrf.validate(formData, headers)
  } catch (error) {
    if (error instanceof CSRFError) {
      throw new Response('Invalid CSRF token', { status: 403 })
    }

    throw error
  }
}
