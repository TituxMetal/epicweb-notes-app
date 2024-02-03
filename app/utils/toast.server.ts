import { createId as cuid } from '@paralleldrive/cuid2'
import { createCookieSessionStorage, redirect } from '@remix-run/node'
import { z } from 'zod'

import { combineHeaders } from './misc'

const SESSION_SECRETS = process.env.SESSION_SECRETS || ''

export const toastKey = 'toast'

const ToastSchema = z.object({
  description: z.string(),
  id: z.string().default(() => cuid()),
  title: z.string().optional(),
  type: z.enum(['success', 'message', 'error']).default('message')
})

export type Toast = z.infer<typeof ToastSchema>
export type ToastInput = z.input<typeof ToastSchema>

export const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'en-toast',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: SESSION_SECRETS.split(','),
    secure: process.env.NODE_ENV === 'production'
  }
})

export const redirectWithToast = async (url: string, toast: ToastInput, init?: ResponseInit) => {
  return redirect(url, {
    ...init,
    headers: combineHeaders(init?.headers, await createToastHeaders(toast))
  })
}

export const createToastHeaders = async (toastInput: ToastInput) => {
  const session = await toastSessionStorage.getSession()
  const toast = ToastSchema.parse(toastInput)

  session.flash(toastKey, toast)

  const cookie = await toastSessionStorage.commitSession(session)

  return new Headers({ 'set-cookie': cookie })
}

export const getToast = async (request: Request) => {
  const session = await toastSessionStorage.getSession(request.headers.get('cookie'))
  const result = ToastSchema.safeParse(session.get(toastKey))
  const toast = result.success ? result.data : null

  return {
    toast,
    headers: toast
      ? new Headers({ 'set-cookie': await toastSessionStorage.destroySession(session) })
      : null
  }
}
