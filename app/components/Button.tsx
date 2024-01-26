import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/utils'

const buttonVariants = cva(
  'rounded-md px-4 py-2 text-lg font-semibold text-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 lg:w-auto focus:ring-offset-sky-600/80 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      intent: {
        base: 'bg-gray-700 hover:bg-gray-800 focus:ring-gray-700',
        destructive: 'bg-rose-700 hover:bg-rose-800 focus:ring-rose-700'
      }
    },
    defaultVariants: { intent: 'base' }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, intent, ...rest }, ref) => {
    return (
      <button {...rest} ref={ref} className={cn(buttonVariants({ intent, className }))}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
