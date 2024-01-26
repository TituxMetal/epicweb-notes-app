import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'

import { Button, FormField, GeneralErrorBoundary, floatingToolbarClassName } from '~/components'
import { db, invariantResponse, useIsSubmitting } from '~/utils'

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
  const isSubmitting = useIsSubmitting()

  return (
    <Form method='post' className='flex h-full flex-col gap-y-4 overflow-x-hidden px-8 py-12'>
      <fieldset className='flex flex-col gap-4 rounded-lg bg-sky-700 p-4'>
        <FormField>
          <FormField.Label htmlFor='title'>Title</FormField.Label>
          <FormField.Input type='text' name='title' id='title' defaultValue={data.note.title} />
        </FormField>
        <FormField>
          <FormField.Label htmlFor='content'>Content</FormField.Label>
          <FormField.Textarea name='content' id='content' defaultValue={data.note.content} />
        </FormField>
        <div className={floatingToolbarClassName}>
          <Button type='reset' intent='destructive'>
            Reset
          </Button>
          <Button disabled={isSubmitting} type='submit' intent='base'>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </fieldset>
    </Form>
  )
}

export const ErrorBoundary = () => {
  return (
    <GeneralErrorBoundary
      statusHandlers={{ 404: ({ params }) => <p>No note with the ID "{params.noteId}" exists.</p> }}
    />
  )
}

export default NoteEditRoute
