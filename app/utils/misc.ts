import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * A handy utility that makes constructing class names easier.
 * It also merges tailwind classes.
 *
 * @param inputs - Tailwind classes to merge
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

/**
 * Gets an error message string from an error object.
 * If error is a string, returns the string.
 * If error is an object with a 'message' string property, returns that.
 * Otherwise logs the error and returns a generic message.
 *
 * @param error - The error object to get the message from
 */
export const getErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }
  console.error('Unable to get error message for error', error)

  return 'Unknown Error'
}
