import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'

import {
  Button,
  ErrorList,
  FormField,
  GeneralErrorBoundary,
  floatingToolbarClassName
} from '~/components'
import { db, invariantResponse, useHydrated, useIsSubmitting } from '~/utils'

type ActionError = {
  formErrors: Array<string>
  fieldErrors: {
    title: Array<string>
    content: Array<string>
  }
}

const titleMaxLength = 100
const contentMaxLength = 1000

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const title = formData.get('title')
  const content = formData.get('content')

  invariantResponse(typeof title === 'string', 'Title must be a string')
  invariantResponse(typeof content === 'string', 'Content must be a string')

  const errors: ActionError = {
    formErrors: [],
    fieldErrors: {
      title: [],
      content: []
    }
  }

  if (title === '') {
    errors.fieldErrors.title.push('Title is required')
  }

  if (title.length > titleMaxLength) {
    errors.fieldErrors.title.push(`Title must be ${titleMaxLength} characters or less`)
  }

  if (content === '') {
    errors.fieldErrors.content.push('Content is required')
  }

  if (content.length > contentMaxLength) {
    errors.fieldErrors.content.push(`Content must be ${contentMaxLength} characters or less`)
  }

  const hasErrors =
    errors.formErrors.length ||
    Object.values(errors.fieldErrors).some(fieldErrors => fieldErrors.length)

  if (hasErrors) {
    return json({ status: 'error', errors } as const, { status: 400 })
  }

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
  const actionData = useActionData<typeof action>()
  const isSubmitting = useIsSubmitting()

  const fieldErrors = actionData?.status === 'error' ? actionData.errors.fieldErrors : null
  const formErrors = actionData?.status === 'error' ? actionData.errors.formErrors : null
  const isHydrated = useHydrated()

  return (
    <Form
      method='post'
      noValidate={isHydrated}
      className='flex h-full flex-col gap-y-4 overflow-x-hidden px-8 py-12'
    >
      <fieldset className='flex flex-col gap-4 rounded-lg bg-sky-700 p-4'>
        <FormField>
          <FormField.Label htmlFor='title'>Title</FormField.Label>
          <FormField.Input
            type='text'
            name='title'
            id='title'
            defaultValue={data.note.title}
            maxLength={titleMaxLength}
          />
          {fieldErrors?.title && <ErrorList errors={fieldErrors.title} />}
        </FormField>
        <FormField>
          <FormField.Label htmlFor='content'>Content</FormField.Label>
          <FormField.Textarea
            name='content'
            id='content'
            defaultValue={data.note.content}
            maxLength={contentMaxLength}
          />
          {fieldErrors?.content && <ErrorList errors={fieldErrors.content} />}
        </FormField>
        {formErrors && <ErrorList errors={formErrors} />}
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
