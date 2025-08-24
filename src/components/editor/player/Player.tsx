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
        addAnimation,
        updateAnimation,
        removeAnimation,
        selectedClip,
        setSelectedClip
    } = useEditorStore()

    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const timelineRef = useRef<HTMLDivElement>(null)
    const [videoThumbnails, setVideoThumbnails] = useState<{ [key: string]: string }>({})
    const [timelineZoom, setTimelineZoom] = useState(1)
    const isChangingVideoRef = useRef(false)
    const lastVideoUrlRef = useRef<string>('')
    const isTransitioningRef = useRef(false)

    const videoSrc = currentProject?.videoUrl || (currentProject?.videoFile ? URL.createObjectURL(currentProject.videoFile) : '')
    const audioSrc = currentProject?.musicSettings?.track || ''

    // Determina se ci sono clip multiple o solo il video principale
    const clipAnimations = currentProject?.animations?.filter(a => a.type === 'clip') || []
    const hasMainVideo = !!(videoSrc || currentProject?.videoFile)
    const hasMultipleClips = clipAnimations.length > 0

    // Crea le clip per il rendering - memoizzato per evitare re-calcoli inutili
    const videoClips: VideoClip[] = useMemo(() => {
        console.log('Ricreando videoClips - clipAnimations:', clipAnimations.length)
        console.log('clipAnimations details:', clipAnimations.map(c => ({
            id: c.id,
            startTime: c.startTime,
            endTime: c.endTime,
            duration: c.endTime - c.startTime
        })))
        return createVideoClips(
            currentProject,
            clipAnimations,
            hasMainVideo,
            hasMultipleClips,
            videoSrc,
            videoThumbnails
        )
    }, [
        hasMainVideo,
        hasMultipleClips,
        currentProject?.animations, // Usa direttamente le animazioni invece di clipAnimations
        currentProject?.duration,
        currentProject?.videoTrimming,
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

    // Sincronizza il video con il tempo corrente, considerando il trimming
    useEffect(() => {
        if (!videoRef.current) return

        // Trova la clip video attiva al tempo corrente della timeline
        const activeVideoClip = videoClips.find(clip =>
            currentTime >= clip.startTime && currentTime <= clip.endTime
        )

        if (activeVideoClip) {
            // Cambia il src del video se necessario PRIMA di impostare il tempo
            const clipUrl = activeVideoClip.properties?.url || videoSrc
            const currentSrc = videoRef.current.src

            // Controlla se dobbiamo cambiare il video E non stiamo già cambiando
            const clipFileName = clipUrl ? clipUrl.split('/').pop() || '' : ''
            const currentFileName = currentSrc ? currentSrc.split('/').pop() || '' : ''
            const needsVideoChange = clipUrl &&
                clipFileName !== currentFileName &&
                !isChangingVideoRef.current &&
                lastVideoUrlRef.current !== clipUrl

            if (needsVideoChange) {
                console.log('Cambiando video da', currentSrc, 'a', clipUrl)

                // Imposta i flag per prevenire loop
                isChangingVideoRef.current = true
                lastVideoUrlRef.current = clipUrl

                // Pausa il video corrente prima di cambiare src per evitare AbortError
                if (videoRef.current && !videoRef.current.paused) {
                    videoRef.current.pause()
                }

                videoRef.current.src = clipUrl

                // Aspetta che il video sia caricato prima di impostare il tempo
                const handleLoadedMetadata = () => {
                    if (videoRef.current) {
                        const relativeTime = currentTime - activeVideoClip.startTime
                        const trimStart = activeVideoClip.properties?.trimStart || 0
                        const actualVideoTime = trimStart + relativeTime

                        const originalDuration = activeVideoClip.properties?.originalDuration || videoRef.current.duration
                        const trimEnd = activeVideoClip.properties?.trimEnd || 0
                        const maxVideoTime = originalDuration - trimEnd
                        const clampedVideoTime = Math.min(actualVideoTime, maxVideoTime)

                        videoRef.current.currentTime = clampedVideoTime
                    }
                    // Rimuovi il listener dopo l'uso
                    videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata)
                }

                // Aspetta che il video sia pronto per la riproduzione
                const handleCanPlay = () => {
                    // Salva lo stato di riproduzione prima del cambio
                    const wasPlaying = isPlaying

                    if (videoRef.current && wasPlaying) {
                        videoRef.current.play().catch(error => {
                            console.error('Errore durante play dopo cambio video:', error)
                        })
                    }
                    // Reset del flag dopo il caricamento
                    isChangingVideoRef.current = false
                    // Rimuovi il listener dopo l'uso
                    videoRef.current?.removeEventListener('canplay', handleCanPlay)
                }

                videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
                videoRef.current.addEventListener('canplay', handleCanPlay)
            } else if (!isPlaying && !isChangingVideoRef.current) {
                // Solo se non stiamo riproducendo, aggiorna il tempo
                const relativeTime = currentTime - activeVideoClip.startTime
                const trimStart = activeVideoClip.properties?.trimStart || 0
                const actualVideoTime = trimStart + relativeTime

                const originalDuration = activeVideoClip.properties?.originalDuration || 0
                const trimEnd = activeVideoClip.properties?.trimEnd || 0
                const maxVideoTime = originalDuration - trimEnd
                const clampedVideoTime = Math.min(actualVideoTime, maxVideoTime)

                if (Math.abs(videoRef.current.currentTime - clampedVideoTime) > 0.2) {
                    videoRef.current.currentTime = clampedVideoTime
                }
            }
        }

        // Sincronizza l'audio solo quando non è in riproduzione
        if (audioRef.current && !isPlaying) {
            const activeAudioClip = audioClips.find(clip =>
                currentTime >= clip.startTime && currentTime <= clip.endTime
            )

            if (activeAudioClip) {
                const relativeTime = currentTime - activeAudioClip.startTime
                const trimStart = activeAudioClip.properties?.trimStart || 0
                const actualAudioTime = trimStart + relativeTime

                if (Math.abs(audioRef.current.currentTime - actualAudioTime) > 0.2) {
                    audioRef.current.currentTime = actualAudioTime
                }
            }
        }
    }, [currentTime, videoClips, audioClips, isPlaying, videoSrc])

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
        setIsPlaying(!isPlaying)
    }

    const handleTimeUpdate = () => {
        if (videoRef.current && isPlaying && !isChangingVideoRef.current && !isTransitioningRef.current) {
            const videoTime = videoRef.current.currentTime

            // LOGICA SEMPLIFICATA: Trova la clip che dovrebbe essere riprodotta al tempo corrente
            const sortedClips = [...videoClips].sort((a, b) => a.startTime - b.startTime)
            const currentClipIndex = sortedClips.findIndex(clip =>
                currentTime >= clip.startTime && currentTime <= clip.endTime
            )

            if (currentClipIndex >= 0) {
                const currentClip = sortedClips[currentClipIndex]

                // Aggiorna selectedClip se necessario (solo per la timeline superiore)
                if (selectedClip !== currentClip.id) {
                    setSelectedClip(currentClip.id)
                }

                // Controlla se la clip corrente è finita
                const trimStart = currentClip.properties?.trimStart || 0
                const trimEnd = currentClip.properties?.trimEnd || 0
                const originalDuration = currentClip.properties?.originalDuration || 0
                const maxVideoTime = originalDuration - trimEnd

                const relativeVideoTime = videoTime - trimStart
                const timelineTime = currentClip.startTime + relativeVideoTime

                const isClipFinished = timelineTime >= currentClip.endTime - 0.1 || videoTime >= maxVideoTime - 0.1

                if (isClipFinished) {
                    console.log('🎬 Clip finita, passando alla successiva:', currentClip.id)

                    // C'è una clip successiva?
                    const nextClipIndex = currentClipIndex + 1
                    if (nextClipIndex < sortedClips.length) {
                        const nextClip = sortedClips[nextClipIndex]
                        console.log('➡️ Passando a:', nextClip.id)

                        // Cambia video source se necessario
                        const nextClipUrl = nextClip.properties?.url || videoSrc
                        const currentVideoUrl = currentClip.properties?.url || videoSrc

                        if (nextClipUrl !== currentVideoUrl) {
                            isChangingVideoRef.current = true

                            try {
                                videoRef.current.pause()
                                videoRef.current.src = nextClipUrl

                                const handleLoadedData = () => {
                                    if (videoRef.current) {
                                        const trimStart = nextClip.properties?.trimStart || 0
                                        videoRef.current.currentTime = trimStart

                                        isChangingVideoRef.current = false

                                        if (isPlaying) {
                                            setTimeout(() => {
                                                videoRef.current?.play().catch(console.error)
                                            }, 50)
                                        }
                                    }
                                    videoRef.current?.removeEventListener('loadeddata', handleLoadedData)
                                }

                                videoRef.current.addEventListener('loadeddata', handleLoadedData)
                            } catch (error) {
                                console.error('Errore durante cambio video:', error)
                                isChangingVideoRef.current = false
                            }
                        }

                        // Aggiorna currentTime al punto di inizio della clip successiva
                        setCurrentTime(nextClip.startTime)
                        setSelectedClip(nextClip.id)

                    } else {
                        // Fine di tutte le clip
                        console.log('🏁 Fine di tutte le clip')
                        setIsPlaying(false)
                    }
                } else {
                    // Aggiorna currentTime normalmente
                    const newTime = currentClip.startTime + relativeVideoTime
                    if (Math.abs(newTime - currentTime) > 0.05) {
                        setCurrentTime(Math.min(newTime, currentClip.endTime))
                    }
                }
            } else {
                // Nessuna clip trovata
                console.log('❌ Nessuna clip trovata per currentTime:', currentTime)
                setIsPlaying(false)
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

    // Genera thumbnails per le clip video quando cambiano
    useEffect(() => {
        // Processa le clip dalle animazioni
        if (currentProject?.animations) {
            const clipsToProcess = currentProject.animations
                .filter(a => a.type === 'clip' && a.properties.url && !videoThumbnails[a.id])

            console.log('Clip da processare per thumbnails:', clipsToProcess.length)

            clipsToProcess.forEach(clip => {
                console.log('Generando thumbnail per clip:', clip.id, clip.properties.url)
                generateVideoThumbnail(clip.properties.url, clip.id, handleThumbnailGenerated)
            })
        }

        // Processa anche il video principale del progetto
        if (videoSrc && !videoThumbnails['main-video']) {
            console.log('Generando thumbnail per video principale:', videoSrc)
            generateVideoThumbnail(videoSrc, 'main-video', handleThumbnailGenerated)
        }
    }, [currentProject?.animations, videoSrc, videoThumbnails])

    // Gestione tasti per eliminare clip selezionate
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedClip && (e.key === 'Escape' || e.key === 'Delete' || e.key === 'Backspace')) {
                e.preventDefault()

                if (selectedClip === 'main-video') {
                    // Non permettere di cancellare il video principale, solo deselezionarlo
                    setSelectedClip(null)
                } else {
                    // Rimuovi la clip dalle animazioni
                    const clipToRemove = currentProject?.animations.find(a => a.id === selectedClip)
                    if (clipToRemove) {
                        removeAnimation(selectedClip)
                        setSelectedClip(null)

                        // Ricalcola la durata totale del progetto
                        setTimeout(() => {
                            const remainingClips = currentProject?.animations?.filter(a => a.type === 'clip' && a.id !== selectedClip) || []
                            const mainVideoDuration = hasMainVideo ? (currentProject?.duration || 0) : 0

                            let totalDuration = mainVideoDuration
                            remainingClips.forEach(clip => {
                                totalDuration += clip.properties?.duration || (clip.endTime - clip.startTime)
                            })

                            if (totalDuration !== currentProject?.duration) {
                                updateProject({ duration: totalDuration })
                            }
                        }, 0)
                    }
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedClip, currentProject?.animations, currentProject?.duration, hasMainVideo, removeAnimation, setSelectedClip, updateProject])

    // ===== GESTIONE CLIP VIDEO =====
    const handleAddVideoClip = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'video/*'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                // Crea un elemento video temporaneo per ottenere la durata
                const video = document.createElement('video')
                video.src = URL.createObjectURL(file)
                video.onloadedmetadata = () => {
                    const clipDuration = video.duration
                    const currentClips = currentProject?.animations.filter(a => a.type === 'clip') || []

                    // Calcola la posizione di partenza per la nuova clip
                    let startTime = 0

                    if (currentClips.length > 0) {
                        // Se ci sono già clip, posiziona la nuova dopo l'ultima
                        const lastClip = currentClips.reduce((latest, clip) => {
                            const clipEndTime = clip.endTime || (clip.startTime + (clip.properties?.duration || 0))
                            const latestEndTime = latest.endTime || (latest.startTime + (latest.properties?.duration || 0))
                            return clipEndTime > latestEndTime ? clip : latest
                        })
                        startTime = lastClip.endTime || (lastClip.startTime + (lastClip.properties?.duration || 0))
                    } else if (hasMainVideo) {
                        // Se c'è solo il video principale, inizia dopo di esso
                        startTime = currentProject?.duration || 10
                    }

                    console.log('Aggiungendo nuova clip:', {
                        hasMainVideo,
                        mainVideoDuration: currentProject?.duration || 10,
                        existingClipsCount: currentClips.length,
                        newClipStartTime: startTime,
                        newClipDuration: clipDuration
                    })

                    // Aggiungi la clip come animazione nella timeline
                    addAnimation({
                        type: 'clip',
                        startTime: startTime,
                        endTime: startTime + clipDuration,
                        properties: {
                            file,
                            url: URL.createObjectURL(file),
                            name: file.name,
                            duration: clipDuration,
                            originalDuration: clipDuration,
                            trimStart: 0,
                            trimEnd: 0
                        }
                    })

                    // NON aggiornare manualmente la durata del progetto
                    // La durata viene calcolata automaticamente dalle clip esistenti
                }
            }
        }
        input.click()
    }

    // ===== CALCOLI TIMELINE =====
    const totalVideoDuration = videoClips.length > 0
        ? Math.max(...videoClips.map(clip => clip.endTime))
        : (currentProject?.duration || 10)
    const duration = totalVideoDuration
    const timelineWidth = timelineRef.current ? timelineRef.current.offsetWidth : 800

    // PixelsPerSecond MOLTO COMPATTO come nell'esempio mostrato
    // Valore molto basso per clip compatte e facilmente gestibili
    const pixelsPerSecond = 3

    // ===== GESTIONE EVENTI TIMELINE =====
    const handleTimelineClick = (newTime: number) => {
        // Ferma la riproduzione prima di cambiare il tempo
        if (isPlaying) {
            setIsPlaying(false)
        }

        // Limita il tempo ai bounds delle clip esistenti
        const totalDuration = videoClips.length > 0
            ? Math.max(...videoClips.map(clip => clip.endTime))
            : (currentProject?.duration || 10)

        const clampedTime = Math.max(0, Math.min(totalDuration, newTime))

        // Assicurati che il tempo sia all'interno di una clip valida
        const activeClip = videoClips.find(clip =>
            clampedTime >= clip.startTime && clampedTime <= clip.endTime
        )

        if (activeClip || videoClips.length === 0) {
            setCurrentTime(clampedTime)
        } else {
            // Se non c'è una clip attiva, vai alla clip più vicina
            const nearestClip = videoClips.reduce((nearest, clip) => {
                const nearestDistance = Math.abs(clampedTime - nearest.startTime)
                const clipDistance = Math.abs(clampedTime - clip.startTime)
                return clipDistance < nearestDistance ? clip : nearest
            })
            setCurrentTime(nearestClip.startTime)
        }
    }

    // Gestione selezione clip SENZA influenzare il currentTime
    const handleClipSelect = (clipId: string) => {
        setSelectedClip(clipId)
        // NON modificare currentTime quando selezioni una clip manualmente
    }

    // Gestione click sulla timeline: seleziona automaticamente la clip sotto la barra rossa
    const handleTimelineClickWithSelection = (newTime: number) => {
        // Prima aggiorna il tempo
        handleTimelineClick(newTime)

        // Poi trova e seleziona la clip sotto la nuova posizione
        const clipUnderPlayhead = videoClips.find(clip =>
            newTime >= clip.startTime && newTime <= clip.endTime
        ) || audioClips.find(clip =>
            newTime >= clip.startTime && newTime <= clip.endTime
        )

        if (clipUnderPlayhead) {
            setSelectedClip(clipUnderPlayhead.id)
        }
    }

    // ===== GESTIONE AGGIORNAMENTI CLIP =====
    const handleClipUpdate = (clipId: string, updates: any, isAudio = false) => {
        if (clipId === 'main-video') {
            // Video principale: trattalo come una normale clip nelle animazioni
            console.log('🎬 RESIZE MAIN-VIDEO - handleClipUpdate chiamato con:', {
                clipId,
                updates,
                currentDuration: duration,
                newDuration: updates.endTime || duration
            })

            // Cerca se esiste già un'animazione per il main-video
            let existingMainVideoAnimation = currentProject?.animations.find(a => a.id === 'main-video')

            if (!existingMainVideoAnimation) {
                // Se non esiste, crea l'animazione per il main-video
                const newAnimation = {
                    type: 'clip' as const,
                    startTime: 0,
                    endTime: updates.endTime || duration,
                    properties: {
                        name: 'Main Video',
                        url: videoSrc,
                        originalDuration: currentProject?.duration || 10,
                        duration: updates.endTime || duration,
                        trimStart: updates.properties?.trimStart || 0,
                        trimEnd: updates.properties?.trimEnd || 0,
                        isMainVideo: true,
                        ...updates.properties
                    }
                }
                addAnimation(newAnimation)
                console.log('✅ Creata nuova animazione per main-video')
            } else {
                // Se esiste, aggiornala
                updateAnimation(clipId, updates)
                console.log('✅ Aggiornata animazione esistente per main-video')
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
        } else {
            // Clip multiple: aggiorna l'animazione specifica SENZA influenzare altre clip
            console.log('🔧 RESIZE CLIP - handleClipUpdate chiamato con:', {
                clipId,
                updates,
                currentStartTime: currentProject?.animations.find(a => a.id === clipId)?.startTime,
                currentEndTime: currentProject?.animations.find(a => a.id === clipId)?.endTime
            })

            updateAnimation(clipId, updates)

            // Debug immediato: verifica che l'animazione sia stata aggiornata
            console.log('✅ DOPO updateAnimation - animazione aggiornata:',
                currentProject?.animations.find(a => a.id === clipId)
            )

            // Controlla se il currentTime è oltre la nuova endTime della clip modificata
            if (updates.endTime && currentTime > updates.endTime && selectedClip === clipId) {
                // Se la clip è stata compressa e il currentTime è oltre la nuova fine,
                // sposta il currentTime alla fine della clip compressa
                console.log('Clip compressa, spostando currentTime da', currentTime, 'a', updates.endTime)
                setCurrentTime(updates.endTime)
            }

            // NON ricalcolare la durata totale qui per evitare che le clip si allunghino
            // La durata totale dovrebbe essere calcolata solo quando si aggiungono/rimuovono clip
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
                    title={hasMultipleClips ? 'Video Clips' : 'Video Track'}
                    type="video"
                    clips={videoClips}
                    currentTime={currentTime}
                    duration={duration}
                    pixelsPerSecond={pixelsPerSecond}
                    selectedClip={selectedClip}
                    onClipUpdate={handleClipUpdate}
                    onClipSelect={handleClipSelect}
                    onTimelineClick={handleTimelineClickWithSelection}
                    onAddClip={handleAddVideoClip}
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
                    onTimelineClick={handleTimelineClickWithSelection}
                    onAddClip={handleAudioImport}
                    showWaveform={!!audioSrc}
                    timelineWidth={timelineWidth}
                />
            </div>
        </div>
    )
}
