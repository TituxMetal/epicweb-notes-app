import { conform, useFieldset, type FieldConfig } from '@conform-to/react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useRef, useState } from 'react'
import { z } from 'zod'

import { cn } from '~/utils'

import { FormField } from './FormField'

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 5 // 5MB

export const ImageFieldsetSchema = z.object({
  id: z.string().optional(),
  file: z
    .instanceof(File)
    .refine(
      file => file.size <= MAX_UPLOAD_SIZE,
      `File size must be less than ${MAX_UPLOAD_SIZE} bytes`
    )
    .optional(),
  altText: z.string().optional()
})

type ImageChooserProps = {
  config: FieldConfig<z.infer<typeof ImageFieldsetSchema>>
}

export const ImageChooser = ({ config }: ImageChooserProps) => {
  const ref = useRef<HTMLFieldSetElement>(null)
  const fields = useFieldset(ref, config)
  const existingImage = Boolean(fields.id.defaultValue)
  const [previewImage, setPreviewImage] = useState<string | null>(
    existingImage ? `/resources/images/${fields.id.defaultValue}` : null
  )
  const [altText, setAltText] = useState(fields.altText.defaultValue || '')
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
      return
    }
    setPreviewImage(null)
  }

  return (
    <fieldset ref={ref} {...conform.fieldset(config)}>
      <div className='mb-6 flex gap-3'>
        <div className='w-32'>
          <div className='relative h-32 w-32'>
            <label
              htmlFor={fields.file.id}
              className={cn('group absolute h-32 w-32 rounded-lg', {
                'bg-sky-700 opacity-90 focus-within:opacity-100 hover:opacity-100': !previewImage,
                'cursor-pointer focus-within:ring-4': !existingImage
              })}
            >
              {previewImage ? (
                <div className='relative'>
                  <img
                    src={previewImage}
                    alt={altText ?? ''}
                    className='h-32 w-32 rounded-lg object-cover'
                  />
                  {existingImage ? null : (
                    <div className='pointer-events-none absolute -right-0.5 -top-0.5 rotate-12 rounded-md bg-gray-700 px-2 py-1 text-xs text-gray-200 shadow-md'>
                      new
                    </div>
                  )}
                </div>
              ) : (
                <div className='flex h-32 w-32 items-center justify-center rounded-md border border-sky-500 text-gray-300'>
                  <PlusIcon className='h-12 w-12' />
                </div>
              )}
              {existingImage ? <input {...conform.input(fields.id, { type: 'hidden' })} /> : null}
              <input
                aria-label='Image'
                className='absolute left-0 top-0 z-0 size-0 cursor-pointer opacity-0'
                onChange={handleFileChange}
                accept='image/*'
                {...conform.input(fields.file, { type: 'file' })}
              />
            </label>
          </div>
        </div>
        <div className='mb-6 flex flex-1 flex-col'>
          <FormField.Label htmlFor={fields.altText.id}>Alt Text</FormField.Label>
          <FormField.Textarea
            onChange={e => setAltText(e.currentTarget.value)}
            {...conform.textarea(fields.altText)}
          />
        </div>
      </div>
    </fieldset>
  )
}
