'use client'

import { useRef, useEffect, useState } from 'react'

interface ResizableClipProps {
    clip: any
    pixelsPerSecond: number
    onUpdate: (updates: any) => void
    isSelected: boolean
    onSelect: () => void
    type?: 'video' | 'audio'
    allClips?: any[] // Lista di tutte le clip per trovare quelle adiacenti
    onMoveAdjacentClip?: (clipId: string, newStartTime: number, newEndTime: number) => void
}

export function ResizableClip({
    clip,
    pixelsPerSecond,
    onUpdate,
    isSelected,
    onSelect,
    type = 'video',
    allClips = [],
    onMoveAdjacentClip
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

    // Funzione per trovare la clip adiacente (attaccata)
    const findAdjacentClip = (currentClip: any, direction: 'left' | 'right') => {
        if (!allClips || allClips.length === 0) return null

        const otherClips = allClips.filter(c => c.id !== currentClip.id && c.id !== 'main-audio')
        const tolerance = 0.1 // Tolleranza per considerare le clip "attaccate"

        if (direction === 'right') {
            // Trova la clip attaccata a destra (startTime della clip adiacente = endTime della clip corrente)
            return otherClips.find(c =>
                Math.abs(c.startTime - currentClip.endTime) <= tolerance
            ) || null
        } else {
            // Trova la clip attaccata a sinistra (endTime della clip adiacente = startTime della clip corrente)
            return otherClips.find(c =>
                Math.abs(c.endTime - currentClip.startTime) <= tolerance
            ) || null
        }
    }

    // Funzione per calcolare il movimento necessario per le clip adiacenti
    const calculateAdjacentClipMovement = (
        currentClip: any,
        newStartTime: number,
        newEndTime: number,
        direction: 'left' | 'right'
    ) => {
        const adjacentClip = findAdjacentClip(currentClip, direction)
        if (!adjacentClip) return null

        if (direction === 'right') {
            // La clip a destra deve spostarsi per rimanere attaccata
            const deltaTime = newEndTime - currentClip.endTime
            return {
                clip: adjacentClip,
                newStartTime: adjacentClip.startTime + deltaTime,
                newEndTime: adjacentClip.endTime + deltaTime
            }
        } else {
            // La clip a sinistra deve spostarsi per rimanere attaccata
            const deltaTime = newStartTime - currentClip.startTime
            return {
                clip: adjacentClip,
                newStartTime: adjacentClip.startTime + deltaTime,
                newEndTime: adjacentClip.endTime + deltaTime
            }
        }
    }

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
                let newDuration = Math.min(maxDuration, Math.max(minDuration, currentDuration + deltaTime))
                let newEndTime = startTime + newDuration

                // Controlla se c'è una clip attaccata a destra che deve essere spostata
                const rightAdjacentClip = findAdjacentClip(clip, 'right')

                if (rightAdjacentClip) {
                    // Se c'è una clip attaccata a destra, non limitare l'espansione
                    // La clip adiacente si sposterà automaticamente
                    setVisualPreview({ startTime: startTime, endTime: newEndTime })
                } else {
                    // Comportamento normale per clip non attaccate
                    // Trova qualsiasi clip che potrebbe essere in conflitto
                    const conflictingClip = allClips.find(c =>
                        c.id !== clip.id &&
                        c.id !== 'main-audio' &&
                        newEndTime > c.startTime &&
                        startTime < c.endTime
                    )

                    if (conflictingClip) {
                        // Se c'è una clip in conflitto, limita l'espansione e attacca
                        newEndTime = conflictingClip.startTime
                        newDuration = newEndTime - startTime
                    } else {
                        // Magnetic snapping: se siamo vicini a una clip, attaccaci
                        const snapDistance = 10 / pixelsPerSecond // 5 pixel di distanza per lo snap
                        const nearbyClip = allClips.find(c =>
                            c.id !== clip.id &&
                            c.id !== 'main-audio' &&
                            Math.abs(newEndTime - c.startTime) <= snapDistance
                        )

                        if (nearbyClip) {
                            newEndTime = nearbyClip.startTime
                            newDuration = newEndTime - startTime
                        }
                    }

                    setVisualPreview({ startTime: startTime, endTime: newEndTime })
                }

            } else if (dragMode === 'resize-left') {
                const minDuration = 1.0
                const maxDuration = originalDuration
                const currentDuration = endTime - startTime
                let newDuration = Math.min(maxDuration, Math.max(minDuration, currentDuration - deltaTime))
                let newStartTime = endTime - newDuration

                // Controlla se c'è una clip attaccata a sinistra che deve essere spostata
                const leftAdjacentClip = findAdjacentClip(clip, 'left')

                if (leftAdjacentClip) {
                    // Se c'è una clip attaccata a sinistra, non limitare l'espansione
                    // La clip adiacente si sposterà automaticamente
                    setVisualPreview({ startTime: Math.max(0, newStartTime), endTime: endTime })
                } else {
                    // Comportamento normale per clip non attaccate
                    // Trova qualsiasi clip che potrebbe essere in conflitto
                    const conflictingClip = allClips.find(c =>
                        c.id !== clip.id &&
                        c.id !== 'main-audio' &&
                        newStartTime < c.endTime &&
                        endTime > c.startTime
                    )

                    if (conflictingClip) {
                        // Se c'è una clip in conflitto, limita l'espansione e attacca
                        newStartTime = conflictingClip.endTime
                        newDuration = endTime - newStartTime
                    } else {
                        // Magnetic snapping: se siamo vicini a una clip, attaccaci
                        const snapDistance = 5 / pixelsPerSecond // 5 pixel di distanza per lo snap
                        const nearbyClip = allClips.find(c =>
                            c.id !== clip.id &&
                            c.id !== 'main-audio' &&
                            Math.abs(newStartTime - c.endTime) <= snapDistance
                        )

                        if (nearbyClip) {
                            newStartTime = nearbyClip.endTime
                            newDuration = endTime - newStartTime
                        }
                    }

                    setVisualPreview({ startTime: Math.max(0, newStartTime), endTime: endTime })
                }
            }
        }

        const handleMouseUp = () => {
            // Solo quando finisce il drag, calcola le proprietà e aggiorna lo store
            if (visualPreview) {
                const newDuration = visualPreview.endTime - visualPreview.startTime
                const currentTrimStart = clip.properties?.trimStart || 0
                const originalClipDuration = clip.endTime - clip.startTime

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

                    // Gestisci movimento della clip adiacente a destra
                    const rightMovement = calculateAdjacentClipMovement(clip, visualPreview.startTime, visualPreview.endTime, 'right')
                    if (rightMovement && onMoveAdjacentClip) {
                        onMoveAdjacentClip(rightMovement.clip.id, rightMovement.newStartTime, rightMovement.newEndTime)
                    }

                } else if (dragMode === 'resize-left') {
                    const durationChange = newDuration - originalClipDuration
                    updates.properties.trimStart = Math.max(0, currentTrimStart - durationChange)

                    // Gestisci movimento della clip adiacente a sinistra
                    const leftMovement = calculateAdjacentClipMovement(clip, visualPreview.startTime, visualPreview.endTime, 'left')
                    if (leftMovement && onMoveAdjacentClip) {
                        onMoveAdjacentClip(leftMovement.clip.id, leftMovement.newStartTime, leftMovement.newEndTime)
                    }

                } else if (dragMode === 'move') {
                    // Per il movimento, gestisci entrambe le clip adiacenti se necessario
                    const rightMovement = calculateAdjacentClipMovement(clip, visualPreview.startTime, visualPreview.endTime, 'right')
                    const leftMovement = calculateAdjacentClipMovement(clip, visualPreview.startTime, visualPreview.endTime, 'left')

                    if (rightMovement && onMoveAdjacentClip) {
                        onMoveAdjacentClip(rightMovement.clip.id, rightMovement.newStartTime, rightMovement.newEndTime)
                    }
                    if (leftMovement && onMoveAdjacentClip) {
                        onMoveAdjacentClip(leftMovement.clip.id, leftMovement.newStartTime, leftMovement.newEndTime)
                    }
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

    // Controlla se questa clip è attaccata ad altre clip
    const isAttachedLeft = allClips.some(c =>
        c.id !== clip.id &&
        c.id !== 'main-audio' &&
        Math.abs(c.endTime - displayClip.startTime) <= 0.1
    )

    const isAttachedRight = allClips.some(c =>
        c.id !== clip.id &&
        c.id !== 'main-audio' &&
        Math.abs(c.startTime - displayClip.endTime) <= 0.1
    )

    const clipStyle = {
        left: `${displayClip.startTime * pixelsPerSecond}px`,
        width: `${duration * pixelsPerSecond}px`,
    }

    return (
        <div
            className={`resizable-clip absolute h-full cursor-grab flex items-center justify-center group border-2 ${isDragging ? '' : 'transition-all duration-200'} ${isSelected ? 'border-white shadow-xl z-10' : type === 'video' ? 'border-blue-400/80' : 'border-zinc-400/80'
                } ${type === 'video' ? 'bg-gradient-to-r from-zinc-500/90 to-zinc-600/90' : 'bg-transparent'} overflow-hidden shadow-lg backdrop-blur-sm ${
                // Bordi arrotondati condizionali per mostrare le connessioni
                isAttachedLeft && isAttachedRight ? '' :
                    isAttachedLeft ? 'rounded-r-lg' :
                        isAttachedRight ? 'rounded-l-lg' : 'rounded-lg'
                }`}
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
