'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditorStore } from '@/lib/store'
import { VideoUpload } from '@/components/editor/upload/VideoUpload'
import { BackgroundRenderer } from './BackgroundRenderer'
import { VideoPlayer } from './VideoPlayer'
import { ZoomController } from './ZoomController'
import { ZoomIndicator } from './ZoomIndicator'
import { RenderProgressOverlay } from './RenderProgressOverlay'
import { useCameraAnimations } from '@/hooks/useCameraAnimations'

interface TextProperties {
    content?: string
    subtitle?: string
    position?: string
    fontSize?: number
    fontWeight?: string
    fontFamily?: string
    color?: string
}

interface VoiceoverProperties {
    audioUrl?: string
}

export function VideoPreview() {
    const containerRef = useRef<HTMLDivElement>(null)
    const voiceoverAudioRef = useRef<HTMLAudioElement>(null)
    const voiceoverStartedRef = useRef<string | null>(null)

    const {
        currentProject,
        isPlaying,
        zoom,
        selectedAnimation,
        updateAnimation,
        getActiveClip,
        getCurrentClipTime,
    } = useEditorStore()

    // Hook per gestire le animazioni camera
    const { getCurrentVariant, getTransition } = useCameraAnimations(currentProject, isPlaying)

    // Ottieni la clip attiva e il suo video
    const activeClip = getActiveClip()
    const clipTime = getCurrentClipTime()
    const videoSrc = activeClip?.videoUrl || (activeClip?.videoFile ? URL.createObjectURL(activeClip.videoFile) : '')

    // Trova se c'è un'animazione di testo attiva nella clip corrente
    const activeTextAnimation = activeClip?.animations.find(anim =>
        anim.type === 'text' &&
        clipTime >= anim.startTime &&
        clipTime <= anim.endTime
    )

    // Trova se c'è un'animazione voiceover attiva nella clip corrente
    // IMPORTANTE: Non controlliamo endTime perché il voiceover deve suonare per tutta la sua durata naturale
    const activeVoiceoverAnimation = activeClip?.animations.find(anim =>
        anim.type === 'voiceover' &&
        clipTime >= anim.startTime
    )

    // Definisci le varianti per il TESTO basate sulla posizione
    const getTextVariants = (position: string) => {
        switch (position) {
            case 'top':
                return {
                    hidden: { opacity: 0, y: -50 },
                    visible: { opacity: 1, y: 0 }
                };
            case 'bottom':
                return {
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 }
                };
            case 'left':
                return {
                    hidden: { opacity: 0, x: -100 },
                    visible: { opacity: 1, x: 0 }
                };
            case 'right':
                return {
                    hidden: { opacity: 0, x: 100 },
                    visible: { opacity: 1, x: 0 }
                };
            default:
                // top fallback
                return {
                    hidden: { opacity: 0, y: -50 },
                    visible: { opacity: 1, y: 0 }
                };
        }
    }

    const textTransition = { type: 'spring' as const, stiffness: 300, damping: 30, duration: 0.67 }

    // Gestisce l'evento wheel con passive: false per evitare errori console
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const wheelHandler = (e: WheelEvent) => {
        }

        container.addEventListener('wheel', wheelHandler, { passive: false })
        return () => container.removeEventListener('wheel', wheelHandler)
    }, [])

    // Handler per aggiornamenti del progetto dal VideoPlayer
    const handleVideoLoadedMetadata = () => {
        if (currentProject) {
            // Aggiorna il progetto se necessario
        }
    }

    // Audio del voiceover
    useEffect(() => {
        const voiceoverAudio = voiceoverAudioRef.current
        if (!voiceoverAudio) return

        if (activeVoiceoverAnimation && isPlaying) {
            const audioUrl = (activeVoiceoverAnimation.properties as VoiceoverProperties).audioUrl
            if (!audioUrl) return

            const voiceoverRelativeTime = clipTime - activeVoiceoverAnimation.startTime
            const animationKey = `${activeVoiceoverAnimation.id}_${activeVoiceoverAnimation.startTime}`

            // Avvia l'audio solo una volta quando entriamo nel range
            if (voiceoverRelativeTime >= 0 && voiceoverStartedRef.current !== animationKey) {
                voiceoverAudio.src = audioUrl
                voiceoverAudio.currentTime = Math.max(0, voiceoverRelativeTime)
                voiceoverAudio.play().catch(console.warn)
                voiceoverStartedRef.current = animationKey

                // Gestisci la fine naturale dell'audio
                voiceoverAudio.onended = () => {
                    voiceoverStartedRef.current = null
                }
            }
        } else if (!isPlaying) {
            // Pausa solo quando l'utente ferma la riproduzione
            if (!voiceoverAudio.paused) {
                voiceoverAudio.pause()
            }
            voiceoverStartedRef.current = null
        }
    }, [activeVoiceoverAnimation?.id, isPlaying, clipTime])

    // Sincronizza la webcam quando cambia lo stato di riproduzione
    useEffect(() => {
        const webcamVideo = document.querySelector('video[data-webcam]') as HTMLVideoElement
        const mainVideo = document.querySelector('video[data-main-video]') as HTMLVideoElement

        if (webcamVideo && mainVideo) {
            if (isPlaying) {
                webcamVideo.currentTime = mainVideo.currentTime
                webcamVideo.play().catch(console.warn)
            } else {
                webcamVideo.pause()
            }
        }
    }, [isPlaying, clipTime])

    if (!videoSrc) {
        return (
            <div className="flex items-center justify-center w-full h-full p-8">
                <div className="max-w-md w-full">
                    <VideoUpload className="w-full" />
                </div>
            </div>
        )
    }
    const hasBackground = () => {
        if (!currentProject?.backgroundSettings) return false
        const bg = currentProject.backgroundSettings
        return bg.type !== 'none' && bg.type !== undefined
    }

    return (
        <ZoomController
            selectedAnimation={selectedAnimation}
            clipTime={clipTime}
            updateAnimation={updateAnimation}
            hasBackground={hasBackground()}
        >
            {({ interactiveZoom, zoomPosition, isDragging }) => (
                <BackgroundRenderer
                    backgroundSettings={currentProject?.backgroundSettings}
                    className="relative"
                >
                    <div
                        ref={containerRef}
                        className="relative w-full h-full flex items-center justify-center overflow-hidden"
                        style={{
                            perspective: '3000px',
                            perspectiveOrigin: '40% center'
                        }}
                    >
                        {/* Contenitore del Video animato con Framer Motion */}
                        <motion.div
                            className="w-full h-full flex items-center justify-center"
                            animate={getCurrentVariant(activeTextAnimation)}
                            transition={getTransition()}
                            style={{
                                transformStyle: 'preserve-3d',
                                transformOrigin: 'center center'
                            }}
                        >
                            <VideoPlayer
                                activeClip={activeClip}
                                clipTime={clipTime}
                                isPlaying={isPlaying}
                                currentProject={currentProject}
                                zoom={zoom}
                                selectedAnimation={selectedAnimation}
                                interactiveZoom={interactiveZoom}
                                zoomPosition={zoomPosition}
                                isDragging={isDragging}
                                hasBackground={hasBackground()}
                                onLoadedMetadata={handleVideoLoadedMetadata}
                            />

                            {/* Webcam overlay */}
                            {activeClip?.hasWebcam && activeClip?.webcamUrl && (
                                <div className="absolute bottom-8 right-8 w-32 h-32 rounded-full overflow-hidden shadow-lg">
                                    <video
                                        ref={(video) => {
                                            if (video) {
                                                // Sincronizza automaticamente con il video principale
                                                const mainVideo = document.querySelector('video[data-main-video]') as HTMLVideoElement
                                                if (mainVideo) {
                                                    video.currentTime = mainVideo.currentTime
                                                    if (isPlaying && mainVideo.paused === false) {
                                                        video.play().catch(console.warn)
                                                    } else {
                                                        video.pause()
                                                    }
                                                }
                                            }
                                        }}
                                        src={activeClip.webcamUrl}
                                        className="w-full h-full object-cover"
                                        muted
                                        playsInline
                                        autoPlay={isPlaying}
                                        style={{
                                            transform: 'scaleX(-1)' // Mirror effect per webcam
                                        }}
                                        onLoadedData={(e) => {
                                            const video = e.target as HTMLVideoElement
                                            const mainVideo = document.querySelector('video[data-main-video]') as HTMLVideoElement
                                            if (mainVideo) { video.currentTime = mainVideo.currentTime }
                                        }}
                                        onTimeUpdate={(e) => {
                                            // Sincronizza con il video principale solo se necessario
                                            const video = e.target as HTMLVideoElement
                                            const mainVideo = document.querySelector('video[data-main-video]') as HTMLVideoElement
                                            if (mainVideo && Math.abs(video.currentTime - mainVideo.currentTime) > 0.2) {
                                                video.currentTime = mainVideo.currentTime
                                            }
                                        }}
                                        data-webcam
                                    />
                                </div>
                            )}
                            <ZoomIndicator
                                activeClip={activeClip}
                                clipTime={clipTime}
                                selectedAnimation={selectedAnimation}
                                interactiveZoom={interactiveZoom}
                                zoomPosition={zoomPosition}
                            />
                        </motion.div>

                        {/* Contenitore del Testo animato con Framer Motion */}
                        <AnimatePresence>
                            {activeTextAnimation && (
                                <motion.div
                                    className={`absolute flex items-center justify-center pointer-events-none ${
                                        // Posizionamento basato sulla proprietà position - usa 'top' come default
                                        (activeTextAnimation.properties as TextProperties).position === 'top' ? 'top-8 left-0 right-0 h-auto' :
                                            (activeTextAnimation.properties as TextProperties).position === 'bottom' ? 'bottom-18 left-0 right-0 h-auto' :
                                                (activeTextAnimation.properties as TextProperties).position === 'left' ? 'left-8 top-0 bottom-0 w-auto flex-col' :
                                                    (activeTextAnimation.properties as TextProperties).position === 'right' ? 'right-8 top-0 bottom-0 w-auto flex-col' :
                                                        'top-8 left-0 right-0 h-auto' // Default: top center come fallback
                                        }`}
                                    variants={getTextVariants((activeTextAnimation.properties as TextProperties).position || 'top')}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    transition={textTransition}
                                >
                                    <div className="text-center px-4">
                                        <h1
                                            className="text-white font-bold leading-tight"
                                            style={{
                                                fontSize: `${(activeTextAnimation.properties as TextProperties).fontSize || 48}px`,
                                                fontWeight: (activeTextAnimation.properties as TextProperties).fontWeight || 'bold',
                                                fontFamily: (activeTextAnimation.properties as TextProperties).fontFamily || 'Inter',
                                                color: (activeTextAnimation.properties as TextProperties).color || '#ffffff',
                                                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                            }}
                                        >
                                            {(activeTextAnimation.properties as TextProperties).content}
                                        </h1>
                                        {(activeTextAnimation.properties as TextProperties).subtitle && (
                                            <p
                                                className="text-white/80 mt-2"
                                                style={{
                                                    fontSize: `${((activeTextAnimation.properties as TextProperties).fontSize || 48) * 0.6}px`,
                                                }}
                                            >
                                                {(activeTextAnimation.properties as TextProperties).subtitle}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {selectedAnimation?.type === 'text' && activeTextAnimation?.id === selectedAnimation.id && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black rounded-lg p-3">
                                <button
                                    className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                                    onClick={() => {
                                        updateAnimation(selectedAnimation.id, {
                                            properties: {
                                                ...selectedAnimation.properties,
                                                position: 'top'
                                            }
                                        })
                                    }}
                                    title="Top Center"
                                >
                                    ↑
                                </button>
                                <button
                                    className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                                    onClick={() => {
                                        updateAnimation(selectedAnimation.id, {
                                            properties: {
                                                ...selectedAnimation.properties,
                                                position: 'bottom'
                                            }
                                        })
                                    }}
                                    title="Bottom Center"
                                >
                                    ↓
                                </button>
                                <button
                                    className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                                    onClick={() => {
                                        updateAnimation(selectedAnimation.id, {
                                            properties: {
                                                ...selectedAnimation.properties,
                                                position: 'left'
                                            }
                                        })
                                    }}
                                    title="Left Center"
                                >
                                    ←
                                </button>
                                <button
                                    className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                                    onClick={() => {
                                        updateAnimation(selectedAnimation.id, {
                                            properties: {
                                                ...selectedAnimation.properties,
                                                position: 'right'
                                            }
                                        })
                                    }}
                                    title="Right Center"
                                >
                                    →
                                </button>
                            </div>
                        )}

                        <RenderProgressOverlay />
                    </div>

                    {/* Audio element per il voiceover (nascosto) */}
                    <audio
                        ref={voiceoverAudioRef}
                        className="hidden"
                        preload="auto"
                    />
                </BackgroundRenderer>
            )}
        </ZoomController>
    )
}
