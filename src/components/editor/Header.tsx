'use client'

import { useRouter } from 'next/navigation'
import { useEditorStore } from '@/lib/store'
import { useApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Download, ArrowLeft } from 'lucide-react'

export function Header() {
    const router = useRouter()
    const api = useApi()
    const {
        currentProject,
        currentTime
    } = useEditorStore()

    const handleExport = async () => {
        if (!currentProject) return

        try {
            // Prepara i dati delle clip per il multi-clip rendering
            const clipsData = currentProject.clips?.map(clip => ({
                id: clip.id,
                name: clip.name,
                startTime: clip.startTime,
                endTime: clip.endTime,
                duration: clip.duration,
                videoUrl: clip.videoUrl,
                videoFile: clip.videoFile,
                originalDuration: clip.originalDuration,
                trimStart: clip.properties?.trimStart || clip.trimStart || 0,
                trimEnd: clip.properties?.trimEnd || clip.trimEnd || 0,
                // Animazioni con tempi relativi alla clip (non globali)
                animations: clip.animations?.map(anim => ({
                    ...anim,
                    // Mantieni i tempi relativi alla clip per Remotion
                    startTime: anim.startTime,
                    endTime: anim.endTime
                })) || []
            })) || []

            // Raccogli tutte le animazioni con tempi globali per compatibilità legacy
            const allAnimations = currentProject.clips?.flatMap(clip =>
                clip.animations?.map(anim => ({
                    ...anim,
                    // Converti i tempi relativi alla clip in tempi globali
                    startTime: anim.startTime + clip.startTime,
                    endTime: anim.endTime + clip.startTime,
                    clipId: clip.id // Aggiungi riferimento alla clip
                })) || []
            ) || []

            console.log(`🎬 Preparando rendering multi-clip: ${clipsData.length} clip(s)`)
            clipsData.forEach((clip, index) => {
                console.log(`📹 Clip ${index + 1}: ${clip.name} (${clip.startTime}s-${clip.endTime}s, trim: ${clip.trimStart}s-${clip.trimEnd}s)`)
            })

            const renderData = {
                name: currentProject.name,
                duration: currentProject.duration,
                videoFilename: currentProject.videoFilename, // Filename del video caricato
                animations: allAnimations, // Per compatibilità legacy
                clips: clipsData, // Nuovi dati strutturati per multi-clip
                backgroundSettings: currentProject.backgroundSettings,
                deviceSettings: currentProject.deviceSettings,
                musicSettings: currentProject.musicSettings,
                cameraSettings: currentProject.cameraSettings,
                // videoTrimming rimosso - ora ogni clip ha il suo trimming
                isMultiClip: clipsData.length > 1 // Flag per indicare se è multi-clip
            }

            const result = await api.startRender(renderData)

            const message = result.note
                ? `${result.message}\n\nNota: ${result.note}\nJob ID: ${result.render_job.id}`
                : `Rendering started successfully!\nJob ID: ${result.render_job.id}\nAnimations: ${result.render_job.animations_count}\nEstimated time: ${result.render_job.estimated_time}s`

            alert(message)

            // In un'implementazione reale, qui potresti aprire una modal per monitorare il progresso

        } catch (error) {
            alert(`Error during export: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }


    const handleBackToHome = () => {
        // Pulisci il localStorage e torna alla home
        localStorage.removeItem('currentVideo')
        router.push('/')
    }

    return (
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToHome}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <div className="h-6 w-px bg-border" />

                <div>
                    <h2 className="text-lg font-semibold text-foreground">{currentProject?.name}</h2>
                    <p className="text-xs text-muted-foreground">
                        {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')} / {Math.floor((currentProject?.duration || 0) / 60)}:{((currentProject?.duration || 0) % 60).toFixed(1).padStart(4, '0')}
                    </p>
                </div>
            </div>

            <div className="flex items-center">
                <Button
                    onClick={handleExport}
                    className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                    variant="outline"
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </div>
    )
}
