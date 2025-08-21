'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { VideoUpload } from '@/components/editor/upload/VideoUpload'
import { Upload, Search } from 'lucide-react'

export function VideoPreview() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Stato per il zoom interattivo
    const [interactiveZoom, setInteractiveZoom] = useState(1)
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

    const {
        currentProject,
        currentTime,
        isPlaying,
        zoom,
        selectedAnimation,
        updateAnimation
    } = useEditorStore()

    // Sincronizza il video con il tempo corrente
    useEffect(() => {
        if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
            videoRef.current.currentTime = currentTime
        }
    }, [currentTime])

    // Gestisce play/pause
    useEffect(() => {
        if (!videoRef.current) return

        if (isPlaying) {
            videoRef.current.play()
        } else {
            videoRef.current.pause()
        }
    }, [isPlaying])

    // Applica le trasformazioni CSS in tempo reale per il preview
    const getVideoTransform = () => {
        if (!currentProject) return {}

        // Se c'è un'animazione di zoom selezionata e siamo nel suo range temporale, usa il zoom interattivo
        if (selectedAnimation?.type === 'zoom' &&
            currentTime >= selectedAnimation.startTime &&
            currentTime <= selectedAnimation.endTime) {

            const finalZoom = interactiveZoom
            const finalX = zoomPosition.x
            const finalY = zoomPosition.y

            return {
                transform: `scale(${finalZoom}) translate(${finalX}px, ${finalY}px)`,
                cursor: 'grab'
            }
        }

        let transform = `scale(${zoom})`

        // Trova l'animazione attiva al tempo corrente (non selezionata)
        const activeAnimation = currentProject.animations.find(anim =>
            currentTime >= anim.startTime && currentTime <= anim.endTime && anim.id !== selectedAnimation?.id
        )

        if (activeAnimation?.type === 'zoom') {
            const zoomLevel = activeAnimation.properties.level || 1
            const x = activeAnimation.properties.x || 0
            const y = activeAnimation.properties.y || 0

            // Calcola il progresso dell'animazione (0-1)
            const progress = (currentTime - activeAnimation.startTime) /
                (activeAnimation.endTime - activeAnimation.startTime)

            // Interpola i valori
            const currentZoom = 1 + (zoomLevel - 1) * progress
            const currentX = x * progress
            const currentY = y * progress

            transform = `scale(${currentZoom}) translate(${currentX}px, ${currentY}px)`
        }

        return { transform }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            useEditorStore.getState().setCurrentTime(videoRef.current.currentTime)
        }
    }

    // Gestori per il zoom interattivo
    const handleWheel = (e: React.WheelEvent) => {
        if (!selectedAnimation || selectedAnimation.type !== 'zoom') return
        if (currentTime < selectedAnimation.startTime || currentTime > selectedAnimation.endTime) return

        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        const newZoom = Math.max(0.5, Math.min(5, interactiveZoom + delta))
        setInteractiveZoom(newZoom)

        // Aggiorna l'animazione in tempo reale
        updateAnimation(selectedAnimation.id, {
            properties: {
                ...selectedAnimation.properties,
                level: newZoom,
                x: zoomPosition.x,
                y: zoomPosition.y
            }
        })
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!selectedAnimation || selectedAnimation.type !== 'zoom') return
        if (currentTime < selectedAnimation.startTime || currentTime > selectedAnimation.endTime) return

        setIsDragging(true)
        setLastMousePos({ x: e.clientX, y: e.clientY })
        e.preventDefault()
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !selectedAnimation) return

        const deltaX = e.clientX - lastMousePos.x
        const deltaY = e.clientY - lastMousePos.y

        const newPosition = {
            x: zoomPosition.x + deltaX * 0.5,
            y: zoomPosition.y + deltaY * 0.5
        }

        setZoomPosition(newPosition)
        setLastMousePos({ x: e.clientX, y: e.clientY })

        // Aggiorna l'animazione in tempo reale
        updateAnimation(selectedAnimation.id, {
            properties: {
                ...selectedAnimation.properties,
                level: interactiveZoom,
                x: newPosition.x,
                y: newPosition.y
            }
        })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Sincronizza lo zoom interattivo con l'animazione selezionata
    useEffect(() => {
        if (selectedAnimation?.type === 'zoom') {
            setInteractiveZoom(selectedAnimation.properties.level || 1)
            setZoomPosition({
                x: selectedAnimation.properties.x || 0,
                y: selectedAnimation.properties.y || 0
            })
        } else {
            setInteractiveZoom(1)
            setZoomPosition({ x: 0, y: 0 })
        }
    }, [selectedAnimation])

    if (!currentProject?.videoUrl) {
        return (
            <div className="flex items-center justify-center w-full h-full p-8">
                <div className="max-w-md w-full">
                    <VideoUpload
                        onVideoUploaded={(videoData) => {
                            // Il componente VideoUpload gestisce già la creazione del progetto
                            console.log('Video caricato nell\'editor:', videoData)
                        }}
                        className="w-full"
                    />
                </div>
            </div>
        )
    }

    // Calcola lo stile del background
    const getBackgroundStyle = () => {
        if (!currentProject?.backgroundSettings) return { backgroundColor: '#000000' }

        const bg = currentProject.backgroundSettings
        const opacity = bg.opacity || 1

        switch (bg.type) {
            case 'solid':
                return {
                    backgroundColor: bg.color,
                    opacity
                }
            case 'gradient':
                return {
                    background: bg.gradient,
                    opacity
                }
            case 'image':
                return {
                    backgroundImage: `url(${bg.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: bg.blur ? `blur(${bg.blur}px)` : 'none',
                    opacity
                }
            case 'blur':
                return {
                    backgroundColor: bg.color,
                    filter: `blur(${bg.blur || 20}px)`,
                    opacity
                }
            default:
                return { backgroundColor: '#000000' }
        }
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center overflow-hidden bg-background"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <video
                ref={videoRef}
                src={currentProject.videoUrl}
                className="w-full h-full object-contain transition-transform duration-100 ease-out select-none"
                style={getVideoTransform()}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                    if (videoRef.current) {
                        // Aggiorna la durata del progetto se necessario
                        const duration = videoRef.current.duration
                        if (duration !== currentProject.duration) {
                            useEditorStore.getState().updateProject({ duration })
                        }
                    }
                }}
                draggable={false}
            />

            {/* Indicatore quando zona zoom è selezionata */}
            {selectedAnimation?.type === 'zoom' &&
                currentTime >= selectedAnimation.startTime &&
                currentTime <= selectedAnimation.endTime && (
                    <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg p-3 text-primary-foreground text-sm">
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4" />
                            <span>Zoom Mode Active</span>
                        </div>
                        <div className="text-xs mt-1 opacity-80">
                            Scroll to zoom • Drag to pan
                        </div>
                        <div className="text-xs">
                            {interactiveZoom.toFixed(1)}x zoom
                        </div>
                    </div>
                )}

            {/* Overlay per mostrare informazioni di debug */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm font-mono">
                    <div>Time: {currentTime.toFixed(2)}s</div>
                    <div>Zoom: {zoom.toFixed(2)}x</div>
                    <div>Interactive Zoom: {interactiveZoom.toFixed(2)}x</div>
                    <div>Animations: {currentProject.animations.length}</div>
                    {selectedAnimation && (
                        <div>Selected: {selectedAnimation.type}</div>
                    )}
                </div>
            )}

            {/* Overlay per le animazioni di testo */}
            {currentProject.animations
                .filter(anim => anim.type === 'text' && currentTime >= anim.startTime && currentTime <= anim.endTime)
                .map((textAnim, index) => (
                    <div
                        key={`text-${textAnim.id}-${index}`}
                        className="absolute pointer-events-none"
                        style={{
                            left: `${textAnim.properties.x || 100}px`,
                            top: `${textAnim.properties.y || 100}px`,
                            fontSize: `${textAnim.properties.fontSize || 24}px`,
                            fontWeight: textAnim.properties.fontWeight || 'normal',
                            color: textAnim.properties.color || '#ffffff',
                            backgroundColor: textAnim.properties.backgroundColor || 'transparent',
                            padding: textAnim.properties.padding || '0',
                            borderRadius: textAnim.properties.borderRadius || '0',
                        }}
                    >
                        {textAnim.properties.content}
                        {textAnim.properties.subtitle && (
                            <div className="text-sm opacity-80 mt-1">
                                {textAnim.properties.subtitle}
                            </div>
                        )}
                    </div>
                ))
            }

            {/* Overlay per le animazioni logo */}
            {currentProject.animations
                .filter(anim => anim.type === 'logo' && currentTime >= anim.startTime && currentTime <= anim.endTime)
                .map((logoAnim, index) => {
                    const progress = (currentTime - logoAnim.startTime) / (logoAnim.endTime - logoAnim.startTime)
                    const getAnimationStyle = () => {
                        const baseStyle = {
                            left: `${logoAnim.properties.position?.x || 85}%`,
                            top: `${logoAnim.properties.position?.y || 85}%`,
                            transform: 'translate(-50%, -50%)',
                            opacity: logoAnim.properties.logoOpacity || 0.9
                        }

                        switch (logoAnim.properties.animation) {
                            case 'slideDown':
                                return {
                                    ...baseStyle,
                                    transform: `translate(-50%, -50%) translateY(${-50 * (1 - progress)}px)`,
                                    opacity: progress * (logoAnim.properties.logoOpacity || 0.9)
                                }
                            case 'slideLeft':
                                return {
                                    ...baseStyle,
                                    transform: `translate(-50%, -50%) translateX(${50 * (1 - progress)}px)`,
                                    opacity: progress * (logoAnim.properties.logoOpacity || 0.9)
                                }
                            case 'slideRight':
                                return {
                                    ...baseStyle,
                                    transform: `translate(-50%, -50%) translateX(${-50 * (1 - progress)}px)`,
                                    opacity: progress * (logoAnim.properties.logoOpacity || 0.9)
                                }
                            case 'fadeIn':
                            default:
                                return {
                                    ...baseStyle,
                                    opacity: progress * (logoAnim.properties.logoOpacity || 0.9)
                                }
                        }
                    }

                    return (
                        <div
                            key={`logo-${logoAnim.id}-${index}`}
                            className="absolute pointer-events-none"
                            style={getAnimationStyle()}
                        >
                            {/* Logo */}
                            {logoAnim.properties.logoUrl && (
                                <img
                                    src={logoAnim.properties.logoUrl}
                                    alt="Logo"
                                    className="max-w-none"
                                    style={{
                                        width: `${logoAnim.properties.size || 100}px`,
                                        height: 'auto',
                                        marginBottom: logoAnim.properties.headlineText ? '8px' : '0'
                                    }}
                                />
                            )}

                            {/* Headline Text */}
                            {logoAnim.properties.headlineText && (
                                <div className="text-center">
                                    <div
                                        style={{
                                            fontSize: `${logoAnim.properties.fontSize || 32}px`,
                                            fontWeight: logoAnim.properties.fontWeight || 'bold',
                                            color: logoAnim.properties.color || '#ffffff',
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                                        }}
                                    >
                                        {logoAnim.properties.headlineText}
                                    </div>
                                    {logoAnim.properties.subheadlineText && (
                                        <div
                                            className="mt-1 opacity-80"
                                            style={{
                                                fontSize: `${(logoAnim.properties.fontSize || 32) * 0.6}px`,
                                                color: logoAnim.properties.color || '#ffffff',
                                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                            }}
                                        >
                                            {logoAnim.properties.subheadlineText}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })
            }


        </div>
    )
}
