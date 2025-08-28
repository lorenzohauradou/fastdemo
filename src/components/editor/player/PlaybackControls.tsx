'use client'

import { Play, Pause } from 'lucide-react'

interface PlaybackControlsProps {
    isPlaying: boolean
    currentTime: number
    duration: number
    onPlayPause: () => void
}

export function PlaybackControls({
    isPlaying,
    currentTime,
    duration,
    onPlayPause
}: PlaybackControlsProps) {
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = (time % 60).toFixed(0).padStart(2, '0')
        return `${minutes}:${seconds}`
    }

    return (
        <div className="flex flex-col items-center justify-center px-4 space-y-2 ">
            <button
                onClick={onPlayPause}
                className="w-18 h-18 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 flex items-center justify-center transition-all duration-200 shadow-lg"
            >
                {isPlaying ? (
                    <Pause className="w-10 h-10 text-white" />
                ) : (
                    <Play className="w-10 h-10 text-white ml-0.5" />
                )}
            </button>
            <div className="text-xs text-zinc-300 font-mono font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
            </div>
        </div>
    )
}
