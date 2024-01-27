import { conform, list, useFieldList, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs
} from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { z } from 'zod'

import {
  Button,
  ErrorList,
  FormField,
  GeneralErrorBoundary,
  ImageChooser,
  ImageFieldsetSchema,
  MAX_UPLOAD_SIZE,
  floatingToolbarClassName
} from '~/components'
import { db, invariantResponse, updateNote, useIsSubmitting, validateCSRF } from '~/utils'

const titleMaxLength: number = 100
const contentMaxLength: number = 1000

const NoteEditorSchema = z.object({
  title: z.string().min(1).max(titleMaxLength),
  content: z.string().min(1).max(contentMaxLength),
  images: z.array(ImageFieldsetSchema)
})

export const action = async ({ request, params }: ActionFunctionArgs) => {
  invariantResponse(params.noteId, 'Note ID is required')

  const formData = await parseMultipartFormData(
    request,
    createMemoryUploadHandler({ maxPartSize: MAX_UPLOAD_SIZE })
  )

  await validateCSRF(formData, request.headers)

  const submission = parse(formData, { schema: NoteEditorSchema })

  if (submission.intent !== 'submit') {
    return json({ status: 'idle', submission } as const)
  }

  if (!submission.value) {
    return json({ status: 'error', submission } as const, { status: 400 })
  }

  const { title, content, images } = submission.value
  // 🐨 now just pass the whole images array here.
  await updateNote({ id: params.noteId, title, content, images })

  return redirect(`/users/${params.username}/notes/${params.noteId}`)
}

export const loader = ({ params }: LoaderFunctionArgs) => {
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
    defaultValue: {
      title: note.title,
      content: note.content,
      images: note.images.length ? note.images : [{}]
    }
  })
  const imageList = useFieldList(form.ref, fields.images)

  return (
    <Form
      method='post'
      className='flex h-full max-h-svh flex-col gap-y-4 overflow-y-auto  overflow-x-hidden px-8 py-12 pb-24'
      encType='multipart/form-data'
      {...form.props}
    >
      <AuthenticityTokenInput />
      <button type='submit' className='hidden' />
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
        <FormField>
          <FormField.Label>Images</FormField.Label>
          <ul className='flex flex-col gap-4'>
            {imageList.map((image, index) => (
              <li key={image.key} className='relative mb-4 rounded-lg bg-sky-800 p-6'>
                <button
                  className='absolute right-0 top-0 p-2'
                  {...list.remove(fields.images.name, { index })}
                >
                  <span aria-hidden className='flex'>
                    <XMarkIcon className='size-6 stroke-2 text-rose-400' />
                  </span>{' '}
                  <span className='sr-only'>Remove image {index + 1}</span>
                </button>
                <ImageChooser config={image} />
              </li>
            ))}
          </ul>
          <Button className='mt-3' {...list.insert(fields.images.name, { defaultValue: {} })}>
            <span aria-hidden className='flex items-center justify-center gap-x-2'>
              <PlusIcon className='size-5 stroke-2' /> Image
            </span>{' '}
            <span className='sr-only'>Add image</span>
          </Button>
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
