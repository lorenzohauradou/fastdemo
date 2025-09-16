import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        // Ottieni il FormData dalla request
        const formData = await request.formData()
        const file = formData.get('file') as File
        
        if (!file) {
            return NextResponse.json(
                { error: 'Nessun file fornito' },
                { status: 400 }
            )
        }

        // Validazione del file
        const maxSize = 500 * 1024 * 1024 // 500MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File troppo grande. Massimo 500MB' },
                { status: 400 }
            )
        }

        const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/webm']
        const isWebM = file.type.startsWith('video/webm')
        const isAllowedType = allowedTypes.includes(file.type) || isWebM
        
        if (!isAllowedType) {
            return NextResponse.json(
                { error: 'Formato non supportato. Usa MP4, MOV, AVI o WebM' },
                { status: 400 }
            )
        }
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        console.log('🔍 BACKEND_URL:', backendUrl)
        try {
            const backendFormData = new FormData()
            backendFormData.append('file', file)

            const backendResponse = await fetch(`${backendUrl}/api/upload`, {
                method: 'POST',
                body: backendFormData,
            })

            if (backendResponse.ok) {
                const backendResult = await backendResponse.json()
                return NextResponse.json({
                    success: true,
                    message: 'File caricato con successo',
                    filename: file.name,
                    size: file.size,
                    content_type: file.type,
                    backend_response: backendResult
                })
            } else {
                console.warn('Backend upload failed, continuing with frontend-only')
                return NextResponse.json({
                    success: true,
                    message: 'File caricato con successo (solo frontend)',
                    filename: file.name,
                    size: file.size,
                    content_type: file.type,
                    backend_response: null
                })
            }
        } catch {
            console.warn('Backend not available, continuing with frontend-only')
            return NextResponse.json({
                success: true,
                message: 'File caricato con successo (solo frontend)',
                filename: file.name,
                size: file.size,
                content_type: file.type,
                backend_response: null
            })
        }
    } catch (error) {
        console.error('Errore nell\'upload:', error)
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        )
    }
}
