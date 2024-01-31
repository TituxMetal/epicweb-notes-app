import { useForm } from '@conform-to/react'
import { parse } from '@conform-to/zod'
import { MoonIcon, SunIcon } from '@heroicons/react/16/solid'
import { useFetcher } from '@remix-run/react'
import { z } from 'zod'

import { type action as rootAction } from '~/root'
import { type Theme } from '~/types'

import { ErrorList } from '.'

export const themeFetcherKey = 'update-theme'

export const ThemeFormSchema = z.object({
  theme: z.enum(['light', 'dark'])
})

/**
 * ThemeSwitch component to allow the user to toggle between light and dark theme.
 *
 * @param userPreference - The user's preferred theme. If not provided, the default theme is used.
 * @returns The ThemeSwitch component
 */
export const ThemeSwitch = ({ userPreference }: { userPreference?: Theme }) => {
  const fetcher = useFetcher<typeof rootAction>({ key: themeFetcherKey })
  const [form] = useForm({
    id: 'theme-switch',
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: ThemeFormSchema })
    }
  })

  const mode = userPreference ?? 'light'
  const nextMode = mode === 'light' ? 'dark' : 'light'
  const modeLabel = {
    light: (
      <SunIcon>
        <span className='sr-only'>Light</span>
      </SunIcon>
    ),
    dark: (
      <MoonIcon>
        <span className='sr-only'>Dark</span>
      </MoonIcon>
    )
  }

  return (
    <fetcher.Form method='post' {...form.props}>
      <input type='hidden' name='theme' value={nextMode} />
      <div className='flex gap-2'>
        <button
          name='intent'
          value='update-theme'
          type='submit'
          className='flex h-8 w-8 cursor-pointer items-center justify-center'
        >
          {modeLabel[mode]}
        </button>
      </div>
      <ErrorList errorMessages={form.errors} listId={form.errorId} />
    </fetcher.Form>
  )
}
