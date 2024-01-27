import { createReadableStreamFromReadable, type LoaderFunctionArgs } from '@remix-run/node'
import fs from 'node:fs'
import { PassThrough } from 'node:stream'

import { db, invariantResponse } from '~/utils'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariantResponse(params.imageId, 'Invalid image ID')

  const image = db.image.findFirst({ where: { id: { equals: params.imageId } } })
  console.log('image', image)

  invariantResponse(image, 'Image not found', { status: 404 })

  const { filepath, contentType } = image
  const fileStat = await fs.promises.stat(filepath)
  const body = new PassThrough()
  const stream = fs.createReadStream(filepath)

  stream.on('open', () => stream.pipe(body))
  stream.on('error', err => body.end(err))
  stream.on('end', () => body.end())

  return new Response(createReadableStreamFromReadable(body), {
    status: 200,
    headers: {
      'content-type': contentType,
      'content-length': fileStat.size.toString(),
      'content-disposition': `inline; filename="${params.imageId}"`,
      'cache-control': 'public, max-age=31536000, immutable'
    }
  })
}
