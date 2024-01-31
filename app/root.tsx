import { parse } from '@conform-to/zod'
import { cssBundleHref } from '@remix-run/css-bundle'
import {
  json,
  type ActionFunctionArgs,
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches
} from '@remix-run/react'
import os from 'node:os'
import { type ReactNode } from 'react'
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'

import faviconAssetUrl from '~/assets/favicon.svg'
import fontStylesheetUrl from '~/styles/font.css'
import tailwindStylesheetLink from '~/styles/tailwind.css'

import { GeneralErrorBoundary, SearchBar, ThemeFormSchema, ThemeSwitch } from './components'
import { type Theme } from './types'
import { csrf, getTheme, honeypot, invariantResponse, setTheme } from './utils'
import { useTheme } from './utils/hooks'

export const links: LinksFunction = () => {
  return [
    { rel: 'icon', type: 'image/svg+xml', href: faviconAssetUrl },
    { rel: 'stylesheet', href: fontStylesheetUrl },
    { rel: 'stylesheet', href: tailwindStylesheetLink },
    ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : [])
  ]
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Epic Web Notes App' },
    { name: 'description', content: `Your own captain's log.` }
  ]
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  invariantResponse(formData.get('intent') === 'update-theme', 'Invalid intent', { status: 400 })
  const submission = parse(formData, {
    schema: ThemeFormSchema
  })
  if (submission.intent !== 'submit') {
    return json({ status: 'success', submission } as const)
  }
  if (!submission.value) {
    return json({ status: 'error', submission } as const, { status: 400 })
  }

  const { theme } = submission.value
  const responseInit = { headers: { 'set-cookie': setTheme(theme) } }

  return json({ success: true, submission }, responseInit)
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const honeyProps = honeypot.getInputProps()
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken(request)

  return json(
    { username: os.userInfo().username, theme: getTheme(request), honeyProps, csrfToken },
    { headers: csrfCookieHeader ? { 'set-cookie': csrfCookieHeader } : {} }
  )
}

const Document = ({ children, theme }: { children: ReactNode; theme: Theme }) => {
  return (
    <html lang='en' className={`${theme} h-full overflow-x-hidden`}>
      <head>
        <Meta />
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Links />
      </head>
      <body className='flex h-full flex-col justify-between bg-gray-800 text-gray-50'>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

const App = () => {
  const data = useLoaderData<typeof loader>()
  const theme = data.theme
  const matches = useMatches()
  const isOnSearchPage = matches.find(m => m.id === 'routes/users+/index')

  return (
    <Document theme={theme}>
      <header className='container mx-auto py-6'>
        <nav className='flex items-center justify-between gap-6'>
          <Link to='/'>
            <div className='font-light'>epic</div>
            <div className='font-bold'>notes</div>
          </Link>
          {isOnSearchPage ? null : (
            <div className='ml-auto max-w-sm flex-1'>
              <SearchBar status='idle' />
            </div>
          )}
          <Link className='underline' to='/users/kody/notes'>
            Kody's Notes
          </Link>
        </nav>
      </header>
      <div className='flex-1'>
        <Outlet />
      </div>
      <div className='container mx-auto flex items-center justify-between py-4'>
        <Link to='/'>
          <div className='font-light'>epic</div>
          <div className='font-bold'>notes</div>
        </Link>
        <p>Built with ♥️ by {data.username}</p>
        <ThemeSwitch userPreference={theme} />
      </div>
    </Document>
  )
}

const AppWithProviders = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <AuthenticityTokenProvider token={data.csrfToken}>
      <HoneypotProvider {...data.honeyProps}>
        <App />
      </HoneypotProvider>
    </AuthenticityTokenProvider>
  )
}

export const ErrorBoundary = () => {
  const theme = useTheme()

  return (
    <Document theme={theme}>
      <div className='flex-1'>
        <GeneralErrorBoundary />
      </div>
    </Document>
  )
}

export default AppWithProviders
