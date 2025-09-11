import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { text, speaker_id } = body

        if (!text || !text.trim()) {
            return NextResponse.json(
                { error: 'Testo richiesto per la generazione' },
                { status: 400 }
            )
        }
        const backendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000'
        const response = await fetch(`${backendUrl}/api/voiceover/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text.trim(),
                speaker_id: speaker_id || 'adam'
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json(
                { error: errorData.detail || 'Errore durante la generazione del voiceover' },
                { status: response.status }
            )
        }

        const result = await response.json()
        
        return NextResponse.json({
            message: result.message,
            filename: result.filename,
            audioUrl: result.audio_url,
            duration: result.duration
        })

    } catch (error) {
        console.error('Errore API voiceover:', error)
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        )
    }
}
