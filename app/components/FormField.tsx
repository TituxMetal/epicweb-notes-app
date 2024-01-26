import React, { type ReactNode } from 'react'

import { cn } from '~/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  defaultValue: string
  id: string
  name: string
  required?: boolean
  type?: string
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
  defaultValue: string
  id: string
  name: string
  required?: boolean
}

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

const defaultInputClassNames =
  'rounded-md border-sky-500 bg-sky-900 text-gray-100 focus:ring-sky-600 focus:ring-offset-gray-900'

export const FormField = ({ children, className, ...rest }: FormFieldProps) => {
  return (
    <div className={cn('flex flex-col gap-1', className)} {...rest}>
      {children}
    </div>
  )
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ htmlFor, children, ...rest }, ref) => {
    return (
      <label ref={ref} {...rest} htmlFor={htmlFor}>
        {children}
      </label>
    )
  }
)

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ name, type, defaultValue, className, required, ...rest }, ref) => {
    return (
      <input
        {...rest}
        ref={ref}
        type={type}
        name={name}
        className={cn(defaultInputClassNames, className)}
        defaultValue={defaultValue}
        required={required}
      />
    )
  }
)

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, defaultValue, name, required, ...rest }, ref) => {
    const defaultClassNames = 'min-h-40'

    return (
      <textarea
        {...rest}
        ref={ref}
        name={name}
        className={cn(defaultInputClassNames, defaultClassNames, className)}
        defaultValue={defaultValue}
        required={required}
      />
    )
  }
)

FormField.displayName = 'FormField'
Input.displayName = 'FormInput'
Label.displayName = 'FormLabel'
Textarea.displayName = 'FormTextarea'

FormField.Input = Input
FormField.Label = Label
FormField.Textarea = Textarea
