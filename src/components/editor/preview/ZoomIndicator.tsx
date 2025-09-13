'use client'

import { Search } from 'lucide-react'
import { VideoClip, Animation } from '@/lib/store'

interface ZoomProperties {
    level?: number
    x?: number
    y?: number
    start?: {
        level?: number
        x?: number
        y?: number
    }
    end?: {
        level?: number
        x?: number
        y?: number
    }
}

interface ZoomIndicatorProps {
    activeClip: VideoClip | null
    clipTime: number
    selectedAnimation: Animation | null
    interactiveZoom: number
    zoomPosition: { x: number; y: number }
}

export function ZoomIndicator({
    activeClip,
    clipTime,
    selectedAnimation,
    interactiveZoom,
    zoomPosition
}: ZoomIndicatorProps) {
    if (!activeClip) return null

    const zoomAnimations = activeClip.animations.filter(anim => anim.type === 'zoom')
    const activeZoomAtCurrentTime = zoomAnimations.find(anim =>
        clipTime >= anim.startTime &&
        clipTime <= anim.endTime
    )

    if (!activeZoomAtCurrentTime) return null

    const isSelected = selectedAnimation?.id === activeZoomAtCurrentTime.id

    // Calcola i valori da mostrare
    let displayZoom, displayX, displayY
    if (isSelected) {
        displayZoom = interactiveZoom
        displayX = zoomPosition.x
        displayY = zoomPosition.y
    } else {
        const props = activeZoomAtCurrentTime.properties as ZoomProperties
        const startProps = props.start || {}
        const endProps = props.end || {}
        const progress = (clipTime - activeZoomAtCurrentTime.startTime) /
            (activeZoomAtCurrentTime.endTime - activeZoomAtCurrentTime.startTime)

        displayZoom = (startProps.level || 1) + ((endProps.level || startProps.level || 1) - (startProps.level || 1)) * progress
        displayX = (startProps.x || 0) + ((endProps.x || startProps.x || 0) - (startProps.x || 0)) * progress
        displayY = (startProps.y || 0) + ((endProps.y || startProps.y || 0) - (startProps.y || 0)) * progress
    }

    return (
        <div className="absolute top-4 right-4 bg-primary backdrop-blur-sm rounded-lg p-3 text-primary-foreground text-sm">
            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>{isSelected ? 'Zoom Mode Active' : 'Zoom Preview'}</span>
            </div>
            {isSelected && (
                <div className="text-xs mt-1 opacity-80">
                    Scroll to zoom • Drag to pan
                </div>
            )}
            <div className="text-xs">
                {displayZoom.toFixed(2)}x zoom
            </div>
            <div className="text-xs opacity-60">
                Position: {displayX.toFixed(0)}, {displayY.toFixed(0)}
            </div>
        </div>
    )
}
