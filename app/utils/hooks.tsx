import { useFormAction, useNavigation } from '@remix-run/react'
import { useEffect, useState } from 'react'

/**
 * Hook that returns whether the navigation state is currently "submitting"
 * and matches the given form action and method. This indicates that a form
 * submission is currently in progress.
 *
 * @param formAction - Optional specific form action to check for
 * @param formMethod - Optional specific form method to check for
 */
export const useIsSubmitting = ({
  formAction,
  formMethod = 'POST'
}: {
  formAction?: string
  formMethod?: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE'
} = {}) => {
  const contextualFormAction = useFormAction()
  const navigation = useNavigation()
  return (
    navigation.state === 'submitting' &&
    navigation.formAction === (formAction ?? contextualFormAction) &&
    navigation.formMethod === formMethod
  )
}

/**
 * Hook that returns whether hydration has completed after initial render.
 * Initializes to false, and sets to true after component mounts.
 */
export const useHydrated = (): boolean => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => setHydrated(true), [])

  return hydrated
}

/**
 * Hook to focus the first invalid form field when the form has errors.
 * Checks for aria-invalid on the form and its fields to determine validity.
 *
 * @param formElement - The form element to check for errors on
 * @param hasErrors - Whether the form has errors
 */
export const useFocusInvalid = (formElement: HTMLFormElement | null, hasErrors: boolean): void => {
  useEffect(() => {
    if (!formElement || !hasErrors) return
    if (formElement.matches('[aria-invalid="true"]')) {
      formElement.focus()
      return
    }

    const firstInvalidField = formElement.querySelector('[aria-invalid="true"]')

    if (firstInvalidField instanceof HTMLElement) {
      firstInvalidField.focus()
    }
  }, [formElement, hasErrors])
}
