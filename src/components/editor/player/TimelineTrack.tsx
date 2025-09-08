'use client'

import { useRef } from 'react'
import { ResizableClip } from './ResizableClip'
import { Upload, Music } from 'lucide-react'
import { AudioWaveform } from './AudioWaveform'

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
    onOpenLibrary?: () => void
    showWaveform?: boolean
    audioSrc?: string
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
    onOpenLibrary,
    showWaveform = false,
    audioSrc,
    timelineWidth = 800
}: TimelineTrackProps) {
    const timelineRef = useRef<HTMLDivElement>(null)

    const handleTimelineClick = (e: React.MouseEvent) => {
        // Controlla se il click è su un'area di controllo della clip (bordi di resize)
        const target = e.target as HTMLElement
        const isResizeHandle = target.classList.contains('resize-handle') || target.closest('.resize-handle')
        const isClipBody = target.closest('.resizable-clip') && !isResizeHandle

        if (isResizeHandle) return

        if (isClipBody) {
            e.stopPropagation()
        }

        if (!timelineRef.current) return
        const rect = timelineRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const newTime = Math.max(0, Math.min(duration, x / pixelsPerSecond))
        onTimelineClick(newTime)
    }

    return (
        <div className="flex-1 min-w-0">
            {title && (
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        {title}
                    </div>
                    {onAddClip && type === 'audio' && (
                        <button
                            onClick={onAddClip}
                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            + Add Audio
                        </button>
                    )}
                </div>
            )}

            <div
                ref={timelineRef}
                className={`${type === 'video' ? 'h-10' : 'h-10'} bg-zinc-800/50 rounded-lg border border-zinc-700/50 relative cursor-pointer overflow-x-auto overflow-y-hidden`}
                onClick={handleTimelineClick}
                style={{ minWidth: `${timelineWidth}px` }}
            >
                <div className="absolute inset-0 opacity-5">
                    {Array.from({ length: Math.max(0, Math.min(1000, Math.floor((timelineWidth || 0) / 40))) }, (_, i) => (
                        <div
                            key={i}
                            className="absolute top-0 h-full w-px bg-zinc-600"
                            style={{ left: `${i * 40}px` }}
                        />
                    ))}
                </div>

                <div
                    className="absolute top-0 h-full w-0.5 bg-blue-500 z-20 pointer-events-none"
                    style={{ left: `${currentTime * pixelsPerSecond}px` }}
                >
                    {type === 'video' && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 clip-path-triangle"></div>
                    )}
                </div>

                {clips.map(clip => (
                    <ResizableClip
                        key={clip.id}
                        clip={clip}
                        pixelsPerSecond={pixelsPerSecond}
                        onUpdate={(updates) => onClipUpdate(clip.id, updates)}
                        isSelected={selectedClip === clip.id}
                        onSelect={() => onClipSelect(clip.id)}
                        type={type}
                        allClips={clips}
                        onMoveAdjacentClip={(clipId, newStartTime, newEndTime) => {
                            // Trova la clip corrente per confrontare i valori
                            const currentClip = clips.find(c => c.id === clipId)
                            if (currentClip) {
                                const updates: any = {}

                                // Aggiorna solo se i valori sono effettivamente cambiati
                                if (Math.abs(currentClip.startTime - newStartTime) > 0.01) {
                                    updates.startTime = newStartTime
                                }
                                if (Math.abs(currentClip.endTime - newEndTime) > 0.01) {
                                    updates.endTime = newEndTime
                                }

                                // Aggiorna solo se ci sono cambiamenti significativi
                                if (Object.keys(updates).length > 0) {
                                    onClipUpdate(clipId, updates)
                                }
                            }
                        }}
                    />
                ))}

                {showWaveform && type === 'audio' && clips.length > 0 && audioSrc && (
                    <AudioWaveform
                        audioSrc={audioSrc}
                        currentTime={currentTime}
                        duration={duration}
                        timelineWidth={timelineWidth}
                        height={24}
                    />
                )}

                {clips.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {type === 'audio' ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onAddClip}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-transparent hover:bg-zinc-600 border border-zinc-600 hover:border-zinc-500 rounded-md transition-all duration-200 text-xs text-zinc-300 hover:text-white"
                                >
                                    <Upload className="h-3 w-3" />
                                    Import Audio
                                </button>
                                <button
                                    onClick={onOpenLibrary}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-transparent hover:bg-zinc-600 border border-zinc-600 hover:border-zinc-500 rounded-md transition-all duration-200 text-xs text-zinc-300 hover:text-white"
                                >
                                    <Music className="h-3 w-3" />
                                    Library
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onAddClip}
                                className="flex items-center gap-2 px-3 py-1.5 bg-transparent hover:bg-zinc-600 border border-zinc-600 hover:border-zinc-500 rounded-md transition-all duration-200 text-xs text-zinc-300 hover:text-white"
                            >
                                <Upload className="h-3 w-3" />
                                Add Video Clip
                            </button>
                        )}
                    </div>
                )}

                {/* {type === 'video' && clips.length > 0 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <button
                            onClick={onAddClip}
                            className="flex items-center gap-1 px-2 py-1 bg-zinc-700/80 hover:bg-zinc-600 border border-zinc-600 hover:border-zinc-500 rounded text-xs text-zinc-300 hover:text-white transition-all duration-200"
                            title="Add another video clip"
                        >
                            <Upload className="h-3 w-3" />
                            +
                        </button>
                    </div>
                )} */}
            </div>
        </div>
    )
}
