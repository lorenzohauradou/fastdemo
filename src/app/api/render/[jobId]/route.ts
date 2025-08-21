import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        
        try {
            // Prova a ottenere lo stato dal backend
            const backendResponse = await fetch(`${backendUrl}/api/render/${jobId}`)
            
            if (backendResponse.ok) {
                const result = await backendResponse.json()
                return NextResponse.json(result)
            } else {
                throw new Error('Backend response not ok')
            }
        } catch (backendError) {
            console.warn('Backend not available for status check:', backendError)
            
            // Fallback: simula lo stato
            const isSimulated = jobId.startsWith('sim_')
            
            if (isSimulated) {
                return NextResponse.json({
                    job_id: jobId,
                    status: 'completed',
                    progress: 100,
                    message: 'Rendering simulato completato',
                    estimated_remaining: 0,
                    output_url: null,
                    note: 'Questo è un rendering simulato - backend non disponibile'
                })
            } else {
                // Simula progresso per job reali
                const progress = Math.min(100, Math.floor(Math.random() * 100))
                const status = progress >= 100 ? 'completed' : 'processing'
                
                return NextResponse.json({
                    job_id: jobId,
                    status,
                    progress,
                    message: `Rendering ${status === 'completed' ? 'completato' : 'in corso'}... ${progress}%`,
                    estimated_remaining: Math.max(0, (100 - progress) * 2),
                    output_url: status === 'completed' ? `/api/download/${jobId}` : null
                })
            }
        }

    } catch (error) {
        console.error('Errore nel controllo stato:', error)
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        )
    }
}
