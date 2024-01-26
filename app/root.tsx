import { cssBundleHref } from '@remix-run/css-bundle'
import { json, type LinksFunction, type MetaFunction } from '@remix-run/node'
import {
  isRouteErrorResponse,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError
} from '@remix-run/react'
import os from 'node:os'
import { type ReactNode } from 'react'

import faviconAssetUrl from '~/assets/favicon.svg'
import fontStylesheetUrl from '~/styles/font.css'
import tailwindStylesheetLink from '~/styles/tailwind.css'

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
  return json({ username: os.userInfo().username })
}

const Document = ({ children }: { children: ReactNode }) => {
  const data = useLoaderData<typeof loader>()

  return (
    <html lang='en' className='h-full overflow-x-hidden'>
      <head>
        <Meta />
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Links />
      </head>
      <body className='flex h-full flex-col justify-between bg-gray-800 text-gray-50'>
        <header className='container mx-auto py-6'>
          <nav className='flex justify-between'>
            <Link to='/'>
              <div className='font-light'>epic</div>
              <div className='font-bold'>notes</div>
            </Link>
            <Link className='underline' to='users/kody/notes'>
              Kody's Notes
            </Link>
          </nav>
        </header>
        <div className='flex-1'>{children}</div>
        <div className='container mx-auto flex items-center justify-between py-4'>
          <Link to='/'>
            <div className='font-light'>epic</div>
            <div className='font-bold'>notes</div>
          </Link>
          <p>Built with ♥️ by {data.username}</p>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

const App = () => {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

export const ErrorBoundary = () => {
  const error = useRouteError()

  console.error(error)

  return (
    <html lang='en'>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className='flex min-h-screen flex-col items-center justify-center space-y-4'>
        <p className='text-3xl'>Whoops!</p>
        {isRouteErrorResponse(error) ? (
          <p>
            {error.status} - {error.statusText}
          </p>
        ) : error instanceof Error ? (
          <p>{error.message}</p>
        ) : (
          <p>Something happened!</p>
        )}
        <Scripts />
      </body>
    </html>
  )
}

export default App
