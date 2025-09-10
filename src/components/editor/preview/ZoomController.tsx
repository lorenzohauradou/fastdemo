'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Animation } from '@/lib/store'

interface ZoomControllerProps {
    selectedAnimation: Animation | null
    clipTime: number
    updateAnimation: (id: string, updates: Partial<Animation>) => void
    hasBackground?: boolean
    children: (props: {
        interactiveZoom: number
        zoomPosition: { x: number; y: number }
        isDragging: boolean
    }) => React.ReactNode
}

export function ZoomController({
    selectedAnimation,
    clipTime,
    updateAnimation,
    hasBackground,
    children
}: ZoomControllerProps) {
    // Stato per zoom interattivo
    const [interactiveZoom, setInteractiveZoom] = useState(1)
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

    const containerRef = useRef<HTMLDivElement>(null);

    // Gestori per zoom interattivo
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!selectedAnimation || selectedAnimation.type !== 'zoom') return
        if (clipTime < selectedAnimation.startTime || clipTime > selectedAnimation.endTime) return

        e.preventDefault()
        e.stopPropagation()
        const delta = e.deltaY > 0 ? -0.05 : 0.05
        const newZoom = Math.max(0.5, Math.min(10, interactiveZoom + delta))
        setInteractiveZoom(newZoom)

        const updatedProps = {
            ...selectedAnimation.properties,
            start: {
                level: selectedAnimation.properties.level || 1.0,
                x: 0,
                y: 0
            },
            end: {
                level: newZoom,
                x: zoomPosition.x,
                y: zoomPosition.y
            }
        }
        updateAnimation(selectedAnimation.id, {
            properties: updatedProps
        })
    }, [selectedAnimation, clipTime, interactiveZoom, zoomPosition, updateAnimation])

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedAnimation || selectedAnimation.type !== 'zoom') return
        if (clipTime < selectedAnimation.startTime || clipTime > selectedAnimation.endTime) return

        setIsDragging(true)
        setLastMousePos({ x: e.clientX, y: e.clientY })
        e.preventDefault()
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !selectedAnimation || !containerRef.current) return;

        e.stopPropagation();

        const containerRect = containerRef.current.getBoundingClientRect();
        const videoNativeWidth = 1920;

        // Fattore scala 0.8 perche se hasBg gia scala di 0.8
        const videoScaleFactor = hasBackground ? 0.8 : 1.0;
        const effectiveContainerWidth = containerRect.width * videoScaleFactor;

        // rapporto di scala basandosi sulla larghezza effettiva
        const scaleRatio = videoNativeWidth / effectiveContainerWidth;

        const deltaX = (e.clientX - lastMousePos.x) * scaleRatio;
        const deltaY = (e.clientY - lastMousePos.y) * scaleRatio;

        const newPosition = {
            x: zoomPosition.x + deltaX,
            y: zoomPosition.y + deltaY
        }

        setZoomPosition(newPosition)
        setLastMousePos({ x: e.clientX, y: e.clientY })

        const updatedProps = {
            ...selectedAnimation.properties,
            start: {
                level: selectedAnimation.properties.level || 1.0,
                x: 0,
                y: 0
            },
            end: {
                level: interactiveZoom,
                x: newPosition.x,
                y: newPosition.y
            }
        }
        updateAnimation(selectedAnimation.id, {
            properties: updatedProps
        })
    }

    const handleMouseUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDragging(false)
    }

    const handleMouseLeave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDragging) {
            setIsDragging(false);
        }
    }

    useEffect(() => {
        if (selectedAnimation?.type === 'zoom') {
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
        <div
            ref={containerRef}
            className="w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
        >
            {children({
                interactiveZoom,
                zoomPosition,
                isDragging,
            })}
        </div>
    )
}

