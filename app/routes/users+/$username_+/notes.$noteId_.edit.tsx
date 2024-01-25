import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'

import { db, invariantResponse } from '~/utils'

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const title = formData.get('title')
  const content = formData.get('content')

  invariantResponse(typeof title === 'string', 'Title must be a string')
  invariantResponse(typeof content === 'string', 'Content must be a string')

  db.note.update({ where: { id: { equals: params.noteId } }, data: { title, content } })

  return redirect(`/users/${params.username}/notes/${params.noteId}`)
}

export const loader = ({ params }: LoaderFunctionArgs) => {
  const note = db.note.findFirst({ where: { id: { equals: params.noteId } } })

  invariantResponse(note, 'Note not found', { status: 404 })

  return json({ note: { title: note.title, content: note.content } })
}

const NoteEditRoute = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <Form method='post' className='flex h-full flex-col gap-y-4 overflow-x-hidden px-8 py-12'>
      <fieldset className='flex flex-col gap-4 rounded-lg bg-sky-700 p-4'>
        <div className='flex flex-col gap-1'>
          <label htmlFor='title'>Title</label>
          <input
            type='text'
            name='title'
            id='title'
            className='rounded-md border-sky-500 bg-sky-900 text-gray-100 focus:ring-sky-600 focus:ring-offset-gray-900'
            defaultValue={data.note.title}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label htmlFor='content'>Content</label>
          <textarea
            id='content'
            name='content'
            required
            className='min-h-40 rounded-md border-sky-500 bg-sky-900 text-gray-100 focus:ring-sky-600 focus:ring-offset-gray-900'
            defaultValue={data.note.content}
          />
        </div>
        <div className='absolute bottom-3 left-3 right-3 flex items-center justify-end gap-2 rounded-lg bg-sky-600/80 p-4 pl-5 backdrop-blur-sm md:gap-4 md:pl-7'>
          <button
            type='reset'
            className='rounded-md bg-rose-700 px-4 py-2 text-lg font-semibold text-gray-50 hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-700 focus:ring-offset-2 focus:ring-offset-sky-600/80 lg:w-auto'
          >
            Reset
          </button>
          <button
            type='submit'
            className='rounded-md bg-gray-700 px-4 py-2 text-lg font-semibold text-gray-50 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-sky-600/80 lg:w-auto'
          >
            Submit
          </button>
        </div>
      </fieldset>
    </Form>
  )
}

export default NoteEditRoute
