import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { db, invariantResponse } from '~/utils'

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const displayName = data?.user.name ?? params.username
  return [
    { title: `${displayName} | Epic Notes App` },
    { name: 'description', content: `Profile of ${displayName} on Epic Notes.` }
  ]
}

export const loader = ({ params }: LoaderFunctionArgs) => {
  const user = db.user.findFirst({ where: { username: { equals: params.username } } })

  invariantResponse(user, 'User not found', { status: 404 })

  return json({ user: { name: user.name, username: user.username } })
}

const ProfileRoute = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <div className='container mb-48 mt-36'>
      <h1 className='text-h1'>{data.user.name ?? data.user.username}</h1>
      <Link to='notes' prefetch='intent' className='underline'>
        Notes
      </Link>
    </div>
  )
}

export default ProfileRoute
