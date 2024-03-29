import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, NavLink, Outlet, useLoaderData } from '@remix-run/react'

import { GeneralErrorBoundary } from '~/components'
import { cn, getUserImgSrc, invariantResponse, prisma } from '~/utils'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const owner = await prisma.user.findUnique({
    select: {
      name: true,
      username: true,
      image: { select: { id: true } },
      notes: { select: { id: true, title: true } }
    },
    where: { username: params.username }
  })

  invariantResponse(owner, 'Owner not found', { status: 404 })
  console.log('owner', { owner, notes: owner.notes })
  return json({ owner })
}

const NotesRoute = () => {
  const data = useLoaderData<typeof loader>()
  const ownerDisplayName = data.owner.name ?? data.owner.username
  const navLinkDefaultClassName =
    'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl'

  return (
    <main className='container flex h-full min-h-96 px-0 pb-12 md:px-8'>
      <div className='grid w-full grid-cols-4 bg-sky-900 pl-2 md:container md:mx-2 md:rounded-3xl md:pr-0'>
        <div className='relative col-span-1'>
          <section className='absolute inset-0 flex flex-col'>
            <Link to='..' relative='path' className='pb-4 pl-4 pr-2 pt-12'>
              <img
                src={getUserImgSrc(data.owner.image?.id)}
                alt={ownerDisplayName}
                className='size-20 object-cover lg:size-32'
              />
              <h1 className='text-base font-bold md:text-lg lg:text-left lg:text-2xl'>
                {ownerDisplayName}'s Notes
              </h1>
            </Link>
            <ul className='overflow-y-auto overflow-x-hidden pb-12'>
              {data.owner.notes.map(note => (
                <li key={note.id} className='p-1 pr-0'>
                  <NavLink
                    to={note.id}
                    preventScrollReset
                    prefetch='intent'
                    className={({ isActive }) =>
                      cn(navLinkDefaultClassName, isActive && 'bg-sky-700')
                    }
                  >
                    {note.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className='relative col-span-3 bg-sky-800 md:rounded-r-3xl'>
          <Outlet />
        </div>
      </div>
    </main>
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

export default NotesRoute
