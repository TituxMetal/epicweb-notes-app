import { useFetcher, useFormAction, useLoaderData, useNavigation } from '@remix-run/react'
import { useEffect, useMemo, useRef } from 'react'

import { themeFetcherKey } from '~/components'
import { type loader as rootLoader } from '~/root'

const FORM_METHODS = ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'] as const
type FormMethod = (typeof FORM_METHODS)[number]

const NAVIGATION_STATES = ['submitting', 'loading', 'non-idle', 'idle'] as const
type NavigationState = (typeof NAVIGATION_STATES)[number]

interface UseFormStateOptions {
  formAction?: string
  formMethod?: FormMethod
  state?: NavigationState
}

/**
 * Checks if a form is in a pending state.
 *
 * Returns true if the form is in a pending state based on the provided options, false otherwise.
 * A form is considered pending if:
 * - The navigation state matches the 'state' option
 * - The navigation form action and method match the provided 'formAction' and 'formMethod' options
 *
 * This allows checking if a form is "pending" - e.g. submitting or loading.
 */
export const useFormState = ({
  formAction,
  formMethod = 'POST',
  state = 'non-idle'
}: UseFormStateOptions = {}) => {
  const contextualFormAction = useFormAction()
  const navigation = useNavigation()
  const isPendingState =
    state === 'non-idle' ? navigation.state !== 'idle' : navigation.state === state
  return (
    isPendingState &&
    navigation.formAction === (formAction ?? contextualFormAction) &&
    navigation.formMethod === formMethod
  )
}

/**
 * Debounces a callback function.
 *
 * Wraps the provided callback function so that it will only be invoked after a certain
 * amount of time has elapsed since the last time it was invoked. This is useful for
 * performance optimizations.
 *
 * @param callback - The callback function to debounce
 * @param delay - The debounce delay in milliseconds
 */
const debounce = <Callback extends (...args: Parameters<Callback>) => void>(
  callback: Callback,
  delay: number
) => {
  if (typeof delay !== 'number' || delay <= 0) {
    throw new Error('Delay must be a positive number')
  }
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<Callback>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}

/**
 * Debounces a callback function using useRef and useMemo React hooks.
 *
 * Wraps the provided callback in a useMemo hook that debounces it with a
 * setTimeout, so it is only invoked after the specified delay since the
 * last invocation.
 *
 * @param callback - The callback function to debounce.
 * @param delay - The debounce delay in milliseconds.
 */
export const useDebounce = <
  Callback extends (...args: Parameters<Callback>) => ReturnType<Callback>
>(
  callback: Callback,
  delay: number
) => {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })
  return useMemo(
    () => debounce((...args: Parameters<Callback>) => callbackRef.current(...args), delay),
    [delay]
  )
}

/**
 * Gets the current theme from the loader data, falling back to an optimistic
 * theme updated by the theme fetcher if it exists.
 */
export const useTheme = () => {
  const data = useLoaderData<typeof rootLoader>()
  const themeFetcher = useFetcher({ key: themeFetcherKey })
  const optimisticTheme = themeFetcher?.formData?.get('theme')

  if (optimisticTheme === 'light' || optimisticTheme === 'dark') {
    return optimisticTheme
  }

  return data.theme
}
