'use client'

import { useRouter } from 'next/navigation'
import { useEditorStore } from '@/lib/store'
import { useApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Download, ArrowLeft, Loader2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type VideoQuality = '720p' | '1080p' | '4K'

export function Header() {
    const router = useRouter()
    const api = useApi()
    const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('1080p')
    const {
        currentProject,
        currentTime,
        isRendering: globalIsRendering,
        renderProgress: globalRenderProgress,
        setRenderingState,
        setRenderProgress: setGlobalRenderProgress
    } = useEditorStore()

    const getQualitySettings = (quality: VideoQuality) => {
        switch (quality) {
            case '720p':
                return { width: 1280, height: 720, scale: 0.75 }
            case '1080p':
                return { width: 1920, height: 1080, scale: 1.0 }
            case '4K':
                return { width: 3840, height: 2160, scale: 2.0 }
            default:
                return { width: 1920, height: 1080, scale: 1.0 }
        }
    }

    // Polling stato di rendering con progresso fake
    const startRenderPolling = async (taskId: string, quality: string) => {
        let fakeProgress = 5 // Inizia da 5% per sincronizzarsi con l'inizializzazione
        let pollCount = 0
        const maxPollsBeforeComplete = 20 // ~5 minuti con polling ogni 15 sec

        const pollInterval = setInterval(async () => {
            try {
                const status = await api.getRenderStatus(taskId)
                pollCount++

                // Sistema di progresso fake intelligente
                if (status.status === 'completed') {
                    // Video completato - salta immediatamente al 100%
                    clearInterval(pollInterval)
                    setGlobalRenderProgress(100)

                    setTimeout(() => {
                        setRenderingState(false)
                        setGlobalRenderProgress(0)

                        // Scarica automaticamente il file
                        if (status.download_url) {
                            const link = document.createElement('a')
                            link.href = status.download_url
                            link.download = ''
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                        }
                    }, 1000)
                } else if (status.status === 'failed' || status.error) {
                    clearInterval(pollInterval)
                    setRenderingState(false)
                    setGlobalRenderProgress(0)
                    alert(`Error during rendering: ${status.error || status.message}`)
                } else {
                    // Rendering in corso
                    if (pollCount <= maxPollsBeforeComplete) {
                        // Incremento progressivo che rallenta verso la fine
                        const progressIncrement = pollCount < 10
                            ? 3 + Math.random() * 4  // Inizio veloce: 3-7%
                            : pollCount < 15
                                ? 1 + Math.random() * 2  // Medio: 1-3%
                                : 0.5 + Math.random() * 1 // Fine lenta: 0.5-1.5%

                        fakeProgress = Math.min(fakeProgress + progressIncrement, 99)
                        setGlobalRenderProgress(Math.round(fakeProgress))
                    } else {
                        // Se raggiungiamo il limite, fermiamo a 99% e aspettiamo
                        setGlobalRenderProgress(99)
                    }
                }

            } catch (error) {
                console.error('Errore nel polling:', error)
                // Continua il progresso fake anche con errori di rete
                if (fakeProgress < 99) {
                    fakeProgress = Math.min(fakeProgress + 1, 99)
                    setGlobalRenderProgress(Math.round(fakeProgress))
                }
            }
        }, 15000) // Polling ogni 15 secondi
    }

    const handleExport = async () => {
        if (!currentProject || globalIsRendering) return

        try {
            setRenderingState(true)
            setGlobalRenderProgress(5) // Inizia con 5% per dare feedback immediato
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

            const qualitySettings = getQualitySettings(selectedQuality)

            const renderData = {
                name: currentProject.name,
                duration: currentProject.duration,
                videoFilename: currentProject.videoFilename, // Filename del video caricato
                animations: allAnimations, // Per compatibilità legacy
                clips: clipsData, // Nuovi dati strutturati per multi-clip
                backgroundSettings: currentProject.backgroundSettings,
                deviceSettings: currentProject.deviceSettings,
                musicSettings: currentProject.musicSettings,
                voiceoverSettings: currentProject.voiceoverSettings,
                cameraSettings: currentProject.cameraSettings,
                // Aggiungi dati webcam esplicitamente
                hasWebcam: currentProject.hasWebcam || false,
                webcamFilename: currentProject.webcamFilename,
                // videoTrimming rimosso - ora ogni clip ha il suo trimming
                isMultiClip: clipsData.length > 1, // Flag per indicare se è multi-clip
                // Aggiungi impostazioni di qualità
                qualitySettings: {
                    quality: selectedQuality,
                    ...qualitySettings
                }
            }

            const result = await api.startRender(renderData)

            const jobId = result.task_id

            // Avvia polling reale dello stato
            if (jobId) {
                startRenderPolling(jobId, selectedQuality)
            }

        } catch (error) {
            setRenderingState(false)
            setGlobalRenderProgress(0)
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

            <div className="flex items-center space-x-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-600"
                            disabled={globalIsRendering}
                        >
                            {selectedQuality}
                            <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-600">
                        <DropdownMenuItem
                            onClick={() => setSelectedQuality('720p')}
                            className="text-zinc-300 hover:bg-zinc-700 focus:bg-zinc-700"
                        >
                            720p (HD)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setSelectedQuality('1080p')}
                            className="text-zinc-300 hover:bg-zinc-700 focus:bg-zinc-700"
                        >
                            1080p (Full HD)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setSelectedQuality('4K')}
                            className="text-zinc-300 hover:bg-zinc-700 focus:bg-zinc-700"
                        >
                            4K (Ultra HD)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    onClick={handleExport}
                    disabled={globalIsRendering}
                    className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 min-w-[100px]"
                    variant="outline"
                >
                    {globalIsRendering ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Rendering
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
