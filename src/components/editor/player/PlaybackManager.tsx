'use client'

import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/lib/store'

/**
 * PlaybackManager - Gestisce il playback globale e le transizioni tra clip
 * Questo componente deve essere montato una sola volta nell'applicazione
 */
export function PlaybackManager() {
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const lastUpdateTime = useRef<number>(0)

    const {
        currentProject,
        currentTime,
        isPlaying,
        setCurrentTime,
        setIsPlaying
    } = useEditorStore()

    useEffect(() => {
        if (!isPlaying || !currentProject || !currentProject.clips || currentProject.clips.length === 0) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            return
        }

        // Avvia il timer di playback
        const startTime = performance.now()
        const initialTime = currentTime
        lastUpdateTime.current = startTime

        intervalRef.current = setInterval(() => {
            const now = performance.now()
            const deltaTime = (now - lastUpdateTime.current) / 1000 // Converti in secondi
            lastUpdateTime.current = now

            const newTime = currentTime + deltaTime
            const projectDuration = currentProject.duration || 0

            // Controlla se abbiamo raggiunto la fine del progetto
            if (newTime >= projectDuration) {
                setCurrentTime(projectDuration)
                setIsPlaying(false)
                return
            }

            // Trova la clip attiva al nuovo tempo
            const activeClip = currentProject.clips?.find(clip =>
                newTime >= clip.startTime && newTime < clip.endTime
            )

            if (activeClip) {
                // Controlla se siamo vicini alla fine della clip corrente
                const clipRelativeTime = newTime - activeClip.startTime
                const clipDuration = activeClip.endTime - activeClip.startTime

                if (clipRelativeTime >= clipDuration - 0.05) {
                    // Cerca la prossima clip
                    const nextClip = currentProject.clips?.find(clip =>
                        Math.abs(clip.startTime - activeClip.endTime) < 0.1
                    )

                    if (nextClip) {
                        // Salta alla prossima clip con un piccolo offset
                        setCurrentTime(nextClip.startTime + 0.01)
                    } else {
                        // Fine del progetto
                        setCurrentTime(projectDuration)
                        setIsPlaying(false)
                    }
                } else {
                    // Aggiornamento normale del tempo
                    setCurrentTime(newTime)
                }
            } else {
                // Nessuna clip attiva, continua normalmente
                setCurrentTime(newTime)
            }

        }, 16) // ~60 FPS per fluidità

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [isPlaying, currentProject, currentTime, setCurrentTime, setIsPlaying])

    // Questo componente non renderizza nulla
    return null
}
