import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        
        // Proxy diretto verso il backend
        const backendResponse = await fetch(`${backendUrl}/api/render/status/${jobId}`)
        
        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: 'Task non trovato o errore backend' },
                { status: backendResponse.status }
            )
        }
        
        const result = await backendResponse.json()
        return NextResponse.json(result)

    } catch (error) {
        console.error('Errore nel controllo stato:', error)
        return NextResponse.json(
            { error: 'Errore di connessione al backend' },
            { status: 500 }
        )
    }
}
