'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useEditorStore } from '@/lib/store'
import { PlaybackControls } from './PlaybackControls'
import { TimelineTrack } from './TimelineTrack'
import {
    generateVideoThumbnail,
    createVideoClips,
    createAudioClips,
    type AudioClip
} from './playerUtils'
import type { VideoClip } from '@/lib/store'
import { useApi } from '@/lib/api'

export function Player() {
    const {
        currentProject,
        currentTime,
        isPlaying,
        setCurrentTime,
        setIsPlaying,
        updateProject,
        updateClip,
        addClip,
        setSelectedPanel,
        selectedClip,
        setSelectedClip
    } = useEditorStore()

    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const timelineRef = useRef<HTMLDivElement>(null)
    const [videoThumbnails, setVideoThumbnails] = useState<{ [key: string]: string }>({})
    const [isChangingClip, setIsChangingClip] = useState(false)

    const audioSrc = currentProject?.musicSettings?.track || ''

    // Crea le clip video dal progetto (supporta multi-clip)
    const videoClips: VideoClip[] = useMemo(() => {
        return createVideoClips(
            currentProject,
            true, // hasMainVideo - sempre true per compatibilità
            '', // videoSrc non più necessario
            videoThumbnails
        )
    }, [
        currentProject,
        videoThumbnails
    ])

    // Calcola la durata dinamica basata sulle clip video effettive
    const dynamicDuration = useMemo(() => {
        if (videoClips.length === 0) {
            return currentProject?.duration || 10
        }
        // La durata totale è il punto finale della clip che finisce più tardi
        const calculatedDuration = Math.max(...videoClips.map(clip => clip.endTime))
        return calculatedDuration
    }, [videoClips, currentProject?.duration])

    // Audio clip - si adatta alla durata totale dei video
    const audioClips: AudioClip[] = useMemo(() => {
        return createAudioClips(currentProject, audioSrc, dynamicDuration)
    }, [currentProject, audioSrc, dynamicDuration])

    // Trova la clip video attiva al tempo corrente
    const activeVideoClip = videoClips.find(clip =>
        currentTime >= clip.startTime && currentTime < clip.endTime
    )

    // Sincronizza il video attivo con il tempo corrente
    useEffect(() => {
        if (!videoRef.current || !activeVideoClip) return

        const clipRelativeTime = currentTime - activeVideoClip.startTime
        const trimStart = activeVideoClip.trimStart || 0
        const actualVideoTime = trimStart + clipRelativeTime

        // Solo se non stiamo riproducendo, aggiorna il tempo
        if (!isPlaying && Math.abs(videoRef.current.currentTime - actualVideoTime) > 0.2) {
            videoRef.current.currentTime = actualVideoTime
        }

        // Sincronizza l'audio solo quando non è in riproduzione
        if (audioRef.current && !isPlaying && audioSrc) {
            if (Math.abs(audioRef.current.currentTime - currentTime) > 0.2) {
                audioRef.current.currentTime = currentTime
            }
        }
    }, [currentTime, isPlaying, activeVideoClip, audioSrc])

    // Gestisce play/pause e volume
    useEffect(() => {
        if (videoRef.current && activeVideoClip) {
            if (isPlaying) {
                // Solo se il video è pronto per la riproduzione
                if (videoRef.current.readyState >= 3) { // HAVE_FUTURE_DATA
                    videoRef.current.play().catch(error => {
                        console.error('Error during play:', error)
                    })
                }
            } else {
                videoRef.current.pause()
            }
        }
        if (audioRef.current && currentProject?.musicSettings?.track) {
            audioRef.current.volume = currentProject?.musicSettings?.volume || 0.5
            if (isPlaying) {
                audioRef.current.play().catch(error => {
                    console.error('Errore durante play audio:', error)
                })
            } else {
                audioRef.current.pause()
            }
        }
    }, [isPlaying, activeVideoClip, currentProject?.musicSettings?.track, currentProject?.musicSettings?.volume])

    // ===== GESTIONE PLAYBACK =====
    const handlePlayPause = () => {
        // Se siamo alla fine del video e premiamo play, ripartiamo dall'inizio
        if (!isPlaying && currentTime >= dynamicDuration - 0.1) {
            setCurrentTime(0)

            // Reset esplicito dei tempi
            if (videoRef.current) {
                const trimStart = currentProject?.videoTrimming?.start || 0
                videoRef.current.currentTime = trimStart
            }
            if (audioRef.current) {
                audioRef.current.currentTime = 0
            }
        }

        setIsPlaying(!isPlaying)
    }

    const handleTimeUpdate = () => {
        if (videoRef.current && isPlaying && activeVideoClip && !isChangingClip) {
            const videoTime = videoRef.current.currentTime
            const trimStart = activeVideoClip.trimStart || 0
            const clipRelativeTime = videoTime - trimStart
            const globalTime = activeVideoClip.startTime + clipRelativeTime


            // Usa la durata effettiva del video invece della durata teorica della clip
            const actualVideoDuration = videoRef.current.duration
            const effectiveEndTime = isFinite(actualVideoDuration) && actualVideoDuration > 0
                ? Math.min(activeVideoClip.endTime, activeVideoClip.startTime + actualVideoDuration)
                : activeVideoClip.endTime


            // Controlla se abbiamo raggiunto la fine effettiva della clip
            if (globalTime >= effectiveEndTime - 0.05) {
                // Ordina le clip per startTime e trova la prossima
                const sortedClips = [...videoClips].sort((a, b) => a.startTime - b.startTime)
                const currentClipIndex = sortedClips.findIndex(clip => clip.id === activeVideoClip.id)
                const nextClip = sortedClips[currentClipIndex + 1]

                if (nextClip) {
                    // Passa alla prossima clip
                    setIsChangingClip(true)
                    setCurrentTime(nextClip.startTime + 0.01) // Piccolo offset per evitare loop
                    // Riabilita handleTimeUpdate dopo un breve delay
                    setTimeout(() => setIsChangingClip(false), 100)
                } else {
                    // Fine del progetto - controlla se siamo effettivamente alla fine
                    if (globalTime >= dynamicDuration - 0.1) {
                        setIsPlaying(false)
                        setCurrentTime(dynamicDuration)
                        if (audioRef.current) {
                            audioRef.current.pause()
                        }
                    } else {
                        // Continua normalmente se non siamo alla fine
                        setCurrentTime(Math.max(0, Math.min(globalTime, dynamicDuration)))
                    }
                }
            } else {
                // Aggiorna currentTime con soglia più alta per ridurre lag
                if (Math.abs(globalTime - currentTime) > 0.1) {
                    setCurrentTime(Math.max(0, Math.min(globalTime, dynamicDuration)))
                }
            }
        }
    }

    // ===== GESTIONE AUDIO =====

    const handleAudioImport = async () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'audio/*'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                try {
                    const response = await useApi().uploadAudio(file)

                    updateProject({
                        musicSettings: {
                            type: 'custom',
                            track: response.audioUrl, // URL per preview locale
                            volume: 0.5,
                            fileName: response.filename // Nome file per backend
                        }
                    })
                } catch (error) {
                    console.error('Errore upload audio:', error)
                    alert('Errore durante l\'upload dell\'audio')
                }
            }
        }
        input.click()
    }

    const handleOpenLibrary = () => {
        setSelectedPanel('music')
    }

    // ===== GESTIONE AGGIUNTA CLIP VIDEO =====
    const handleAddVideoClip = async () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'video/*'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                // Validazione del file
                const maxSize = 500 * 1024 * 1024 // 500MB
                if (file.size > maxSize) {
                    alert('Il file è troppo grande. Dimensione massima: 500MB')
                    return
                }

                const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/webm']
                if (!allowedTypes.includes(file.type)) {
                    alert('Formato non supportato. Usa MP4, MOV, AVI o WebM')
                    return
                }

                // Crea URL locale per il preview
                const videoUrl = URL.createObjectURL(file)

                // Ottieni la durata del video
                const tempVideo = document.createElement('video')
                tempVideo.src = videoUrl

                tempVideo.onloadedmetadata = () => {
                    const videoDuration = tempVideo.duration

                    // La nuova clip sarà automaticamente posizionata alla fine grazie alla logica nello store
                    const newClip = {
                        name: file.name.replace(/\.[^/.]+$/, ''),
                        duration: videoDuration,
                        videoFile: file,
                        videoUrl: videoUrl,
                        originalDuration: videoDuration,
                        animations: [],
                        trimStart: 0,
                        trimEnd: 0
                    }

                    addClip(newClip)
                }

                tempVideo.onerror = () => {
                    alert('Errore nel caricamento del video')
                    URL.revokeObjectURL(videoUrl)
                }
            }
        }
        input.click()
    }

    // ===== GESTIONE THUMBNAILS =====
    const handleThumbnailGenerated = (clipId: string, thumbnail: string) => {
        setVideoThumbnails(prev => ({ ...prev, [clipId]: thumbnail }))
    }



    // Genera thumbnails per tutte le clip
    useEffect(() => {
        videoClips.forEach(clip => {
            const videoUrl = clip.videoUrl
            if (videoUrl && !videoThumbnails[clip.id]) {
                generateVideoThumbnail(videoUrl, clip.id, handleThumbnailGenerated)
            }
        })
    }, [videoClips, videoThumbnails])

    // Gestione tasti per deselezionare
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedClip && e.key === 'Escape') {
                e.preventDefault()
                setSelectedClip(null)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedClip, setSelectedClip])

    // ===== CALCOLI TIMELINE =====
    // Usa la durata dinamica calcolata dalle clip video
    const duration = dynamicDuration
    const timelineWidth = timelineRef.current ? timelineRef.current.offsetWidth : 800

    // Calcolo dinamico di pixelsPerSecond basato sulla durata
    const calculatePixelsPerSecond = (duration: number, timelineWidth: number) => {
        // Vogliamo che la clip occupi circa il 70-80% della timeline disponibile
        const targetOccupancy = 0.75
        const idealPixelsPerSecond = (timelineWidth * targetOccupancy) / duration

        // Definiamo dei range ottimali per diversi tipi di durata
        if (duration <= 10) {
            return Math.max(30, Math.min(50, idealPixelsPerSecond))
        } else if (duration <= 20) {
            return Math.max(20, Math.min(35, idealPixelsPerSecond))
        } else if (duration <= 60) {
            return Math.max(10, Math.min(25, idealPixelsPerSecond))
        } else {
            return Math.max(5, Math.min(15, idealPixelsPerSecond))
        }
    }

    const pixelsPerSecond = calculatePixelsPerSecond(duration, timelineWidth)


    // ===== GESTIONE EVENTI TIMELINE =====
    const handleTimelineClick = (newTime: number) => {
        // Ferma la riproduzione prima di cambiare il tempo
        if (isPlaying) {
            setIsPlaying(false)
        }

        // Limita il tempo alla durata del progetto
        const clampedTime = Math.max(0, Math.min(duration, newTime))
        setCurrentTime(clampedTime)

        // Seleziona la clip attiva se presente
        if (activeVideoClip) {
            setSelectedClip(activeVideoClip.id)
        }
    }

    // Gestione selezione clip
    const handleClipSelect = (clipId: string) => {
        setSelectedClip(clipId)
    }

    // ===== GESTIONE AGGIORNAMENTI CLIP =====
    const handleClipUpdate = (clipId: string, updates: any, isAudio = false) => {

        if (isAudio && clipId === 'main-audio') {
            // Audio principale: aggiorna solo se necessario
            if (updates.endTime && updates.endTime !== dynamicDuration) {
                updateProject({
                    musicSettings: {
                        type: currentProject?.musicSettings?.type || 'custom',
                        volume: currentProject?.musicSettings?.volume || 0.5,
                        ...currentProject?.musicSettings,
                        trimStart: updates.properties?.trimStart || 0,
                        trimEnd: updates.properties?.trimEnd || 0,
                        duration: updates.endTime
                    }
                })
            }
        } else {
            // Clip video: aggiorna la clip specifica SOLO con i campi che sono effettivamente cambiati
            const clipUpdates: any = {}

            // Aggiungi solo i campi che sono stati effettivamente modificati
            if (updates.startTime !== undefined) clipUpdates.startTime = updates.startTime
            if (updates.endTime !== undefined) clipUpdates.endTime = updates.endTime
            if (updates.properties !== undefined) clipUpdates.properties = updates.properties
            if (updates.trimStart !== undefined) clipUpdates.trimStart = updates.trimStart
            if (updates.trimEnd !== undefined) clipUpdates.trimEnd = updates.trimEnd

            // Calcola la duration solo se startTime o endTime sono cambiati
            if (updates.startTime !== undefined && updates.endTime !== undefined) {
                clipUpdates.duration = updates.endTime - updates.startTime
            }

            // Aggiorna solo se ci sono effettivamente dei cambiamenti
            if (Object.keys(clipUpdates).length > 0) {
                updateClip(clipId, clipUpdates)
            }
        }
    }

    return (
        <div className="bg-background h-40 flex ">
            {activeVideoClip && activeVideoClip.videoUrl && (
                <video
                    ref={videoRef}
                    src={activeVideoClip.videoUrl}
                    className="hidden"
                    onTimeUpdate={handleTimeUpdate}
                    muted={true}
                />
            )}
            {audioSrc && <audio ref={audioRef} src={audioSrc} />}

            <PlaybackControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onPlayPause={handlePlayPause}
            />

            <div className="flex-1 flex flex-col px-6 py-4 space-y-4 overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden">
                    <TimelineTrack
                        title=""
                        type="video"
                        clips={videoClips}
                        currentTime={currentTime}
                        duration={duration}
                        pixelsPerSecond={pixelsPerSecond}
                        selectedClip={selectedClip}
                        onClipUpdate={handleClipUpdate}
                        onClipSelect={handleClipSelect}
                        onTimelineClick={handleTimelineClick}
                        onAddClip={handleAddVideoClip}
                        timelineWidth={Math.max(timelineWidth, duration * pixelsPerSecond + 200)}
                    />
                </div>

                <div className="overflow-x-auto overflow-y-hidden">
                    <TimelineTrack
                        title=""
                        type="audio"
                        clips={audioClips}
                        currentTime={currentTime}
                        duration={duration}
                        pixelsPerSecond={pixelsPerSecond}
                        selectedClip={selectedClip}
                        onClipUpdate={(clipId, updates) => handleClipUpdate(clipId, updates, true)}
                        onClipSelect={handleClipSelect}
                        onTimelineClick={handleTimelineClick}
                        onAddClip={handleAudioImport}
                        onOpenLibrary={handleOpenLibrary}
                        showWaveform={!!audioSrc}
                        audioSrc={audioSrc}
                        timelineWidth={Math.max(timelineWidth, duration * pixelsPerSecond + 200)}
                    />
                </div>
            </div>
        </div>
    )
}