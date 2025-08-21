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
        setSelectedPanel,
        addAnimation
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

    const handleAddVideoClip = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'video/*'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                // Crea un elemento video temporaneo per ottenere la durata
                const video = document.createElement('video')
                video.src = URL.createObjectURL(file)
                video.onloadedmetadata = () => {
                    const clipDuration = video.duration
                    const currentClips = currentProject?.animations.filter(a => a.type === 'clip') || []
                    const totalClipDuration = currentClips.reduce((acc, clip) => acc + (clip.endTime - clip.startTime), 0)

                    // Aggiungi la clip come animazione nella timeline
                    addAnimation({
                        type: 'clip',
                        startTime: totalClipDuration,
                        endTime: totalClipDuration + clipDuration,
                        properties: {
                            file,
                            url: URL.createObjectURL(file),
                            name: file.name,
                            duration: clipDuration
                        }
                    })

                    // Aggiorna la durata totale del progetto se necessario
                    const newTotalDuration = totalClipDuration + clipDuration
                    if (newTotalDuration > (currentProject?.duration || 0)) {
                        updateProject({
                            duration: newTotalDuration
                        })
                    }
                }
            }
        }
        input.click()
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-32">
            <div className="flex items-center space-x-6 h-full">
                {/* Play Button come in foto 2 - più grande e stile diverso */}
                <button
                    onClick={handlePlayPause}
                    className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 flex items-center justify-center flex-shrink-0 transition-colors"
                >
                    {isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                    ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                    )}
                </button>

                <div className="flex-1 space-y-4">
                    {/* Video Track con clip multiple come in foto 2 */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 flex-1">
                            {/* Video nascosto per controllo */}
                            {videoSrc && (
                                <video
                                    ref={videoRef}
                                    src={videoSrc}
                                    className="hidden"
                                    onTimeUpdate={handleTimeUpdate}
                                    muted={!!audioSrc}
                                />
                            )}

                            {/* Container per le clip video */}
                            <div className="flex items-center space-x-2">
                                {/* Clip video esistenti dalla timeline */}
                                {currentProject?.animations && currentProject.animations.filter(a => a.type === 'clip').length > 0 && (
                                    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-2 flex items-center space-x-1">
                                        {/* Thumbnails delle clip reali */}
                                        {currentProject.animations
                                            .filter(a => a.type === 'clip')
                                            .map((clip, index) => (
                                                <div
                                                    key={clip.id}
                                                    className="w-16 h-10 rounded border border-zinc-600 flex items-center justify-center relative overflow-hidden"
                                                    style={{
                                                        background: `linear-gradient(45deg, hsl(${index * 60 + 200}, 70%, 50%), hsl(${(index + 1) * 60 + 200}, 70%, 60%))`
                                                    }}
                                                    title={clip.properties.name}
                                                >
                                                    <div className="w-2 h-2 bg-white rounded-full opacity-80" />
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}

                                {/* Fallback per video legacy */}
                                {videoSrc && currentProject?.animations && currentProject.animations.filter(a => a.type === 'clip').length === 0 && (
                                    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-2 flex items-center space-x-1">
                                        <div className="w-16 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded border border-zinc-600 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full opacity-80" />
                                        </div>
                                    </div>
                                )}

                                {/* Bottone + per aggiungere clip */}
                                <button
                                    onClick={handleAddVideoClip}
                                    className="w-16 h-10 bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 rounded flex items-center justify-center transition-colors"
                                >
                                    <span className="text-zinc-300 text-xl font-light">+</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Audio Track con waveform come in foto 2 */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-zinc-800 rounded-lg border border-zinc-700 h-12 flex items-center px-3">
                            {audioSrc ? (
                                <>
                                    <audio ref={audioRef} src={audioSrc} />
                                    <div className="flex items-center space-x-3 flex-1">
                                        <span className="text-sm text-green-400 flex-shrink-0 font-medium">
                                            {currentProject?.musicSettings?.type === 'custom' ? 'drugo.mp3' : 'Library Track'}
                                        </span>
                                        {/* Waveform più grande */}
                                        <div className="flex-1 flex items-center justify-center h-6">
                                            <svg className="w-full h-full" viewBox="0 0 200 24">
                                                {Array.from({ length: 100 }, (_, i) => {
                                                    const height = Math.abs(Math.sin(i * 0.1)) * 18 + 2
                                                    const progress = currentProject?.duration ? (currentTime / currentProject.duration) * 100 : 0
                                                    const isActive = i < progress
                                                    return (
                                                        <rect
                                                            key={i}
                                                            x={i * 2}
                                                            y={(24 - height) / 2}
                                                            width="1.5"
                                                            height={height}
                                                            fill={isActive ? "#10b981" : "#374151"}
                                                            rx="0.5"
                                                        />
                                                    )
                                                })}
                                            </svg>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center space-x-4 flex-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleAudioImport}
                                        className="text-sm px-4 py-2 h-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                    >
                                        Import Audio
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleOpenLibrary}
                                        className="text-sm px-4 py-2 h-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                    >
                                        Library
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Timeline info più grande */}
                <div className="text-sm text-zinc-400 flex-shrink-0 font-mono">
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / {Math.floor((currentProject?.duration || 0) / 60)}:{((currentProject?.duration || 0) % 60).toFixed(0).padStart(2, '0')}
                </div>
            </div>
        </div>
    )
}
