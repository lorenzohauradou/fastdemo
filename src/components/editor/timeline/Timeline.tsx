'use client'

import { useRef, useEffect, useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Upload, Music } from 'lucide-react'


// Componente per renderizzare ogni blocco di animazione (clip)
function AnimationBlock({
    animation,
    track,
    pixelsPerSecond,
    updateAnimation,
    selectedAnimation,
    setSelectedAnimation,
    projectDuration
}: {
    animation: any
    track: any
    pixelsPerSecond: number
    updateAnimation: (id: string, updates: any) => void
    selectedAnimation: any
    setSelectedAnimation: (animation: any) => void
    projectDuration: number
}) {
    const [isDragging, setIsDragging] = useState(false)
    const [dragMode, setDragMode] = useState<'move' | 'resize-left' | 'resize-right' | null>(null)
    const blockRef = useRef<HTMLDivElement>(null)
    const startXRef = useRef(0)

    // Usiamo i ref per i valori iniziali per evitare problemi con le closure di useEffect
    const initialValuesRef = useRef({ startTime: 0, endTime: 0 })

    const isSelected = selectedAnimation?.id === animation.id
    const duration = animation.endTime - animation.startTime

    const handleMouseDown = (e: React.MouseEvent, mode: 'move' | 'resize-left' | 'resize-right') => {
        e.stopPropagation()
        setIsDragging(true)
        setDragMode(mode)
        setSelectedAnimation(animation)
        startXRef.current = e.clientX
        initialValuesRef.current = { startTime: animation.startTime, endTime: animation.endTime }
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return

            const deltaX = e.clientX - startXRef.current
            const deltaTime = deltaX / pixelsPerSecond
            const { startTime, endTime } = initialValuesRef.current

            if (dragMode === 'move') {
                const newStartTime = Math.max(0, startTime + deltaTime)
                const newEndTime = newStartTime + (endTime - startTime)
                if (newEndTime > projectDuration) return
                updateAnimation(animation.id, { startTime: newStartTime, endTime: newEndTime })

            } else if (dragMode === 'resize-right') {
                const minDuration = 1 // Durata minima di 1 secondo --- lunghezza pulsanti colorati
                const newEndTime = Math.max(startTime + minDuration, endTime + deltaTime)
                if (newEndTime > projectDuration) return
                updateAnimation(animation.id, { endTime: newEndTime })

            } else if (dragMode === 'resize-left') {
                const minDuration = 1 // Durata minima di 1 secondo
                const newStartTime = Math.min(endTime - minDuration, startTime + deltaTime)
                if (newStartTime < 0) return
                updateAnimation(animation.id, { startTime: newStartTime })
            }
        }

        const handleMouseUp = () => setIsDragging(false)

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp, { once: true })
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, dragMode, animation.id, pixelsPerSecond, updateAnimation, projectDuration])

    const blockStyle = {
        left: `${animation.startTime * pixelsPerSecond}px`,
        width: `${duration * pixelsPerSecond}px`,
        backgroundColor: track.color,
        borderColor: isSelected ? 'white' : track.color,
    }

    return (
        <div
            ref={blockRef}
            className={`absolute h-3 top-1/2 -translate-y-1/2 rounded cursor-grab flex items-center justify-center group border ${isSelected ? 'border-2 shadow-lg z-10' : 'border'}`}
            style={blockStyle}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
        >
            {/* Maniglia Sinistra */}
            <div
                className="absolute -left-0.5 top-0 h-full w-1.5 cursor-ew-resize flex items-center justify-center"
                onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
            >
                <div className={`h-2/3 w-0.5 rounded-full ${isSelected ? 'bg-white' : 'bg-transparent group-hover:bg-white/50'}`}></div>
            </div>

            <span className="text-white text-[8px] font-bold truncate px-1 pointer-events-none">
                {animation.type === 'zoom' ? `${animation.properties.end?.level || animation.properties.level || '1'}x` : animation.properties.content}
            </span>

            {/* Maniglia Destra */}
            <div
                className="absolute -right-0.5 top-0 h-full w-1.5 cursor-ew-resize flex items-center justify-center"
                onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
            >
                <div className={`h-2/3 w-0.5 rounded-full ${isSelected ? 'bg-white' : 'bg-transparent group-hover:bg-white/50'}`}></div>
            </div>
        </div>
    )
}

