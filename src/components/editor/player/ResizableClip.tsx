'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface ResizableClipProps {
    clip: any
    pixelsPerSecond: number
    onUpdate: (updates: any) => void
    isSelected: boolean
    onSelect: () => void
    type?: 'video' | 'audio'
}

export function ResizableClip({
    clip,
    pixelsPerSecond,
    onUpdate,
    isSelected,
    onSelect,
    type = 'video'
}: ResizableClipProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [dragMode, setDragMode] = useState<'move' | 'resize-left' | 'resize-right' | null>(null)
    const startXRef = useRef(0)
    const initialValuesRef = useRef({ startTime: 0, endTime: 0 })
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Debounced update function per migliorare le performance
    const debouncedUpdate = useCallback((updates: any) => {
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current)
        }
        updateTimeoutRef.current = setTimeout(() => {
            console.log('🎯 ResizableClip - debouncedUpdate chiamato con:', updates)
            onUpdate(updates)
        }, 16) // ~60fps
    }, [onUpdate])

    const duration = clip.endTime - clip.startTime
    const originalDuration = clip.properties?.originalDuration || duration

    const handleMouseDown = (e: React.MouseEvent, mode: 'move' | 'resize-left' | 'resize-right') => {
        e.stopPropagation()
        setIsDragging(true)
        setDragMode(mode)
        onSelect()
        startXRef.current = e.clientX
        initialValuesRef.current = { startTime: clip.startTime, endTime: clip.endTime }
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
                debouncedUpdate({ startTime: newStartTime, endTime: newEndTime })

            } else if (dragMode === 'resize-right') {
                const minDuration = 1.0 // Durata minima di 1 secondo
                const maxDuration = originalDuration // Non può superare la durata originale
                const currentDuration = endTime - startTime
                const newDuration = Math.min(maxDuration, Math.max(minDuration, currentDuration + deltaTime))
                const newEndTime = startTime + newDuration

                // Calcola il trim end basato sulla nuova durata
                const trimEnd = Math.max(0, originalDuration - newDuration)

                debouncedUpdate({
                    endTime: newEndTime,
                    properties: {
                        ...clip.properties,
                        trimEnd: trimEnd,
                        duration: newDuration
                    }
                })

            } else if (dragMode === 'resize-left') {
                const minDuration = 1.0 // Durata minima di 1 secondo
                const maxDuration = originalDuration // Non può superare la durata originale
                const currentDuration = endTime - startTime
                const newDuration = Math.min(maxDuration, Math.max(minDuration, currentDuration - deltaTime))
                const newStartTime = endTime - newDuration

                // Calcola il trim start basato sul nuovo start time
                const trimStart = Math.max(0, startTime - newStartTime + (clip.properties?.trimStart || 0))

                debouncedUpdate({
                    startTime: Math.max(0, newStartTime),
                    properties: {
                        ...clip.properties,
                        trimStart: trimStart,
                        duration: newDuration
                    }
                })
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
    }, [isDragging, dragMode, clip, pixelsPerSecond, debouncedUpdate, originalDuration])

    // Cleanup del timeout quando il componente viene smontato
    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current)
            }
        }
    }, [])

    const clipStyle = {
        left: `${clip.startTime * pixelsPerSecond}px`,
        width: `${duration * pixelsPerSecond}px`,
    }

    return (
        <div
            className={`resizable-clip absolute h-full rounded-lg cursor-grab flex items-center justify-center group border-2 transition-all duration-200 ${isSelected ? 'border-white shadow-xl z-10' : type === 'video' ? 'border-blue-400' : 'border-green-400'
                } ${type === 'video' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'} overflow-hidden shadow-lg`}
            style={clipStyle}
            onClick={(e) => {
                e.stopPropagation()
                onSelect()
            }}
        >
            {/* Handle sinistro per resize */}
            <div
                className="absolute -left-0.5 top-0 h-full w-2 cursor-ew-resize flex items-center justify-center hover:bg-black/20 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
            >
                <div className={`h-1/2 w-0.5 rounded-full transition-all ${isSelected ? 'bg-white shadow-md' : 'bg-white/50 group-hover:bg-white/80'}`}></div>
            </div>

            {/* Contenuto della clip */}
            <div className="flex-1 h-full flex items-center justify-center px-3 relative">
                {type === 'video' && clip.thumbnail ? (
                    <div className="relative w-full h-full">
                        <img
                            src={clip.thumbnail}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover rounded opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 rounded"></div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center text-center">
                        <span className="text-white text-[10px] font-semibold truncate max-w-full">
                            {clip.properties?.name || (type === 'video' ? 'Video' : 'Audio')}
                        </span>
                    </div>
                )}

                {/* Indicatore di trimming se presente */}
                {(clip.properties?.trimStart || clip.properties?.trimEnd) && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-80"></div>
                )}
            </div>

            {/* Handle destro per resize */}
            <div
                className="absolute -right-0.5 top-0 h-full w-2 cursor-ew-resize flex items-center justify-center hover:bg-black/20 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
            >
                <div className={`h-1/2 w-0.5 rounded-full transition-all ${isSelected ? 'bg-white shadow-md' : 'bg-white/50 group-hover:bg-white/80'}`}></div>
            </div>
        </div>
    )
}
