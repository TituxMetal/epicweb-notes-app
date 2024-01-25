import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * A handy utility that makes constructing class names easier.
 * It also merges tailwind classes.
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
