import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { Button, GeneralErrorBoundary, Spacer } from '~/components'
import { getUserImgSrc, invariantResponse, prisma } from '~/utils'

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const displayName = data?.user.name ?? params.username
  return [
    { title: `${displayName} | Epic Notes App` },
    { name: 'description', content: `Profile of ${displayName} on Epic Notes.` }
  ]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const user = await prisma.user.findFirst({
    select: { name: true, username: true, createdAt: true, image: { select: { id: true } } },
    where: { username: params.username }
  })

  invariantResponse(user, 'User not found', { status: 404 })

  return json({ user, userJoinedDisplay: user.createdAt.toLocaleString() })
}

const ProfileRoute = () => {
  const data = useLoaderData<typeof loader>()
  const user = data.user
  const userDisplayName = user.name ?? user.username

  return (
    <div className='container my-28 flex flex-col items-center justify-center'>
      <Spacer size='4xs' />

      <div className='container flex flex-col items-center rounded-xl bg-sky-700 p-8'>
        <div className='relative w-60'>
          <div className='absolute -top-48 rounded-full p-8'>
            <div className='relative size-52 rounded-full bg-gray-800'>
              <img
                src={getUserImgSrc(user.image?.id)}
                alt={userDisplayName}
                className='size-52 object-cover'
              />
            </div>
          </div>
        </div>

        <Spacer size='sm' />

        <div className='flex flex-col items-center'>
          <div className='flex flex-wrap items-center justify-center gap-4'>
            <h1 className='text-center text-h2'>{userDisplayName}</h1>
          </div>
          <p className='mt-2 text-center text-gray-300'>Joined {data.userJoinedDisplay}</p>
          <div className='mt-10 flex gap-4'>
            <Button>
              <Link to='notes' prefetch='intent'>
                {userDisplayName}'s notes
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ErrorBoundary = () => {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => <p>No user with the username "{params.username}" exists.</p>
      }}
    />
  )
}

export default ProfileRoute
