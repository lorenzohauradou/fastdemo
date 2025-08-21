'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEditorStore } from '@/lib/store'
import { VideoPreview } from '@/components/editor/preview/VideoPreview'
import { Timeline } from '@/components/editor/timeline/Timeline'
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
                    animations: [],
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
                    animations: [],
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
            {/* Sidebar */}
            <div className="w-96 bg-card border-r border-border">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col">
                {/* Header */}
                <Header />

                {/* Contenuto principale centrato e compatto */}
                <div className="flex-1 flex flex-col items-center p-3 bg-background min-h-0">
                    {/* Video Preview più piccolo */}
                    <div className="w-full max-w-lg mb-2">
                        <div className="aspect-video bg-card rounded-md overflow-hidden border border-border shadow-md">
                            <VideoPreview />
                        </div>
                    </div>

                    {/* Timeline compatta */}
                    <div className="w-full max-w-5xl flex-1 bg-card rounded-md border border-border shadow-sm min-h-0">
                        <Timeline />
                    </div>
                </div>
            </div>
        </div>
    )
}
