import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params

        const backendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000'
        const response = await fetch(`${backendUrl}/api/download/audio/${filename}`)

        if (!response.ok) {
            return NextResponse.json(
                { error: 'File audio non trovato' },
                { status: 404 }
            )
        }

        const audioBuffer = await response.arrayBuffer()

        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'public, max-age=3600'
            }
        })

    } catch (error) {
        console.error('Errore download audio:', error)
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        )
    }
}
