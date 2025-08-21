import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        
        try {
            // Prova a ottenere il download dal backend
            const backendResponse = await fetch(`${backendUrl}/api/download/${jobId}`)
            
            if (backendResponse.ok) {
                const contentType = backendResponse.headers.get('content-type')
                
                if (contentType?.includes('video/')) {
                    // È un file video - proxy il download
                    const videoBuffer = await backendResponse.arrayBuffer()
                    
                    return new NextResponse(videoBuffer, {
                        headers: {
                            'Content-Type': 'video/mp4',
                            'Content-Disposition': `attachment; filename="democraft_video_${jobId}.mp4"`,
                            'Content-Length': videoBuffer.byteLength.toString()
                        }
                    })
                } else {
                    // È una risposta JSON con info
                    const result = await backendResponse.json()
                    return NextResponse.json(result)
                }
            } else {
                throw new Error('Backend download not available')
            }
        } catch (backendError) {
            console.warn('Backend not available for download:', backendError)
            
            // Fallback: ritorna info simulata
            return NextResponse.json({
                message: 'Video pronto per il download (simulato)',
                job_id: jobId,
                download_url: `/api/download/${jobId}`,
                file_size: '15.2 MB',
                format: 'MP4',
                resolution: '1920x1080',
                note: 'Nessun video reale disponibile - backend non raggiungibile'
            })
        }

    } catch (error) {
        console.error('Errore nel download:', error)
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        )
    }
}
