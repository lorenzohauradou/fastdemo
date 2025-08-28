'use client'

import { useRef, useEffect, useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'


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
            className={`absolute h-6 top-1/2 -translate-y-1/2 rounded-md cursor-grab flex items-center justify-center group border-2 ${isSelected ? 'border-white shadow-lg z-10' : 'border-transparent'}`}
            style={blockStyle}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
        >
            <div
                className="absolute -left-1 top-0 h-full w-2 cursor-ew-resize flex items-center justify-center"
                onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
            >
                <div className={`h-3/4 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-transparent group-hover:bg-white/50'}`}></div>
            </div>

            <span className="text-white text-[10px] font-semibold truncate px-2 pointer-events-none">
                {animation.type === 'zoom' ? `${Number(animation.properties.end?.level || animation.properties.level || '1').toFixed(1)}x` : animation.properties.content}
            </span>

            <div
                className="absolute -right-1 top-0 h-full w-2 cursor-ew-resize flex items-center justify-center"
                onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
            >
                <div className={`h-3/4 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-transparent group-hover:bg-white/50'}`}></div>
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
        addAnimation,
        updateAnimation,
        removeAnimation,
        selectedAnimation,
        setSelectedAnimation,
    } = useEditorStore()

    const tracks = [
        { id: 'text', label: 'TEXT', type: 'text' as const, color: '#22c55e' }, // Verde
        { id: 'zoom', label: 'ZOOM', type: 'zoom' as const, color: '#f97316' }, // Arancione
        { id: 'voiceover', label: 'VOICEOVER', type: 'voiceover' as const, color: '#a855f7' }, // Viola
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

    // Solo video principale
    const duration = currentProject.duration
    const timelineWidth = timelineContainerRef.current ? timelineContainerRef.current.offsetWidth : 1000
    // Sottrai la larghezza del label per allineare correttamente
    const availableWidth = timelineWidth - 80 // 80px per il label compatto
    const pixelsPerSecond = (availableWidth * timelineZoom) / duration

    // Funzione per il movimento playhead
    const handleTimelineScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.group')) return

        const timelineRect = e.currentTarget.getBoundingClientRect()

        const updatePosition = (clientX: number) => {
            const x = clientX - timelineRect.left - 80 // Sottrai l'offset del label
            const newTime = Math.max(0, Math.min(x / pixelsPerSecond, duration))

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
        const properties = trackType === 'zoom' ? { level: 1.5 } : { content: 'New Text' }

        const startTime = Math.max(0, Math.min(currentTime, duration - 1))
        const endTime = Math.min(startTime + 3, duration)

        addAnimation({
            type: trackType,
            startTime,
            endTime,
            properties
        })
    }
    const playheadStyle = {
        transform: `translateX(${80 + currentTime * pixelsPerSecond}px)`,
    }

    return (
        <div className="h-full bg-gray-900 text-white select-none flex flex-col">
            <div className="h-36 border-t border-gray-700">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                    <div className="flex items-center space-x-6">
                        <span className="text-sm text-gray-300 font-mono">
                            {new Date(currentTime * 1000).toISOString().substr(14, 5)} / {new Date(duration * 1000).toISOString().substr(14, 5)}
                        </span>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddAnimation('text')}
                                className="text-xs px-3 py-1.5 h-7 bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
                            >
                                + Text
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddAnimation('zoom')}
                                className="text-xs px-3 py-1.5 h-7 bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
                            >
                                + Zoom
                            </Button>
                        </div>
                    </div>

                </div>
                <div
                    ref={timelineContainerRef}
                    className="flex-1 overflow-x-auto relative cursor-pointer"
                    onMouseDown={handleTimelineScrub}
                >
                    <div className="relative h-full px-4 py-3" style={{ width: `${Math.max(timelineWidth, timelineWidth * timelineZoom)}px` }}>
                        <div className="absolute top-0 h-full w-0.5 bg-blue-500 z-20 pointer-events-none" style={playheadStyle}>
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 clip-path-triangle"></div>
                        </div>

                        <div className="flex flex-col h-full justify-center space-y-1">
                            {tracks.map(track => {
                                const trackAnimations = currentProject.animations.filter(a => a.type === track.type)

                                return (
                                    <div key={track.id} className="h-8 flex items-center relative mb-1">
                                        <div className="w-20 text-[10px] text-muted-foreground font-bold shrink-0 pr-3 text-right uppercase tracking-wider">{track.label}</div>
                                        <div className="flex-1 h-6 relative bg-gray-800/50 rounded-md border border-gray-700/50">
                                            {trackAnimations.map(anim => (
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
                                            ))}
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
