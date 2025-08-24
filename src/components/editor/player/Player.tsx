'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useEditorStore } from '@/lib/store'
import { PlaybackControls } from './PlaybackControls'
import { TimelineTrack } from './TimelineTrack'
import {
    generateVideoThumbnail,
    createVideoClips,
    createAudioClips,
    type VideoClip,
    type AudioClip
} from './playerUtils'

export function Player() {
    const {
        currentProject,
        currentTime,
        isPlaying,
        setCurrentTime,
        setIsPlaying,
        updateProject,
        setSelectedPanel,
        selectedClip,
        setSelectedClip
    } = useEditorStore()

    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const timelineRef = useRef<HTMLDivElement>(null)
    const [videoThumbnails, setVideoThumbnails] = useState<{ [key: string]: string }>({})

    const videoSrc = currentProject?.videoUrl || (currentProject?.videoFile ? URL.createObjectURL(currentProject.videoFile) : '')
    const audioSrc = currentProject?.musicSettings?.track || ''

    // Solo video principale - nessuna clip multipla
    const hasMainVideo = !!(videoSrc || currentProject?.videoFile)

    // Crea solo la clip del video principale
    const videoClips: VideoClip[] = useMemo(() => {
        return createVideoClips(
            currentProject,
            hasMainVideo,
            videoSrc,
            videoThumbnails
        )
    }, [
        currentProject,
        hasMainVideo,
        videoSrc,
        videoThumbnails
    ])

    // Audio clip - si adatta alla durata totale dei video
    const audioClips: AudioClip[] = useMemo(() => {
        const totalVideoDuration = videoClips.length > 0
            ? Math.max(...videoClips.map(clip => clip.endTime))
            : (currentProject?.duration || 10)

        return createAudioClips(currentProject, audioSrc, totalVideoDuration)
    }, [currentProject, audioSrc, videoClips])

    // Sincronizza il video principale con il tempo corrente, considerando il trimming
    useEffect(() => {
        if (!videoRef.current || !hasMainVideo) return

        const trimStart = currentProject?.videoTrimming?.start || 0
        // Il tempo nel video originale = trimStart + tempo della timeline
        const actualVideoTime = trimStart + currentTime

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
    }, [currentTime, isPlaying, hasMainVideo, currentProject?.videoTrimming, audioSrc])

    // Gestisce play/pause e volume
    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                // Solo se il video è pronto per la riproduzione
                if (videoRef.current.readyState >= 3) { // HAVE_FUTURE_DATA
                    videoRef.current.play().catch(error => {
                        console.error('Errore durante play:', error)
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
    }, [isPlaying, currentProject?.musicSettings?.track, currentProject?.musicSettings?.volume])

    // ===== GESTIONE PLAYBACK =====
    const handlePlayPause = () => {
        // Se siamo alla fine del video e premiamo play, ripartiamo dall'inizio
        if (!isPlaying && currentTime >= duration - 0.1) {
            setCurrentTime(0)

            // Resetta anche il tempo del video e dell'audio
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
        if (videoRef.current && isPlaying && hasMainVideo) {
            const videoTime = videoRef.current.currentTime
            const trimStart = currentProject?.videoTrimming?.start || 0
            const timelineDuration = currentProject?.duration || 10

            // Calcola il nuovo tempo della timeline (tempo video - trimStart)
            const newTime = videoTime - trimStart

            // Controlla se abbiamo raggiunto la fine della timeline
            if (newTime >= timelineDuration - 0.1) {
                setIsPlaying(false)
                setCurrentTime(timelineDuration)
            } else {
                // Aggiorna currentTime normalmente
                if (Math.abs(newTime - currentTime) > 0.05) {
                    setCurrentTime(Math.max(0, Math.min(newTime, timelineDuration)))
                }
            }

            // Assicurati che il video principale sia selezionato
            if (selectedClip !== 'main-video') {
                setSelectedClip('main-video')
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
                const audioUrl = URL.createObjectURL(file)
                updateProject({
                    musicSettings: {
                        type: 'custom',
                        track: audioUrl,
                        volume: 0.5,
                        fileName: file.name // Salva il nome del file
                    }
                })
            }
        }
        input.click()
    }

    const handleOpenLibrary = () => {
        setSelectedPanel('music')
    }

    // ===== GESTIONE THUMBNAILS =====
    const handleThumbnailGenerated = (clipId: string, thumbnail: string) => {
        setVideoThumbnails(prev => ({ ...prev, [clipId]: thumbnail }))
    }

    // Genera thumbnail solo per il video principale
    useEffect(() => {
        if (videoSrc && !videoThumbnails['main-video']) {
            console.log('Generando thumbnail per video principale:', videoSrc)
            generateVideoThumbnail(videoSrc, 'main-video', handleThumbnailGenerated)
        }
    }, [videoSrc, videoThumbnails])

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
    const duration = currentProject?.duration || 10
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

        // Seleziona sempre il video principale
        if (hasMainVideo) {
            setSelectedClip('main-video')
        }
    }

    // Gestione selezione clip
    const handleClipSelect = (clipId: string) => {
        setSelectedClip(clipId)
    }

    // ===== GESTIONE AGGIORNAMENTI CLIP =====
    const handleClipUpdate = (clipId: string, updates: any, isAudio = false) => {
        if (clipId === 'main-video') {
            // Video principale: aggiorna solo le proprietà del progetto
            const newDuration = updates.endTime || duration
            const trimStart = updates.properties?.trimStart || 0
            const trimEnd = updates.properties?.trimEnd || 0

            updateProject({
                duration: newDuration,
                videoTrimming: {
                    start: trimStart,
                    end: trimEnd,
                    duration: newDuration
                }
            })

            // Controlla se il currentTime è oltre la nuova durata
            if (currentTime > newDuration) {
                setCurrentTime(newDuration)
            }
        } else if (clipId === 'main-audio') {
            // Audio principale: aggiorna solo se necessario
            if (updates.endTime && updates.endTime !== duration) {
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
        }
    }

    return (
        <div className="bg-zinc-900 h-32 flex border-t border-zinc-700">
            {/* Video e Audio nascosti per controllo */}
            {videoSrc && (
                <video
                    ref={videoRef}
                    src={videoSrc}
                    className="hidden"
                    onTimeUpdate={handleTimeUpdate}
                    muted={!!audioSrc}
                />
            )}
            {audioSrc && <audio ref={audioRef} src={audioSrc} />}

            <PlaybackControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onPlayPause={handlePlayPause}
            />

            <div className="flex-1 flex flex-col px-4 py-3 space-y-3">
                <TimelineTrack
                    title="Video Track"
                    type="video"
                    clips={videoClips}
                    currentTime={currentTime}
                    duration={duration}
                    pixelsPerSecond={pixelsPerSecond}
                    selectedClip={selectedClip}
                    onClipUpdate={handleClipUpdate}
                    onClipSelect={handleClipSelect}
                    onTimelineClick={handleTimelineClick}
                    timelineWidth={timelineWidth}
                />

                <TimelineTrack
                    title="Audio Track"
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
                    timelineWidth={timelineWidth}
                />
            </div>
        </div>
    )
}