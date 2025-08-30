'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEditorStore } from '@/lib/store'
import { VideoPreview } from '@/components/editor/preview/VideoPreview'
import { Timeline } from '@/components/editor/timeline/Timeline'
import { Player } from '@/components/editor/player/Player'
import { Sidebar } from '@/components/editor/sidebar/Sidebar'
import { Header } from '@/components/editor/Header'

export function VideoEditor() {
    const router = useRouter()
    const { currentProject, setCurrentProject } = useEditorStore()

    useEffect(() => {
        // Carica il video dal localStorage se presente
        const savedVideo = localStorage.getItem('currentVideo')
        if (savedVideo && !currentProject) {
            try {
                const videoData = JSON.parse(savedVideo)
                // Qui dovresti ricreare il File object o gestire l'URL
                const newProject = {
                    name: videoData.name,
                    videoUrl: videoData.url,
                    duration: 0, // Sarà aggiornato quando il video si carica
                    clips: [],
                    activeClipId: null,
                    musicSettings: {
                        type: 'preset' as const,
                        volume: 0.5
                    }
                }
                setCurrentProject(newProject)
            } catch (error) {
                console.error('Errore nel caricamento del video salvato:', error)
                router.push('/')
            }
        } else if (!currentProject) {
            // In modalità sviluppo, crea un progetto demo
            if (process.env.NODE_ENV === 'development') {
                const demoProject = {
                    name: 'Demo Project',
                    videoUrl: '', // Vuoto per ora
                    duration: 30, // 30 secondi di demo
                    clips: [],
                    activeClipId: null,
                    musicSettings: {
                        type: 'preset' as const,
                        volume: 0.5
                    }
                }
                setCurrentProject(demoProject)
            } else {
                // Se non c'è un progetto, torna alla home
                router.push('/')
            }
        }
    }, [currentProject, setCurrentProject, router])

    if (!currentProject) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading project...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-background text-foreground">
            <div className="w-96 flex-shrink-0 bg-card border-r border-border">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                <div className="flex-1 flex flex-col p-4 bg-background min-h-0">
                    <div className="w-full flex justify-center mb-4">
                        <div
                            className="rounded-lg overflow-hidden border border-border shadow-lg"
                            style={{
                                width: '700px',  // 1500 / 2 = dimensioni fisse basate su Remotion
                                height: '469px', // 938 / 2 = mantiene il rapporto esatto
                                maxWidth: '90vw', // Responsive per schermi piccoli
                                maxHeight: '50vh',
                                backgroundColor: 'transparent' // Nessun background del container
                            }}
                        >
                            <VideoPreview />
                        </div>
                    </div>

                    <div className="w-full rounded-lg border border-border shadow-sm mb-4" style={{ height: '250px', backgroundColor: '#0f0f0f' }}>
                        <Timeline />
                    </div>

                    <div className="w-full">
                        <Player />
                    </div>
                </div>
            </div>
        </div>
    )
}
