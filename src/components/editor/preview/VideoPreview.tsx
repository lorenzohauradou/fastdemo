'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditorStore } from '@/lib/store'
import { VideoUpload } from '@/components/editor/upload/VideoUpload'
import { BackgroundRenderer } from './BackgroundRenderer'
import { VideoPlayer } from './VideoPlayer'
import { ZoomController } from './ZoomController'
import { ZoomIndicator } from './ZoomIndicator'
import { LogoOverlay } from './LogoOverlay'
import { RenderProgressOverlay } from './RenderProgressOverlay'
import { useCameraAnimations } from '@/hooks/useCameraAnimations'

export function VideoPreview() {
    const containerRef = useRef<HTMLDivElement>(null)

    const {
        currentProject,
        isPlaying,
        zoom,
        selectedAnimation,
        updateAnimation,
        getActiveClip,
        getCurrentClipTime,
        updateProject
    } = useEditorStore()

    // Hook per gestire le animazioni camera
    const { getCurrentVariant, getTransition } = useCameraAnimations(currentProject)

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

    const textTransition = { delay: 0.1, type: 'spring' as const, stiffness: 300, damping: 30 }

    // Gestisce l'evento wheel con passive: false per evitare errori console
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const wheelHandler = (e: WheelEvent) => {
            // Il wheel handler sarà gestito dal ZoomController
        }

        container.addEventListener('wheel', wheelHandler, { passive: false })
        return () => container.removeEventListener('wheel', wheelHandler)
    }, [])

    // Handler per aggiornamenti del progetto dal VideoPlayer
    const handleVideoLoadedMetadata = () => {
        if (currentProject) {
            // Aggiorna il progetto se necessario
            // La logica specifica è gestita nel VideoPlayer
        }
    }

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
        >
            {({ interactiveZoom, zoomPosition, isDragging, onMouseDown, onMouseMove, onMouseUp, onWheel }) => (
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
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseUp}
                        onWheel={onWheel}
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
                                        activeTextAnimation.properties.position === 'top' ? 'top-8 left-0 right-0 h-auto' :
                                            activeTextAnimation.properties.position === 'bottom' ? 'bottom-18 left-0 right-0 h-auto' :
                                                activeTextAnimation.properties.position === 'left' ? 'left-8 top-0 bottom-0 w-auto flex-col' :
                                                    activeTextAnimation.properties.position === 'right' ? 'right-8 top-0 bottom-0 w-auto flex-col' :
                                                        'top-8 left-0 right-0 h-auto' // Default: top center come fallback
                                        }`}
                                    variants={getTextVariants(activeTextAnimation.properties.position || 'top')}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    transition={textTransition}
                                >
                                    <div className="text-center px-4">
                                        <h1
                                            className="text-white font-bold leading-tight"
                                            style={{
                                                fontSize: `${activeTextAnimation.properties.fontSize || 48}px`,
                                                fontWeight: activeTextAnimation.properties.fontWeight || 'bold',
                                                fontFamily: activeTextAnimation.properties.fontFamily || 'Inter',
                                                color: activeTextAnimation.properties.color || '#ffffff',
                                                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                            }}
                                        >
                                            {activeTextAnimation.properties.content}
                                        </h1>
                                        {activeTextAnimation.properties.subtitle && (
                                            <p
                                                className="text-white/80 mt-2"
                                                style={{
                                                    fontSize: `${(activeTextAnimation.properties.fontSize || 48) * 0.6}px`,
                                                }}
                                            >
                                                {activeTextAnimation.properties.subtitle}
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

                        <LogoOverlay
                            activeClip={activeClip}
                            clipTime={clipTime}
                        />

                        <RenderProgressOverlay />
                    </div>
                </BackgroundRenderer>
            )}
        </ZoomController>
    )
}
