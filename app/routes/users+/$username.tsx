import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { db, invariantResponse } from '~/utils'

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
      <Link to='notes' className='underline'>
        Notes
      </Link>
    </div>
  )
}

export default ProfileRoute
