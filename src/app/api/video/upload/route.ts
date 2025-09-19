import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            'video/mp4', 
            'video/mov', 
            'video/quicktime', 
            'video/avi', 
            'video/webm'
          ],
          addRandomSuffix: true,
          // Disabilita callback in sviluppo locale
          ...(process.env.NODE_ENV === 'development' ? {} : {})
        }
      },
      // onUploadCompleted funziona solo in produzione
      ...(process.env.NODE_ENV !== 'development' && {
        onUploadCompleted: async ({ blob }) => {
          console.log('Video upload completato:', blob.url)
        }
      }),
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
