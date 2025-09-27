import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Genera token per client upload - validazioni lato server
        const allowedTypes = [
          'video/mp4', 
          'video/mov', 
          'video/quicktime', 
          'video/avi', 
          'video/webm'
        ]
        
        return {
          allowedContentTypes: allowedTypes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString(),
            // Potresti aggiungere userId se hai autenticazione
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Chiamato da Vercel quando l'upload è completato
        console.log('Video upload completato:', blob.url)
        
        // Qui potresti salvare nel database se necessario
        try {
          // const payload = JSON.parse(tokenPayload)
          // await db.saveVideo({ url: blob.url, ...payload })
        } catch (error) {
          console.error('Errore post-upload:', error)
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Errore handling upload:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload error' },
      { status: 400 }
    )
  }
}