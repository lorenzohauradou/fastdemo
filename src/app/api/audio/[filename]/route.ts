import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    
    // Percorso del file audio
    const audioPath = join(process.cwd(), 'uploads', 'audio', filename)
    
    // Verifica che il file esista
    if (!existsSync(audioPath)) {
      return NextResponse.json(
        { error: 'File audio non trovato' },
        { status: 404 }
      )
    }

    // Leggi il file
    const fileBuffer = await readFile(audioPath)
    
    // Determina il content type basato sull'estensione
    const getContentType = (filename: string) => {
      const ext = filename.toLowerCase().split('.').pop()
      switch (ext) {
        case 'mp3': return 'audio/mpeg'
        case 'wav': return 'audio/wav'
        case 'ogg': return 'audio/ogg'
        case 'm4a': return 'audio/mp4'
        case 'aac': return 'audio/aac'
        case 'flac': return 'audio/flac'
        default: return 'audio/mpeg'
      }
    }

    console.log(`Serving audio file: ${filename}, Content-Type: ${getContentType(filename)}`)

    const contentType = getContentType(filename)

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    })

  } catch (error) {
    console.error('Errore nel servire l\'audio:', error)
    return NextResponse.json(
      { error: 'Errore nel servire il file audio' },
      { status: 500 }
    )
  }
}
