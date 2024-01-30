import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { z } from 'zod'

import { GeneralErrorBoundary, SearchBar } from '~/components'
import { cn, getUserImgSrc, prisma, useFormState } from '~/utils'

const UserSearchResultSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().nullable(),
  imageId: z.string().nullable()
})
const UserSearchResultsSchema = z.array(UserSearchResultSchema)

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchTerm = new URL(request.url).searchParams.get('search')

  if (searchTerm === '') {
    return redirect('/users')
  }

  const like = `%${searchTerm ?? 'a'}%`
  const rawUsers = await prisma.$queryRaw`
    SELECT User.id, User.username, User.name, UserImage.id AS imageId
    FROM User
    LEFT JOIN UserImage ON UserImage.userId = User.id
    WHERE User.username LIKE ${like}
      OR User.name LIKE ${like}
    ORDER BY (
      SELECT Note.updatedAt FROM Note WHERE Note.ownerId = User.id ORDER BY updatedAt DESC LIMIT 1
    ) DESC
    LIMIT 50
  `
  const result = UserSearchResultsSchema.safeParse(rawUsers)

  if (!result.success) {
    return json({ status: 'error', message: result.error.message } as const, { status: 400 })
  }

  return json({ status: 'idle', users: result.data } as const)
}

const UsersRoute = () => {
  const data = useLoaderData<typeof loader>()
  const isPending = useFormState({
    formMethod: 'GET',
    formAction: '/users'
  })

  if (data.status === 'error') {
    console.error(data.message)
  }

  return (
    <div className='container my-16'>
      <div className='flex flex-col items-center justify-center gap-6 rounded-xl bg-sky-700 p-8'>
        <h1 className='text-h1'>Epic Notes Users</h1>
        <div className='w-full max-w-xl'>
          <SearchBar status={data.status} autoFocus autoSubmit />
        </div>
        <main>
          {data.status === 'idle' ? (
            data.users.length ? (
              <ul
                className={cn('flex w-full flex-wrap items-center justify-center gap-4 delay-200', {
                  'opacity-50': isPending
                })}
              >
                {data.users.map(user => (
                  <li key={user.id}>
                    <Link
                      to={user.username}
                      className='flex h-36 w-44 flex-col items-center justify-center rounded-lg bg-sky-600 px-5 py-3'
                    >
                      <img
                        alt={user.name ?? user.username}
                        src={getUserImgSrc(user.imageId)}
                        className='h-16 w-16 rounded-full'
                      />
                      {user.name ? (
                        <span className='text-body-md w-full overflow-hidden text-ellipsis whitespace-nowrap text-center'>
                          {user.name}
                        </span>
                      ) : null}
                      <span className='text-body-sm w-full overflow-hidden text-ellipsis text-center text-gray-200'>
                        {user.username}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No users found</p>
            )
          ) : null}
        </main>
      </div>
    </div>
  )
}

export const ErrorBoundary = () => {
  return <GeneralErrorBoundary />
}

export default UsersRoute
