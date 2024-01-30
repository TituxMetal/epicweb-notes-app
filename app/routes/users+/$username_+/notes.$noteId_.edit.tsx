import { conform, list, useFieldList, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { createId as cuid } from '@paralleldrive/cuid2'
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
import { invariantResponse, prisma, useFormState, validateCSRF } from '~/utils'

const titleMaxLength: number = 100
const contentMaxLength: number = 1000

type ImageFieldset = z.infer<typeof ImageFieldsetSchema>

const imageHasFile = (
  image: ImageFieldset
): image is ImageFieldset & { file: NonNullable<ImageFieldset['file']> } => {
  return Boolean(image.file?.size && image.file?.size > 0)
}
const imageHasId = (
  image: ImageFieldset
): image is ImageFieldset & { id: NonNullable<ImageFieldset['id']> } => {
  return image.id != null
}

const NoteEditorSchema = z.object({
  title: z.string().min(1).max(titleMaxLength),
  content: z.string().min(1).max(contentMaxLength),
  images: z.array(ImageFieldsetSchema).max(5).optional()
})

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { noteId } = params
  invariantResponse(noteId, 'Note ID is required')

  const formData = await parseMultipartFormData(
    request,
    createMemoryUploadHandler({ maxPartSize: MAX_UPLOAD_SIZE })
  )

  await validateCSRF(formData, request.headers)

  const submission = await parse(formData, {
    schema: NoteEditorSchema.transform(async ({ images = [], ...data }) => {
      return {
        ...data,
        imageUpdates: await Promise.all(
          images.filter(imageHasId).map(async index =>
            imageHasFile(index)
              ? {
                  id: index.id,
                  altText: index.altText,
                  contentType: index.file.type,
                  blob: Buffer.from(await index.file.arrayBuffer())
                }
              : { id: index.id, altText: index.altText }
          )
        ),
        newImages: await Promise.all(
          images
            .filter(imageHasFile)
            .filter(image => !image.id)
            .map(async img => ({
              altText: img.altText,
              contentType: img.file.type,
              blob: Buffer.from(await img.file.arrayBuffer())
            }))
        )
      }
    }),
    async: true
  })

  if (submission.intent !== 'submit') {
    return json({ status: 'idle', submission } as const)
  }

  if (!submission.value) {
    return json({ status: 'error', submission } as const, { status: 400 })
  }

  const { title, content, imageUpdates = [], newImages = [] } = submission.value

  await prisma.note.update({
    select: { id: true },
    where: { id: noteId },
    data: {
      title,
      content,
      images: {
        deleteMany: { id: { notIn: imageUpdates.map(img => img.id) } },
        updateMany: imageUpdates.map(updates => ({
          where: { id: updates.id },
          data: { ...updates, id: updates.blob ? cuid() : updates.id }
        })),
        create: newImages
      }
    }
  })

  return redirect(`/users/${params.username}/notes/${params.noteId}`)
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const note = await prisma.note.findFirst({
    where: { id: params.noteId },
    select: {
      title: true,
      content: true,
      images: { select: { id: true, altText: true } }
    }
  })

  invariantResponse(note, 'Note not found', { status: 404 })

  return json({ note })
}

const NoteEditRoute = () => {
  const { note } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const isSubmitting = useFormState()

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
