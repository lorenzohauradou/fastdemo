import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file fornito' },
        { status: 400 }
      )
    }

    // Verifica che sia un file audio
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Il file deve essere un audio' },
        { status: 400 }
      )
    }

    // Crea la directory uploads/audio se non esiste
    const uploadsDir = join(process.cwd(), 'uploads')
    const audioDir = join(uploadsDir, 'audio')
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    if (!existsSync(audioDir)) {
      await mkdir(audioDir, { recursive: true })
    }

    // Genera un nome file unico
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const filePath = join(audioDir, fileName)

    // Converti il file in buffer e salvalo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Genera l'URL per accedere al file
    const audioUrl = `/api/audio/${fileName}`

    return NextResponse.json({
      message: 'Audio caricato con successo',
      filename: fileName,
      originalName: file.name,
      size: file.size,
      contentType: file.type,
      audioUrl: audioUrl
    })

  } catch (error) {
    console.error('Errore upload audio:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'upload dell\'audio' },
      { status: 500 }
    )
  }
}
