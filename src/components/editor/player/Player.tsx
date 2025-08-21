'use client'

import { useRef, useEffect } from 'react'
import { useEditorStore } from '@/lib/store'
import { Play, Pause, Upload, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Player() {
    const {
        currentProject,
        currentTime,
        isPlaying,
        setCurrentTime,
        setIsPlaying,
        updateProject,
        setSelectedPanel
    } = useEditorStore()

    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    // Sincronizza il video con il tempo corrente
    useEffect(() => {
        if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
            videoRef.current.currentTime = currentTime
        }
        if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.1) {
            audioRef.current.currentTime = currentTime
        }
    }, [currentTime])

    // Gestisce play/pause e volume
    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.play().catch(console.error)
            } else {
                videoRef.current.pause()
            }
        }
        if (audioRef.current && currentProject?.musicSettings?.track) {
            audioRef.current.volume = currentProject?.musicSettings?.volume || 0.5
            if (isPlaying) {
                audioRef.current.play().catch(console.error)
            } else {
                audioRef.current.pause()
            }
        }
    }, [isPlaying, currentProject?.musicSettings?.track, currentProject?.musicSettings?.volume])

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying)
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
        }
    }

    const handleAudioImport = async () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'audio/*'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                const audioUrl = URL.createObjectURL(file)
                updateProject({
                    musicSettings: {
                        type: 'custom',
                        track: audioUrl,
                        volume: 0.5
                    }
                })
            }
        }
        input.click()
    }

    const handleOpenLibrary = () => {
        setSelectedPanel('music')
    }

    const videoSrc = currentProject?.videoUrl || (currentProject?.videoFile ? URL.createObjectURL(currentProject.videoFile) : '')
    const audioSrc = currentProject?.musicSettings?.track || ''

    return (
        <div className="flex items-center space-x-4 px-4 py-2">
            {/* Play Button Grande */}
            <Button
                onClick={handlePlayPause}
                size="lg"
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center flex-shrink-0"
            >
                {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                ) : (
                    <Play className="w-6 h-6 text-white ml-0.5" />
                )}
            </Button>

            <div className="flex-1 space-y-2">
                {/* Video Track */}
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400 w-12 flex-shrink-0">VIDEO</span>
                    <div className="flex-1 bg-black rounded overflow-hidden h-8 flex items-center relative">
                        {videoSrc ? (
                            <>
                                {/* Video nascosto per il controllo del tempo */}
                                <video
                                    ref={videoRef}
                                    src={videoSrc}
                                    className="hidden"
                                    onTimeUpdate={handleTimeUpdate}
                                    muted={!!audioSrc}
                                />
                                {/* Rappresentazione visiva della traccia video */}
                                <div className="w-full h-full bg-gray-800 flex items-center overflow-hidden">
                                    <div className="text-xs text-gray-400 px-2 flex-shrink-0">Traccia Video</div>
                                    <div className="flex-1 h-full flex items-center">
                                        {/* Simulazione thumbnails lungo la traccia */}
                                        <div className="flex h-full w-full">
                                            {Array.from({ length: 20 }, (_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 h-full border-r border-gray-700 bg-gray-600"
                                                    style={{
                                                        background: `linear-gradient(45deg, #4a5568 ${i * 5}%, #2d3748 ${(i + 1) * 5}%)`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {/* Indicatore di progresso */}
                                    <div
                                        className="absolute top-0 left-0 h-full bg-blue-500 opacity-30 transition-all duration-100"
                                        style={{
                                            width: currentProject?.duration ? `${(currentTime / currentProject.duration) * 100}%` : '0%',
                                            marginLeft: '80px' // Offset per il testo "Traccia Video"
                                        }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No video</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Audio Track */}
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400 w-12 flex-shrink-0">AUDIO</span>
                    <div className="flex-1 bg-gray-800 rounded h-8 flex items-center">
                        {audioSrc ? (
                            <>
                                <audio
                                    ref={audioRef}
                                    src={audioSrc}
                                />
                                <div className="flex items-center space-x-2 flex-1 px-2">
                                    <div className="text-xs text-green-400 flex-shrink-0">
                                        {currentProject?.musicSettings?.type === 'custom' ? 'Custom Audio' : 'Library Track'}
                                    </div>
                                    <div className="flex-1 h-1 bg-gray-700 rounded overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all duration-100"
                                            style={{
                                                width: currentProject?.duration ? `${(currentTime / currentProject.duration) * 100}%` : '0%'
                                            }}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAudioImport}
                                    className="text-xs px-3 py-1 h-6 flex items-center space-x-1"
                                >
                                    <Upload className="w-3 h-3" />
                                    <span>Import Audio</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleOpenLibrary}
                                    className="text-xs px-3 py-1 h-6 flex items-center space-x-1"
                                >
                                    <Music className="w-3 h-3" />
                                    <span>Library</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline Info */}
            <div className="flex items-center space-x-2 text-xs text-gray-400 flex-shrink-0">
                <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</span>
                <span>/</span>
                <span>{Math.floor((currentProject?.duration || 0) / 60)}:{((currentProject?.duration || 0) % 60).toFixed(0).padStart(2, '0')}</span>
            </div>
        </div>
    )
}
