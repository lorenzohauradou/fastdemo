'use client'

import { useRef } from 'react'
import { ResizableClip } from './ResizableClip'

interface TimelineTrackProps {
    title: string
    type: 'video' | 'audio'
    clips: any[]
    currentTime: number
    duration: number
    pixelsPerSecond: number
    selectedClip: string | null
    onClipUpdate: (clipId: string, updates: any) => void
    onClipSelect: (clipId: string) => void
    onTimelineClick: (time: number) => void
    onAddClip?: () => void
    showWaveform?: boolean
    timelineWidth?: number
}

export function TimelineTrack({
    title,
    type,
    clips,
    currentTime,
    duration,
    pixelsPerSecond,
    selectedClip,
    onClipUpdate,
    onClipSelect,
    onTimelineClick,
    onAddClip,
    showWaveform = false,
    timelineWidth = 800
}: TimelineTrackProps) {
    const timelineRef = useRef<HTMLDivElement>(null)

    const handleTimelineClick = (e: React.MouseEvent) => {
        // Controlla se il click è su un'area di controllo della clip (bordi di resize)
        const target = e.target as HTMLElement
        const isResizeHandle = target.classList.contains('resize-handle') || target.closest('.resize-handle')
        const isClipBody = target.closest('.resizable-clip') && !isResizeHandle

        // Se è su un resize handle, lascia che la clip lo gestisca
        if (isResizeHandle) return

        // Se è sul corpo della clip, priorità alla timeline (movimento barra)
        if (isClipBody) {
            e.stopPropagation()
        }

        if (!timelineRef.current) return
        const rect = timelineRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const newTime = Math.max(0, Math.min(duration, x / pixelsPerSecond))
        console.log('🎯 TimelineTrack INFERIORE click:', newTime, 'x:', x, 'pixelsPerSecond:', pixelsPerSecond)
        onTimelineClick(newTime)
    }

    return (
        <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                    {title}
                </div>
                {onAddClip && (
                    <button
                        onClick={onAddClip}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        + Add {type === 'video' ? 'Clip' : 'Audio'}
                    </button>
                )}
            </div>

            {/* Timeline della traccia */}
            <div
                ref={timelineRef}
                className="h-10 bg-zinc-800 rounded border border-zinc-700 relative cursor-pointer overflow-hidden"
                onClick={handleTimelineClick}
            >
                {/* Griglia di sfondo */}
                <div className="absolute inset-0 opacity-5">
                    {Array.from({ length: Math.floor(timelineWidth / 40) }, (_, i) => (
                        <div
                            key={i}
                            className="absolute top-0 h-full w-px bg-zinc-600"
                            style={{ left: `${i * 40}px` }}
                        />
                    ))}
                </div>

                {/* Playhead */}
                <div
                    className="absolute top-0 h-full w-0.5 bg-red-500 z-20 pointer-events-none"
                    style={{ left: `${currentTime * pixelsPerSecond}px` }}
                >
                    {type === 'video' && (
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                </div>

                {/* Clip */}
                {clips.map(clip => (
                    <ResizableClip
                        key={clip.id}
                        clip={clip}
                        pixelsPerSecond={pixelsPerSecond}
                        onUpdate={(updates) => {
                            console.log('📡 TimelineTrack - onUpdate ricevuto:', { clipId: clip.id, updates })
                            onClipUpdate(clip.id, updates)
                        }}
                        isSelected={selectedClip === clip.id}
                        onSelect={() => onClipSelect(clip.id)}
                        type={type}
                    />
                ))}

                {/* Waveform per l'audio */}
                {showWaveform && type === 'audio' && clips.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-1">
                        <svg className="w-full h-6" viewBox={`0 0 ${timelineWidth} 24`}>
                            {Array.from({ length: Math.floor(timelineWidth / 4) }, (_, i) => {
                                const height = Math.abs(Math.sin(i * 0.15)) * 18 + 2
                                const progress = (currentTime / duration) * timelineWidth
                                const isActive = i * 4 < progress
                                return (
                                    <rect
                                        key={i}
                                        x={i * 4}
                                        y={(24 - height) / 2}
                                        width="2"
                                        height={height}
                                        fill={isActive ? "#10b981" : "#4b5563"}
                                        rx="1"
                                        opacity="0.6"
                                    />
                                )
                            })}
                        </svg>
                    </div>
                )}

                {/* Placeholder quando non ci sono clip */}
                {clips.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-zinc-500">
                            {type === 'video'
                                ? 'Drop video files here or click + Add Clip'
                                : 'Drop audio files here or click + Add Audio'
                            }
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
