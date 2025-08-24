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
            // Inoltra la richiesta al backend Remotion
            const backendResponse = await fetch(`${backendUrl}/api/render/remotion`, {
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
                throw new Error(`Backend Remotion error: ${errorText}`)
            }
        } catch (backendError) {
            console.warn('Backend Remotion not available:', backendError)
            
            // Fallback: simula il rendering Remotion
            const animations = renderData.animations || []
            const simulatedJob = {
                id: `remotion_sim_${Date.now()}`,
                project_name: renderData.name,
                status: 'simulated',
                progress: 100,
                animations_count: animations.length,
                duration: renderData.duration || 30,
                estimated_time: 0,
                processor_used: 'Remotion',
                created_at: new Date().toISOString()
            }

            return NextResponse.json({
                message: 'Rendering Remotion simulato (backend non disponibile)',
                processor: 'Remotion',
                render_job: simulatedJob,
                note: 'Per il vero rendering Remotion, assicurati che il backend sia in esecuzione',
                instructions: {
                    zoom_animations: animations.filter((a: any) => a.type === 'zoom'),
                    text_overlays: animations.filter((a: any) => a.type === 'text'),
                    background_settings: renderData.backgroundSettings,
                    device_settings: renderData.deviceSettings,
                    camera_settings: renderData.cameraSettings,
                    music_settings: renderData.musicSettings,
                    remotion_props: {
                        videoUrl: '/placeholder-video.mp4',
                        borderRadius: renderData.deviceSettings?.borderRadius || 0,
                        backgroundColor: renderData.backgroundSettings?.color || '#0077FF',
                        cameraAnimation: renderData.cameraSettings?.type || 'none',
                        timeline: animations.map((a: any) => ({
                            type: a.type,
                            start: a.startTime,
                            end: a.endTime,
                            content: a.properties?.content,
                            level: a.properties?.end?.level,
                            x: a.properties?.end?.x,
                            y: a.properties?.end?.y,
                        })),
                        musicSettings: renderData.musicSettings ? {
                            track: renderData.musicSettings.track,
                            originalVolume: renderData.musicSettings.originalVolume || 0.5,
                            musicVolume: renderData.musicSettings.musicVolume || 0.3,
                        } : undefined
                    }
                }
            })
        }

    } catch (error) {
        console.error('Errore nel rendering Remotion:', error)
        return NextResponse.json(
            { error: 'Errore interno del server durante il rendering Remotion' },
            { status: 500 }
        )
    }
}
