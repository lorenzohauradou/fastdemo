'use client'

import { useRouter } from 'next/navigation'
import { useEditorStore } from '@/lib/store'
import { useApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Play, Pause, Download, ArrowLeft, Save } from 'lucide-react'

export function Header() {
    const router = useRouter()
    const api = useApi()
    const {
        currentProject,
        isPlaying,
        setIsPlaying,
        currentTime
    } = useEditorStore()

    const togglePlayback = () => {
        setIsPlaying(!isPlaying)
    }

    const handleExport = async () => {
        if (!currentProject) return

        try {
            console.log('🎬 Avvio esportazione progetto:', currentProject.name)

            // Prepara i dati per il rendering
            const renderData = {
                name: currentProject.name,
                duration: currentProject.duration,
                animations: currentProject.animations,
                backgroundSettings: currentProject.backgroundSettings,
                deviceSettings: currentProject.deviceSettings,
                musicSettings: currentProject.musicSettings,
                cameraSettings: currentProject.cameraSettings,
                videoTrimming: currentProject.videoTrimming
            }

            console.log('📊 Dati da inviare:', renderData)
            console.log('🔍 Animazioni dettagliate:', JSON.stringify(renderData.animations, null, 2))

            // Usa l'API client per avviare il rendering
            const result = await api.startRender(renderData)

            // Mostra un messaggio di successo
            const message = result.note
                ? `${result.message}\n\nNota: ${result.note}\nJob ID: ${result.render_job.id}`
                : `Rendering avviato con successo!\nJob ID: ${result.render_job.id}\nAnimazioni: ${result.render_job.animations_count}\nTempo stimato: ${result.render_job.estimated_time}s`

            alert(message)

            // In un'implementazione reale, qui potresti aprire una modal per monitorare il progresso

        } catch (error) {
            console.error('❌ Errore durante l\'esportazione:', error)
            alert(`Errore durante l'esportazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
        }
    }

    const handleSave = async () => {
        if (!currentProject) return

        try {
            // Qui implementeremo il salvataggio del progetto
            console.log('Salvataggio progetto:', currentProject)
        } catch (error) {
            console.error('Errore durante il salvataggio:', error)
        }
    }

    const handleBackToHome = () => {
        // Pulisci il localStorage e torna alla home
        localStorage.removeItem('currentVideo')
        router.push('/')
    }

    return (
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
            {/* Left Section */}
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

            {/* Center Section - Playback Controls */}
            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayback}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    {isPlaying ? (
                        <Pause className="h-5 w-5" />
                    ) : (
                        <Play className="h-5 w-5" />
                    )}
                </Button>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                </Button>

                <Button
                    onClick={handleExport}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </div>
    )
}