export function Timeline() {
    const timelineContainerRef = useRef<HTMLDivElement>(null)
    const [videoThumbnails, setVideoThumbnails] = useState<string[]>([])

    const {
        currentProject,
        currentTime,
        setCurrentTime,

        zoom: timelineZoom,
        setZoom: setTimelineZoom,
        addAnimation,
        updateAnimation,
        removeAnimation,
        selectedAnimation,
        setSelectedAnimation,
        updateProject,
        setSelectedPanel,
        selectedClip
    } = useEditorStore()

    const tracks = [
        { id: 'text', label: 'TEXT', type: 'text' as const, color: '#10b981' }, // Verde
        { id: 'zoom', label: 'ZOOM', type: 'zoom' as const, color: '#f59e0b' }, // Arancione
        { id: 'voiceover', label: 'VOICEOVER', type: 'voiceover' as const, color: '#8b5cf6' }, // Viola
        { id: 'clip', label: 'CLIP', type: 'clip' as const, color: '#3b82f6' }, // Blu per le clip video
    ]

    // Funzione per generare thumbnails dal video
    const generateVideoThumbnails = async (videoUrl: string, numThumbs: number) => {
        return new Promise<string[]>((resolve) => {
            const video = document.createElement('video')
            video.crossOrigin = 'anonymous'
            video.src = videoUrl

            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const thumbnails: string[] = []

            video.addEventListener('loadedmetadata', () => {
                canvas.width = 32
                canvas.height = 18

                let currentThumb = 0
                const interval = video.duration / numThumbs

                const captureFrame = () => {
                    if (currentThumb >= numThumbs) {
                        resolve(thumbnails)
                        return
                    }

                    video.currentTime = currentThumb * interval
                }

                video.addEventListener('seeked', () => {
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                        thumbnails.push(canvas.toDataURL())
                        currentThumb++
                        captureFrame()
                    }
                })

                captureFrame()
            })
        })
    }

    // Genera thumbnails quando il progetto cambia
    useEffect(() => {
        if (currentProject?.videoUrl) {
            generateVideoThumbnails(currentProject.videoUrl, 20).then(setVideoThumbnails)
        }
    }, [currentProject?.videoUrl])

    // Gestione tasti per eliminare animazioni
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedAnimation && (e.key === 'Escape' || e.key === 'Delete' || e.key === 'Backspace')) {
                e.preventDefault()
                removeAnimation(selectedAnimation.id)
                setSelectedAnimation(null) // Reset della selezione dopo l'eliminazione
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedAnimation, removeAnimation, setSelectedAnimation])



    if (!currentProject) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Carica un video per vedere la timeline
            </div>
        )
    }

    // Determina la durata da usare per la timeline
    const clipAnimations = currentProject.animations.filter(a => a.type === 'clip')
    const hasMultipleClips = clipAnimations.length > 0
    const hasMainVideo = currentProject.videoUrl || currentProject.videoFile

    // Se c'è una clip selezionata, usa la sua durata specifica
    let timelineDuration = currentProject.duration
    if (hasMultipleClips && selectedClip && selectedClip !== 'main-video') {
        const selectedClipData = currentProject.animations.find(a => a.id === selectedClip)
        if (selectedClipData) {
            timelineDuration = selectedClipData.properties?.duration || (selectedClipData.endTime - selectedClipData.startTime)
        }
    } else if (selectedClip === 'main-video' && hasMainVideo) {
        // Se è selezionato il video principale, usa la sua durata
        timelineDuration = currentProject.duration
    }

    const duration = timelineDuration
    const timelineWidth = timelineContainerRef.current ? timelineContainerRef.current.offsetWidth : 1000
    // Sottrai la larghezza del label per allineare correttamente
    const availableWidth = timelineWidth - 80 // 80px per il label compatto
    const pixelsPerSecond = (availableWidth * timelineZoom) / duration

    // Funzione per il movimento fluido del playhead
    const handleTimelineScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.group')) return

        const timelineRect = e.currentTarget.getBoundingClientRect()

        const updatePosition = (clientX: number) => {
            const x = clientX - timelineRect.left - 80 // Sottrai l'offset del label (ridotto per layout compatto)
            let newTime = Math.max(0, x / pixelsPerSecond)

            // Se è selezionata una clip specifica, converti il tempo relativo in tempo globale
            if (hasMultipleClips && selectedClip && selectedClip !== 'main-video') {
                const selectedClipData = currentProject?.animations?.find(a => a.id === selectedClip)
                if (selectedClipData) {
                    // Limita il tempo alla durata della clip selezionata
                    const clipDuration = selectedClipData.endTime - selectedClipData.startTime
                    newTime = Math.min(newTime, clipDuration)
                    // Converti da tempo relativo a tempo globale
                    newTime = selectedClipData.startTime + newTime
                }
            } else {
                // Per main-video o modalità unified, usa la durata totale
                newTime = Math.min(newTime, duration)
            }

            console.log('🎯 Timeline scrub:', { relativeTime: x / pixelsPerSecond, globalTime: newTime, selectedClip })
            console.log('🎯 Timeline SUPERIORE: Impostando currentTime a', newTime)
            setCurrentTime(newTime)
        }

        updatePosition(e.clientX)

        const handleMouseMove = (moveEvent: MouseEvent) => {
            updatePosition(moveEvent.clientX)
        }

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp, { once: true })
    }

    const handleAddAnimation = (trackType: 'text' | 'zoom') => {
        const baseProperties = trackType === 'zoom' ? { level: 1.5 } : { content: 'New Text' }

        // Se c'è una clip selezionata (diversa dal video principale), associa l'animazione a quella clip
        const properties = hasMultipleClips && selectedClip && selectedClip !== 'main-video'
            ? { ...baseProperties, clipId: selectedClip }
            : baseProperties

        // Calcola il tempo relativo alla clip selezionata
        let relativeStartTime = currentTime
        let relativeEndTime = Math.min(currentTime + 3, duration)

        // Se è selezionata una clip specifica, i tempi sono relativi a quella clip (0 - clipDuration)
        if (hasMultipleClips && selectedClip && selectedClip !== 'main-video') {
            // I tempi sono già relativi alla clip selezionata grazie alla nuova logica di durata
            relativeStartTime = Math.max(0, Math.min(currentTime, duration - 1))
            relativeEndTime = Math.min(relativeStartTime + 3, duration)
        }

        addAnimation({
            type: trackType,
            startTime: relativeStartTime,
            endTime: relativeEndTime,
            properties
        })
    }
    // con il blob funziona
    const handleAudioImport = async () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'audio/*'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                try {
                    // Upload del file audio al backend
                    const formData = new FormData()
                    formData.append('file', file)

                    const response = await fetch('/api/upload/audio', {
                        method: 'POST',
                        body: formData
                    })

                    if (response.ok) {
                        // Usa direttamente il blob invece della route API
                        const audioUrl = URL.createObjectURL(file)
                        updateProject({
                            musicSettings: {
                                type: 'custom',
                                track: audioUrl,
                                volume: 0.5
                            }
                        })
                    } else {
                        console.error('Errore nell\'upload dell\'audio')
                        // Fallback all'URL locale se l'upload fallisce
                        const audioUrl = URL.createObjectURL(file)
                        updateProject({
                            musicSettings: {
                                type: 'custom',
                                track: audioUrl,
                                volume: 0.5
                            }
                        })
                    }
                } catch (error) {
                    console.error('Errore nell\'upload dell\'audio:', error)
                    // Fallback all'URL locale in caso di errore
                    const audioUrl = URL.createObjectURL(file)
                    updateProject({
                        musicSettings: {
                            type: 'custom',
                            track: audioUrl,
                            volume: 0.5
                        }
                    })
                }
            }
        }
        input.click()
    }

    const handleOpenLibrary = () => {
        setSelectedPanel('music')
    }

    const handleImportVideo = () => {
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
                    const totalClipDuration = currentClips.reduce((acc, clip) => acc + (clip.endTime - clip.startTime), 0)

                    // Aggiungi la clip come animazione nella timeline
                    addAnimation({
                        type: 'clip',
                        startTime: totalClipDuration,
                        endTime: totalClipDuration + clipDuration,
                        properties: {
                            file,
                            url: URL.createObjectURL(file),
                            name: file.name,
                            duration: clipDuration
                        }
                    })

                    // Aggiorna la durata totale del progetto se necessario
                    const newTotalDuration = totalClipDuration + clipDuration
                    if (newTotalDuration > (currentProject?.duration || 0)) {
                        updateProject({
                            duration: newTotalDuration
                        })
                    }
                }
            }
        }
        input.click()
    }



    // Calcola la posizione del playhead - TEMPO RELATIVO per clip specifiche
    let relativeTime = currentTime
    let playheadDuration = duration

    // Se è selezionata una clip specifica (non main-video), calcola il tempo relativo
    if (hasMultipleClips && selectedClip && selectedClip !== 'main-video') {
        const selectedClipData = currentProject?.animations?.find(a => a.id === selectedClip)
        if (selectedClipData) {
            // Tempo relativo alla clip selezionata (0 = inizio clip, durata = fine clip)
            relativeTime = Math.max(0, Math.min(
                currentTime - selectedClipData.startTime,
                selectedClipData.endTime - selectedClipData.startTime
            ))
            playheadDuration = selectedClipData.endTime - selectedClipData.startTime
        }
    }

    const playheadStyle = {
        transform: `translateX(${80 + relativeTime * pixelsPerSecond}px)`,
    }

    return (
        <div className="h-full bg-background text-foreground select-none flex flex-col">
            {/* Timeline compatta */}
            <div className="h-32 border-t border-border">
                {/* Controlli superiori */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-muted-foreground font-mono">
                            {new Date(relativeTime * 1000).toISOString().substr(14, 5)} / {new Date(playheadDuration * 1000).toISOString().substr(14, 5)}
                        </span>
                        <div className="flex items-center space-x-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddAnimation('text')}
                                className="text-xs px-2 py-1 h-6"
                            >
                                + Text
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddAnimation('zoom')}
                                className="text-xs px-2 py-1 h-6"
                            >
                                + Zoom
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTimelineZoom(Math.max(1, timelineZoom - 1))}
                            className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground w-8 text-center">{timelineZoom.toFixed(1)}x</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTimelineZoom(Math.min(20, timelineZoom + 1))}
                            className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Area timeline */}
                <div
                    ref={timelineContainerRef}
                    className="flex-1 overflow-x-auto relative cursor-pointer"
                    onMouseDown={handleTimelineScrub}
                >
                    <div className="relative h-full px-4 py-2" style={{ width: `${Math.max(timelineWidth, timelineWidth * timelineZoom)}px` }}>
                        {/* Playhead */}
                        <div className="absolute top-0 h-full w-0.5 bg-red-500 z-20 pointer-events-none" style={playheadStyle}>
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>

                        {/* Tracce compatte */}
                        <div className="flex flex-col h-full justify-center space-y-0.5">
                            {tracks.map(track => {
                                // Filtra le animazioni in base alla clip selezionata
                                let trackAnimations: any[]

                                if (track.type === 'clip') {
                                    // Per la traccia CLIP, mostra sempre tutte le clip
                                    trackAnimations = currentProject.animations.filter(a => a.type === track.type)
                                } else if (hasMultipleClips && selectedClip && selectedClip !== 'main-video') {
                                    // Per altre tracce con clip multiple: mostra solo le animazioni della clip selezionata
                                    trackAnimations = currentProject.animations.filter(a =>
                                        a.type === track.type && a.properties?.clipId === selectedClip
                                    )
                                } else if (selectedClip === 'main-video' || !hasMultipleClips) {
                                    // Per il video principale o quando non ci sono clip multiple: mostra tutte le animazioni del tipo
                                    trackAnimations = currentProject.animations.filter(a =>
                                        a.type === track.type && !a.properties?.clipId
                                    )
                                } else {
                                    // Nessuna clip selezionata con clip multiple: non mostrare animazioni
                                    trackAnimations = []
                                }

                                const hasClipContent = track.type === 'clip' ? (trackAnimations.length > 0 || hasMainVideo) : trackAnimations.length > 0

                                return (
                                    <div key={track.id} className="h-6 flex items-center relative">
                                        <div className="w-20 text-[9px] text-muted-foreground font-semibold shrink-0 pr-2 text-right uppercase tracking-wide">{track.label}</div>
                                        <div className="flex-1 h-4 relative bg-muted/10 rounded border border-border/30">
                                            {/* Contenuto speciale per la traccia CLIP */}
                                            {track.type === 'clip' && !hasClipContent ? (
                                                <div className="absolute inset-0 flex items-center justify-center space-x-2">
                                                    <button
                                                        className="px-2 py-1 text-[8px] text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/40 rounded border border-border/50 transition-colors"
                                                        onClick={() => console.log('Record screen - funzionalità da implementare')}
                                                    >
                                                        Record screen
                                                    </button>
                                                    <button
                                                        className="px-2 py-1 text-[8px] text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/40 rounded border border-border/50 transition-colors"
                                                        onClick={handleImportVideo}
                                                    >
                                                        Import image or video
                                                    </button>
                                                </div>
                                            ) : track.type === 'clip' && hasMainVideo ? (
                                                // Mostra il video principale come blocco blu nella traccia CLIP
                                                <div className="absolute inset-0 bg-blue-500 rounded flex items-center justify-center">
                                                    <span className="text-white text-[8px] font-bold">Video Clip</span>
                                                </div>
                                            ) : (
                                                trackAnimations.map(anim => (
                                                    <AnimationBlock
                                                        key={anim.id}
                                                        animation={anim}
                                                        track={track}
                                                        pixelsPerSecond={pixelsPerSecond}
                                                        updateAnimation={updateAnimation}
                                                        selectedAnimation={selectedAnimation}
                                                        setSelectedAnimation={setSelectedAnimation}
                                                        projectDuration={duration}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
