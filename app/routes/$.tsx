import { Link, useLocation } from '@remix-run/react'

import { GeneralErrorBoundary } from '~/components'

export const loader = async () => {
  throw new Response('Not Found.', { status: 404 })
}

const NotFound = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3'>
        <h1>We can't find this page:</h1>
        <pre className='whitespace-pre-wrap break-all text-xl'>{children}</pre>
      </div>
      <Link to='/' className='text-base underline'>
        Back to home
      </Link>
    </div>
  )
}

export const ErrorBoundary = () => {
  const location = useLocation()

  return (
    <GeneralErrorBoundary
      statusHandlers={{ 404: () => <NotFound>{location.pathname}</NotFound> }}
    />
  )
}

export default NotFound
