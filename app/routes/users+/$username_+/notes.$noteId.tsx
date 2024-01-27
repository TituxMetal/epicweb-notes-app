import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'

import { Button, GeneralErrorBoundary, floatingToolbarClassName } from '~/components'
import { db, invariantResponse, validateCSRF } from '~/utils'

import { type loader as notesLoader } from './notes'

export const meta: MetaFunction<
  typeof loader,
  { 'routes/users+/$username_+/notes': typeof notesLoader }
> = ({ data, params, matches }) => {
  const notesMatch = matches.find(m => m.id === 'routes/users+/$username_+/notes')
  const displayName = notesMatch?.data?.owner.name ?? params.username
  const noteTitle = data?.note.title ?? 'Note'
  const noteContentsSummary =
    data && data.note.content.length > 100 ? data?.note.content.slice(0, 97) + '...' : 'No content'
  return [
    { title: `${noteTitle} | ${displayName}'s Notes | Epic Notes` },
    {
      name: 'description',
      content: noteContentsSummary
    }
  ]
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData()

  await validateCSRF(formData, request.headers)

  const intent = formData.get('intent')

  invariantResponse(intent !== 'delete', 'Invalid intent')

  db.note.delete({ where: { id: { equals: params.noteId } } })

  return redirect(`/users/${params.username}/notes`)
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const note = db.note.findFirst({ where: { id: { equals: params.noteId } } })

  invariantResponse(note, 'Note not found', { status: 404 })

  return json({
    note: {
      title: note.title,
      content: note.content,
      images: note.images.map(image => ({ id: image.id, altText: image.altText }))
    }
  })
}

const NoteRoute = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <div className='absolute inset-0 flex flex-col px-10'>
      <h2 className='mb-2 pt-12 text-h2 lg:mb-6'>{data.note.title}</h2>
      <div className='overflow-y-auto pb-24'>
        <ul className='flex flex-wrap gap-5 py-5'>
          {data.note.images.map(image => (
            <li key={image.id}>
              <a href={`/resources/images/${image.id}`}>
                <img
                  src={`/resources/images/${image.id}`}
                  alt={image.altText ?? ''}
                  className='h-32 w-32 rounded-lg object-cover'
                />
              </a>
            </li>
          ))}
        </ul>
        <p className='whitespace-break-spaces text-sm md:text-lg'>{data.note.content}</p>
      </div>
      <div className={floatingToolbarClassName}>
        <Form method='post'>
          <AuthenticityTokenInput />
          <Button type='submit' intent='destructive'>
            Delete
          </Button>
        </Form>
        <Button>
          <Link to='edit'>Edit</Link>
        </Button>
      </div>
    </div>
  )
}

export const ErrorBoundary = () => {
  console.log('error boundary in notes.$noteId')
  return (
    <GeneralErrorBoundary
      statusHandlers={{ 404: ({ params }) => <p>No note with the id "{params.noteId}" exists</p> }}
    />
  )
}

export default NoteRoute
