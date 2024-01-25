import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'

import { db, invariantResponse } from '~/utils'

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const intent = formData.get('intent')

  invariantResponse(intent === 'delete', 'Invalid intent')

  db.note.delete({ where: { id: { equals: params.noteId } } })

  return redirect(`/users/${params.username}/notes`)
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const note = db.note.findFirst({ where: { id: { equals: params.noteId } } })

  invariantResponse(note, 'Note not found', { status: 404 })

  return json({ note: { title: note.title, content: note.content } })
}

const NoteRoute = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <div className='absolute inset-0 flex flex-col px-10'>
      <h2 className='mb-2 pt-12 text-h2 lg:mb-6'>{data.note.title}</h2>
      <div className='overflow-y-auto pb-24'>
        <p className='whitespace-break-spaces text-sm md:text-lg'>{data.note.content}</p>
      </div>
      <div className='absolute bottom-3 left-3 right-3 flex items-center justify-end gap-2 rounded-lg bg-sky-600/80 p-4 pl-5  backdrop-blur-sm md:gap-4 md:pl-7'>
        <Form method='post'>
          <button
            type='submit'
            name='intent'
            value='delete'
            className='rounded-md bg-rose-700 px-4 py-2 text-lg font-semibold text-gray-50 hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-700 focus:ring-offset-2 focus:ring-offset-sky-600/80 lg:w-auto'
          >
            Delete
          </button>
        </Form>
        <button className='rounded-md bg-gray-700 px-4 py-2 text-lg font-semibold text-gray-50 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-sky-600/80 lg:w-auto'>
          <Link to='edit'>Edit</Link>
        </button>
      </div>
    </div>
  )
}

export default NoteRoute
