'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Animation } from '@/lib/store'

interface ZoomControllerProps {
    selectedAnimation: Animation | null
    clipTime: number
    updateAnimation: (id: string, updates: Partial<Animation>) => void
    children: (props: {
        interactiveZoom: number
        zoomPosition: { x: number; y: number }
        isDragging: boolean
        onMouseDown: (e: React.MouseEvent) => void
        onMouseMove: (e: React.MouseEvent) => void
        onMouseUp: () => void
        onWheel: (e: React.WheelEvent) => void
    }) => React.ReactNode
}

export function ZoomController({
    selectedAnimation,
    clipTime,
    updateAnimation,
    children
}: ZoomControllerProps) {
    // Stato per il zoom interattivo
    const [interactiveZoom, setInteractiveZoom] = useState(1)
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

    // Gestori per il zoom interattivo - controllo libero e fluido
    const handleWheel = useCallback((e: React.WheelEvent) => {
        // Permetti zoom sempre quando c'è un'animazione zoom selezionata
        if (!selectedAnimation || selectedAnimation.type !== 'zoom') return
        if (clipTime < selectedAnimation.startTime || clipTime > selectedAnimation.endTime) return

        e.preventDefault()
        e.stopPropagation()
        const delta = e.deltaY > 0 ? -0.05 : 0.05  // Incrementi più piccoli per controllo più preciso
        const newZoom = Math.max(0.5, Math.min(10, interactiveZoom + delta))  // Zoom massimo aumentato a 10x
        setInteractiveZoom(newZoom)

        // Aggiorna l'animazione in tempo reale
        const updatedProps = {
            ...selectedAnimation.properties,
            start: {
                level: selectedAnimation.properties.level || 1.0,
                x: 0, // Posizione centrale di partenza
                y: 0
            },
            end: {
                level: newZoom,
                x: zoomPosition.x,
                y: zoomPosition.y
            }
        }
        console.log('🔍 Aggiornamento zoom:', { level: newZoom, x: zoomPosition.x, y: zoomPosition.y })
        updateAnimation(selectedAnimation.id, {
            properties: updatedProps
        })
    }, [selectedAnimation, clipTime, interactiveZoom, zoomPosition, updateAnimation])

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!selectedAnimation || selectedAnimation.type !== 'zoom') return
        if (clipTime < selectedAnimation.startTime || clipTime > selectedAnimation.endTime) return

        setIsDragging(true)
        setLastMousePos({ x: e.clientX, y: e.clientY })
        e.preventDefault()
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !selectedAnimation) return

        const deltaX = e.clientX - lastMousePos.x
        const deltaY = e.clientY - lastMousePos.y

        // Sensibilità aumentata per controllo più fluido
        const sensitivity = 1
        const newPosition = {
            x: zoomPosition.x + deltaX * sensitivity,
            y: zoomPosition.y + deltaY * sensitivity
        }

        setZoomPosition(newPosition)
        setLastMousePos({ x: e.clientX, y: e.clientY })

        // Aggiorna l'animazione in tempo reale
        const updatedProps = {
            ...selectedAnimation.properties,
            start: {
                level: selectedAnimation.properties.level || 1.0,
                x: 0, // Posizione centrale di partenza
                y: 0
            },
            end: {
                level: interactiveZoom,
                x: newPosition.x, // Mantieni i pixel per il pan interattivo
                y: newPosition.y
            }
        }
        console.log('🔍 Aggiornamento posizione:', { level: interactiveZoom, x: newPosition.x, y: newPosition.y })
        updateAnimation(selectedAnimation.id, {
            properties: updatedProps
        })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Sincronizza lo zoom interattivo con l'animazione selezionata
    useEffect(() => {
        if (selectedAnimation?.type === 'zoom') {
            // Usa i valori end se disponibili, altrimenti i valori diretti o default
            const endProps = selectedAnimation.properties.end
            const level = endProps?.level || selectedAnimation.properties.level || 1
            const x = endProps?.x || selectedAnimation.properties.x || 0
            const y = endProps?.y || selectedAnimation.properties.y || 0

            setInteractiveZoom(level)
            setZoomPosition({ x, y })
        } else {
            setInteractiveZoom(1)
            setZoomPosition({ x: 0, y: 0 })
        }
    }, [selectedAnimation])

    return (
        <>
            {children({
                interactiveZoom,
                zoomPosition,
                isDragging,
                onMouseDown: handleMouseDown,
                onMouseMove: handleMouseMove,
                onMouseUp: handleMouseUp,
                onWheel: handleWheel
            })}
        </>
    )
}
