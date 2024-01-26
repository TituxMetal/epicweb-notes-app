import { useFormAction, useNavigation } from '@remix-run/react'

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
