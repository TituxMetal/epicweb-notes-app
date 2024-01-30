import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Form, useSearchParams, useSubmit } from '@remix-run/react'
import { useId } from 'react'

import { useDebounce, useFormState } from '~/utils'

import { Button, FormField } from '.'

export const SearchBar = ({
  status,
  autoFocus = false,
  autoSubmit = false
}: {
  status: 'idle' | 'pending' | 'success' | 'error'
  autoFocus?: boolean
  autoSubmit?: boolean
}) => {
  const id = useId()
  const [searchParams] = useSearchParams()
  const submit = useSubmit()
  const isSubmitting = useFormState({
    formMethod: 'GET',
    formAction: '/users'
  })

  const handleFormChange = useDebounce((form: HTMLFormElement) => {
    submit(form)
  }, 400)

  return (
    <Form
      method='GET'
      action='/users'
      className='flex flex-wrap items-center justify-center gap-2'
      onChange={e => autoSubmit && handleFormChange(e.currentTarget)}
    >
      <div className='flex-1'>
        <FormField.Label htmlFor={id} className='sr-only'>
          Search
        </FormField.Label>
        <FormField.Input
          type='search'
          name='search'
          id={id}
          defaultValue={searchParams.get('search') ?? ''}
          placeholder='Search'
          className='w-full bg-gray-700'
          autoFocus={autoFocus}
        />
      </div>
      <div>
        <Button
          type='submit'
          disabled={isSubmitting}
          className='flex w-full items-center justify-center'
        >
          <MagnifyingGlassIcon className='h-6 w-6' />
          <span className='sr-only'>Search</span>
        </Button>
      </div>
    </Form>
  )
}
