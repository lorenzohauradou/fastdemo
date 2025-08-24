import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const renderData = await request.json()
        
        // Validazione dei dati
        if (!renderData.name) {
            return NextResponse.json(
                { error: 'Nome progetto richiesto' },
                { status: 400 }
            )
        }

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        
        try {
            // Inoltra la richiesta al backend
            const backendResponse = await fetch(`${backendUrl}/api/render`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(renderData)
            })

            if (backendResponse.ok) {
                const result = await backendResponse.json()
                return NextResponse.json(result)
            } else {
                const errorText = await backendResponse.text()
                throw new Error(`Backend error: ${errorText}`)
            }
        } catch (backendError) {
            console.warn('Backend not available for rendering:', backendError)
            
            // Fallback: simula il rendering
            const animations = renderData.animations || []
            const simulatedJob = {
                id: `sim_${Date.now()}`,
                project_name: renderData.name,
                status: 'simulated',
                progress: 100,
                animations_count: animations.length,
                duration: renderData.duration || 30,
                estimated_time: 0,
                created_at: new Date().toISOString()
            }

            return NextResponse.json({
                message: 'Rendering simulato (backend non disponibile)',
                render_job: simulatedJob,
                note: 'Per il vero processing video, assicurati che il backend sia in esecuzione',
                instructions: {
                    zoom_animations: animations.filter((a: any) => a.type === 'zoom'),
                    text_overlays: animations.filter((a: any) => a.type === 'text'),
                    logo_animations: animations.filter((a: any) => a.type === 'logo'),
                    background_settings: renderData.backgroundSettings,
                    music_settings: renderData.musicSettings
                }
            })
        }

    } catch (error) {
        console.error('Errore nel rendering:', error)
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        )
    }
}