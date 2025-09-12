import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        
        const response = await fetch(`${backendUrl}/api/bg-images/${filename}`)
        
        if (!response.ok) {
            return NextResponse.json(
                { error: 'Image not found' }, 
                { status: 404 }
            )
        }
        
        // Ottieni il blob dell'immagine
        const imageBlob = await response.blob()
        
        // Determina il content-type
        let contentType = 'image/jpeg'
        if (filename.toLowerCase().endsWith('.png')) {
            contentType = 'image/png'
        } else if (filename.toLowerCase().endsWith('.webp')) {
            contentType = 'image/webp'
        }
        
        return new NextResponse(imageBlob, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000', // Cache per 1 anno
            },
        })
        
    } catch (error) {
        console.error('Error serving background image:', error)
        return NextResponse.json(
            { error: 'Failed to serve image' }, 
            { status: 500 }
        )
    }
}
