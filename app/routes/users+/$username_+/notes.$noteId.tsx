import { useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { PencilIcon, TrashIcon } from '@heroicons/react/16/solid'
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { z } from 'zod'

import { Button, GeneralErrorBoundary, floatingToolbarClassName } from '~/components'
import {
  getNoteImgSrc,
  invariantResponse,
  prisma,
  redirectWithToast,
  useFormState,
  validateCSRF
} from '~/utils'

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

const DeleteFormSchema = z.object({
  intent: z.literal('delete-note'),
  noteId: z.string()
})

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData()

  await validateCSRF(formData, request.headers)

  const submission = parse(formData, {
    schema: DeleteFormSchema
  })

  if (submission.intent !== 'submit') {
    return json({ status: 'idle', submission } as const)
  }

  if (!submission.value) {
    return json({ status: 'error', submission } as const, { status: 400 })
  }

  const { noteId } = submission.value
  const note = await prisma.note.findFirst({
    select: { id: true, owner: { select: { username: true } } },
    where: { id: noteId, owner: { username: params.username } }
  })

  invariantResponse(note, 'Not found', { status: 404 })

  await prisma.note.delete({ where: { id: note.id } })

  throw await redirectWithToast(`/users/${note.owner.username}/notes`, {
    type: 'success',
    title: 'Success',
    description: 'Your note has been deleted.'
  })
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const note = await prisma.note.findUnique({
    select: {
      id: true,
      title: true,
      content: true,
      updatedAt: true,
      images: { select: { id: true, altText: true } }
    },
    where: { id: params.noteId }
  })

  invariantResponse(note, 'Not found', { status: 404 })

  const date = new Date(note.updatedAt)
  const timeAgo = formatDistanceToNow(date)

  return json({ note, timeAgo })
}

const NoteRoute = () => {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const isPending = useFormState()
  const [form] = useForm({
    id: 'delete-note',
    lastSubmission: actionData?.submission,
    constraint: getFieldsetConstraint(DeleteFormSchema),
    onValidate({ formData }) {
      return parse(formData, { schema: DeleteFormSchema })
    }
  })
  console.log('actionData', actionData)

  return (
    <div className='absolute inset-0 flex flex-col px-10'>
      <h2 className='mb-2 pt-12 text-h2 lg:mb-6'>{data.note.title}</h2>
      <div className='overflow-y-auto pb-24'>
        <ul className='flex flex-wrap gap-5 py-5'>
          {data.note.images.map(image => (
            <li key={image.id}>
              <a href={getNoteImgSrc(image.id)}>
                <img
                  src={getNoteImgSrc(image.id)}
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
        <Form method='post' {...form.props}>
          <AuthenticityTokenInput />
          <input type='hidden' name='noteId' value={data.note.id} />
          <Button
            className='inline-flex items-center gap-1'
            intent='destructive'
            disabled={isPending}
            type='submit'
            name='intent'
            value='delete-note'
          >
            <span>
              <TrashIcon className='mr-1 size-5' />
            </span>
            Delete
          </Button>
        </Form>
        <Button>
          <Link className='flex items-center gap-1' to='edit'>
            <span>
              <PencilIcon className='mr-1 size-5' />
            </span>
            Edit
          </Link>
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
