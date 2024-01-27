import { cssBundleHref } from '@remix-run/css-bundle'
import { json, type LinksFunction, type MetaFunction } from '@remix-run/node'
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react'
import os from 'node:os'
import { type ReactNode } from 'react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'

import faviconAssetUrl from '~/assets/favicon.svg'
import fontStylesheetUrl from '~/styles/font.css'
import tailwindStylesheetLink from '~/styles/tailwind.css'

import { GeneralErrorBoundary } from './components'
import { honeypot } from './utils'

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

export const loader = async () => {
  const honeyProps = honeypot.getInputProps()

  return json({ username: os.userInfo().username, honeyProps })
}

const Document = ({ children }: { children: ReactNode }) => {
  return (
    <html lang='en' className='h-full overflow-x-hidden'>
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

  return (
    <Document>
      <header className='container mx-auto py-6'>
        <nav className='flex justify-between'>
          <Link to='/'>
            <div className='font-light'>epic</div>
            <div className='font-bold'>notes</div>
          </Link>
          <Link className='underline' to='/signup'>
            Signup
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
      </div>
    </Document>
  )
}

const AppWithProviders = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <HoneypotProvider {...data.honeyProps}>
      <App />
    </HoneypotProvider>
  )
}

export const ErrorBoundary = () => {
  return (
    <Document>
      <div className='flex-1'>
        <GeneralErrorBoundary />
      </div>
    </Document>
  )
}

export default AppWithProviders
