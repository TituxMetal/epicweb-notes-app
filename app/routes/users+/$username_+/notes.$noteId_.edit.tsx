import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { z } from 'zod'

import {
  Button,
  ErrorList,
  FormField,
  GeneralErrorBoundary,
  floatingToolbarClassName
} from '~/components'
import { db, invariantResponse, useIsSubmitting } from '~/utils'

const titleMaxLength: number = 100
const contentMaxLength: number = 1000

const NoteEditorSchema = z.object({
  title: z.string().min(1).max(titleMaxLength),
  content: z.string().min(1).max(contentMaxLength)
})

export const action = async ({ request, params }: ActionFunctionArgs) => {
  invariantResponse(params.noteId, 'Note ID is required')

  const formData = await request.formData()
  const submission = parse(formData, { schema: NoteEditorSchema })

  if (submission.intent !== 'submit' || !submission.value) {
    return json({ submission } as const, { status: 400 })
  }

  const { title, content } = submission.value

  db.note.update({ where: { id: { equals: params.noteId } }, data: { title, content } })

  return redirect(`/users/${params.username}/notes/${params.noteId}`)
}

export const loader = ({ params }: LoaderFunctionArgs) => {
  const note = db.note.findFirst({ where: { id: { equals: params.noteId } } })

  invariantResponse(note, 'Note not found', { status: 404 })

  return json({ note: { title: note.title, content: note.content } })
}

const NoteEditRoute = () => {
  const { note } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const isSubmitting = useIsSubmitting()

  const [form, fields] = useForm({
    id: 'note-editor',
    constraint: getFieldsetConstraint(NoteEditorSchema),
    lastSubmission: actionData?.submission,
    shouldRevalidate: 'onBlur',
    onValidate({ formData }) {
      return parse(formData, { schema: NoteEditorSchema })
    },
    defaultValue: { ...note }
  })

  return (
    <Form
      method='post'
      className='flex h-full flex-col gap-y-4 overflow-x-hidden px-8 py-12'
      {...form.props}
    >
      <fieldset className='flex flex-col gap-4 rounded-lg bg-sky-700 p-4'>
        <FormField>
          <FormField.Label htmlFor={fields.title.id}>Title</FormField.Label>
          <FormField.Input {...conform.input(fields.title, { type: 'text' })} />
          {fields.title.errors && (
            <ErrorList listId={fields.title.errorId} errorMessages={fields.title.errors} />
          )}
        </FormField>
        <FormField>
          <FormField.Label htmlFor={fields.content.id}>Content</FormField.Label>
          <FormField.Textarea
            {...conform.textarea(fields.content)}
            defaultValue={fields.content.defaultValue}
          />
          {fields.content.errors && (
            <ErrorList listId={fields.content.errorId} errorMessages={fields.content.errors} />
          )}
        </FormField>
        {form.error && <ErrorList listId={form.errorId} errorMessages={form.errors} />}
        <div className={floatingToolbarClassName}>
          <Button form={form.id} type='reset' intent='destructive'>
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
