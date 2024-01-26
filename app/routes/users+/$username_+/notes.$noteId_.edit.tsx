import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { useRef } from 'react'

import {
  Button,
  ErrorList,
  FormField,
  GeneralErrorBoundary,
  floatingToolbarClassName
} from '~/components'
import { db, invariantResponse, useFocusInvalid, useHydrated, useIsSubmitting } from '~/utils'

type ActionError = {
  formErrors: Array<string>
  fieldErrors: {
    title: Array<string>
    content: Array<string>
  }
}

const titleMaxLength: number = 100
const contentMaxLength: number = 1000

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
  const formRef = useRef<HTMLFormElement>(null)
  const isSubmitting = useIsSubmitting()
  const formId = 'note-editor'

  const fieldErrors = actionData?.status === 'error' ? actionData.errors.fieldErrors : null
  const formErrors = actionData?.status === 'error' ? actionData.errors.formErrors : null
  const isHydrated = useHydrated()
  const formHasErrors = Boolean(formErrors?.length)
  const formErrorId = formHasErrors ? 'form-error' : undefined
  const titleHasErrors = Boolean(fieldErrors?.title.length)
  const titleErrorId = titleHasErrors ? 'title-error' : undefined
  const contentHasErrors = Boolean(fieldErrors?.content.length)
  const contentErrorId = contentHasErrors ? 'content-error' : undefined

  useFocusInvalid(formRef.current, actionData?.status === 'error' && !isSubmitting)

  return (
    <Form
      ref={formRef}
      tabIndex={-1}
      method='post'
      noValidate={isHydrated}
      aria-invalid={formHasErrors || undefined}
      aria-describedby={formErrorId}
      className='flex h-full flex-col gap-y-4 overflow-x-hidden px-8 py-12'
    >
      <fieldset className='flex flex-col gap-4 rounded-lg bg-sky-700 p-4'>
        <FormField>
          <FormField.Label htmlFor='note-title'>Title</FormField.Label>
          <FormField.Input
            type='text'
            name='title'
            id='note-title'
            autoFocus
            defaultValue={data.note.title}
            maxLength={titleMaxLength}
            aria-invalid={titleHasErrors || undefined}
            aria-describedby={titleErrorId}
          />
          {fieldErrors?.title && (
            <ErrorList listId={titleErrorId} errorMessages={fieldErrors.title} />
          )}
        </FormField>
        <FormField>
          <FormField.Label htmlFor='note-content'>Content</FormField.Label>
          <FormField.Textarea
            name='content'
            id='note-content'
            defaultValue={data.note.content}
            maxLength={contentMaxLength}
            aria-invalid={contentHasErrors || undefined}
            aria-describedby={contentErrorId}
          />
          {fieldErrors?.content && (
            <ErrorList listId={contentErrorId} errorMessages={fieldErrors.content} />
          )}
        </FormField>
        {formErrors && <ErrorList listId={formErrorId} errorMessages={formErrors} />}
        <div className={floatingToolbarClassName}>
          <Button form={formId} type='reset' intent='destructive'>
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
