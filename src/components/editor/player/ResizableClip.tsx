'use client'

import { useRef, useEffect, useState } from 'react'

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
    const [visualPreview, setVisualPreview] = useState<{ startTime: number; endTime: number } | null>(null)
    const startXRef = useRef(0)
    const initialValuesRef = useRef({ startTime: 0, endTime: 0 })

    // Per il rendering visivo, usa preview se disponibile, altrimenti clip originale
    const displayClip = visualPreview || { startTime: clip.startTime, endTime: clip.endTime }
    const duration = displayClip.endTime - displayClip.startTime
    const originalDuration = clip.properties?.originalDuration || (clip.endTime - clip.startTime)

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
                setVisualPreview({ startTime: newStartTime, endTime: newEndTime })

            } else if (dragMode === 'resize-right') {
                const minDuration = 1.0
                const maxDuration = originalDuration
                const currentDuration = endTime - startTime
                const newDuration = Math.min(maxDuration, Math.max(minDuration, currentDuration + deltaTime))
                const newEndTime = startTime + newDuration
                setVisualPreview({ startTime: startTime, endTime: newEndTime })

            } else if (dragMode === 'resize-left') {
                const minDuration = 1.0
                const maxDuration = originalDuration
                const currentDuration = endTime - startTime
                const newDuration = Math.min(maxDuration, Math.max(minDuration, currentDuration - deltaTime))
                const newStartTime = endTime - newDuration
                setVisualPreview({ startTime: Math.max(0, newStartTime), endTime: endTime })
            }
        }

        const handleMouseUp = () => {
            // Solo quando finisce il drag, calcola le proprietà e aggiorna lo store
            if (visualPreview) {
                const newDuration = visualPreview.endTime - visualPreview.startTime
                const currentTrimStart = clip.properties?.trimStart || 0

                let updates: any = {
                    startTime: visualPreview.startTime,
                    endTime: visualPreview.endTime,
                    properties: {
                        ...clip.properties,
                        duration: newDuration
                    }
                }

                // Calcola trimming solo per i resize
                if (dragMode === 'resize-right') {
                    updates.properties.trimEnd = Math.max(0, originalDuration - newDuration - currentTrimStart)
                } else if (dragMode === 'resize-left') {
                    const durationChange = newDuration - (clip.endTime - clip.startTime)
                    updates.properties.trimStart = Math.max(0, currentTrimStart - durationChange)
                }

                onUpdate(updates)
            }
            setIsDragging(false)
            setVisualPreview(null)
        }

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp, { once: true })
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, dragMode, clip, pixelsPerSecond, onUpdate, originalDuration, visualPreview])



    const clipStyle = {
        left: `${displayClip.startTime * pixelsPerSecond}px`,
        width: `${duration * pixelsPerSecond}px`,
    }

    return (
        <div
            className={`resizable-clip absolute h-full rounded-lg cursor-grab flex items-center justify-center group border-2 ${isDragging ? '' : 'transition-all duration-200'} ${isSelected ? 'border-white shadow-xl z-10' : type === 'video' ? 'border-blue-400/80' : 'border-zinc-400/80'
                } ${type === 'video' ? 'bg-gradient-to-r from-zinc-500/90 to-zinc-600/90' : 'bg-transparent'} overflow-hidden shadow-lg backdrop-blur-sm`}
            style={clipStyle}
            onClick={(e) => {
                e.stopPropagation()
                onSelect()
            }}
        >
            <div
                className="absolute -left-1 top-0 h-full w-3 cursor-ew-resize flex items-center justify-center hover:bg-black/20 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
            >
                <div className={`h-3/4 w-1 rounded-full transition-all ${isSelected ? 'bg-white shadow-md' : 'bg-white/60 group-hover:bg-white/90'}`}></div>
            </div>
            <div className="flex-1 h-full flex items-center justify-center px-4 relative">
                {type === 'video' && clip.thumbnail ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={clip.thumbnail}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover rounded-md border border-white/20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center text-center">
                        <span className="text-white text-sm font-semibold truncate max-w-full drop-shadow-sm">
                            {clip.properties?.name || (type === 'video' ? 'Clip' : 'Audio')}
                        </span>
                    </div>
                )}
            </div>

            <div
                className="absolute -right-1 top-0 h-full w-3 cursor-ew-resize flex items-center justify-center hover:bg-black/20 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
            >
                <div className={`h-3/4 w-1 rounded-full transition-all ${isSelected ? 'bg-white shadow-md' : 'bg-white/60 group-hover:bg-white/90'}`}></div>
            </div>
        </div>
    )
}
