import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'

import { Button, floatingToolbarClassName } from '~/components'
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
      <div className={floatingToolbarClassName}>
        <Form method='post'>
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

export default NoteRoute
