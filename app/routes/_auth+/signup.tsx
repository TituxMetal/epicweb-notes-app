import { redirect, type ActionFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'

import { Button, FormField } from '~/components'
import { checkHoneypot, validateCSRF } from '~/utils'

export const meta: MetaFunction = () => {
  return [{ title: 'Setup Epic Notes Account' }]
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()

  await validateCSRF(formData, request.headers)
  checkHoneypot(formData)

  return redirect('/')
}

const SignupRoute = () => {
  return (
    <section className='container mx-auto flex min-h-full max-w-screen-lg flex-col justify-center px-8'>
      <div className='mx-auto flex min-h-full w-full flex-1 flex-col items-center justify-center rounded-xl bg-sky-800'>
        <div className='flex flex-col gap-3 text-center'>
          <h1 className='text-h1'>Welcome aboard!</h1>
          <p className='text-base text-gray-200'>Please enter your details.</p>
        </div>
        <Form method='POST' className='mx-auto flex min-w-80 max-w-sm flex-col gap-4'>
          <AuthenticityTokenInput />
          <HoneypotInputs />
          <FormField>
            <FormField.Label htmlFor='email-input'>Email</FormField.Label>
            <FormField.Input autoFocus id='email-input' name='email' type='email' />
          </FormField>
          <Button className='w-full' type='submit'>
            Create an account
          </Button>
        </Form>
      </div>
    </section>
  )
}

export default SignupRoute
