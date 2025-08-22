'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditorStore } from '@/lib/store'
import { VideoUpload } from '@/components/editor/upload/VideoUpload'
import { Upload, Search } from 'lucide-react'

export function VideoPreview() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
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
        // Sincronizza anche l'audio se presente
        if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.1) {
            audioRef.current.currentTime = currentTime
        }
    }, [currentTime])

    // Gestisce play/pause
    useEffect(() => {
        if (!videoRef.current) return

        if (isPlaying) {
            videoRef.current.play()
            // Riproduci anche l'audio se presente
            if (audioRef.current) {
                console.log('Tentativo di riproduzione audio...')
                console.log('Audio readyState:', audioRef.current.readyState)
                console.log('Audio src:', audioRef.current.src)
                audioRef.current.play().catch(error => {
                    console.error('Errore nella riproduzione audio:', error)
                    if (audioRef.current) {
                        console.error('Audio error code:', audioRef.current.error?.code)
                        console.error('Audio error message:', audioRef.current.error?.message)
                    }
                })
            }
        } else {
            videoRef.current.pause()
            // Pausa anche l'audio se presente
            if (audioRef.current) {
                audioRef.current.pause()
            }
        }
    }, [isPlaying])

    // Trova l'animazione zoom attiva al tempo corrente - logica condivisa
    const getActiveZoomAnimation = () => {
        if (!currentProject) return null

        // Trova SOLO l'animazione zoom selezionata se è attiva al tempo corrente
        // Questo evita conflitti con animazioni zoom multiple
        return selectedAnimation?.type === 'zoom' &&
            currentTime >= selectedAnimation.startTime &&
            currentTime <= selectedAnimation.endTime
            ? selectedAnimation
            : currentProject.animations.find(anim =>
                anim.type === 'zoom' &&
                currentTime >= anim.startTime &&
                currentTime <= anim.endTime &&
                anim.startTime < anim.endTime
            ) || null
    }

    const activeZoomAnimation = getActiveZoomAnimation()

    // Applica le trasformazioni CSS in tempo reale per il preview
    const getVideoTransform = () => {
        if (!currentProject) return {}

        // Trova l'animazione zoom attiva al tempo corrente (indipendentemente dalla selezione)
        const activeZoomAtCurrentTime = currentProject.animations.find(anim =>
            anim.type === 'zoom' &&
            currentTime >= anim.startTime &&
            currentTime <= anim.endTime
        )

        if (activeZoomAtCurrentTime) {
            // Se l'animazione attiva è quella selezionata, usa i valori interattivi per l'editing
            if (selectedAnimation?.id === activeZoomAtCurrentTime.id) {
                const finalZoom = interactiveZoom
                const finalX = zoomPosition.x / finalZoom
                const finalY = zoomPosition.y / finalZoom

                return {
                    transform: `scale(${finalZoom}) translate(${finalX}px, ${finalY}px)`,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    transformOrigin: 'center center'
                }
            } else {
                // Se l'animazione attiva NON è quella selezionata, usa i valori salvati
                const props = activeZoomAtCurrentTime.properties
                const startProps = props.start || {}
                const endProps = props.end || {}

                // Calcola il progresso dell'animazione (0-1)
                const progress = (currentTime - activeZoomAtCurrentTime.startTime) /
                    (activeZoomAtCurrentTime.endTime - activeZoomAtCurrentTime.startTime)

                // Interpola tra start e end
                const startZoom = startProps.level || 1
                const endZoom = endProps.level || startZoom
                const startX = startProps.x || 0
                const startY = startProps.y || 0
                const endX = endProps.x || startX
                const endY = endProps.y || startY

                const currentZoom = startZoom + (endZoom - startZoom) * progress
                const currentX = (startX + (endX - startX) * progress) / currentZoom
                const currentY = (startY + (endY - startY) * progress) / currentZoom

                return {
                    transform: `scale(${currentZoom}) translate(${currentX}px, ${currentY}px)`,
                    transformOrigin: 'center center'
                }
            }
        }

        // Nessuna animazione zoom attiva, usa il zoom base della timeline
        return { transform: `scale(${zoom})` }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            useEditorStore.getState().setCurrentTime(videoRef.current.currentTime)
        }
    }

    // Gestori per il zoom interattivo - controllo libero e fluido
    const handleWheel = useCallback((e: React.WheelEvent) => {
        // Permetti zoom sempre quando c'è un'animazione zoom selezionata
        if (!selectedAnimation || selectedAnimation.type !== 'zoom') return
        if (currentTime < selectedAnimation.startTime || currentTime > selectedAnimation.endTime) return

        e.preventDefault()
        e.stopPropagation()
        const delta = e.deltaY > 0 ? -0.05 : 0.05  // Incrementi più piccoli per controllo più preciso
        const newZoom = Math.max(0.5, Math.min(10, interactiveZoom + delta))  // Zoom massimo aumentato a 10x
        setInteractiveZoom(newZoom)

        // Aggiorna l'animazione in tempo reale
        const updatedProps = {
            ...selectedAnimation.properties,
            start: {
                level: selectedAnimation.properties.level || 1.0,
                x: 0, // Posizione centrale di partenza
                y: 0
            },
            end: {
                level: newZoom,
                x: zoomPosition.x,
                y: zoomPosition.y
            }
        }
        console.log('🔍 Aggiornamento zoom:', { level: newZoom, x: zoomPosition.x, y: zoomPosition.y })
        updateAnimation(selectedAnimation.id, {
            properties: updatedProps
        })
    }, [selectedAnimation, currentTime, interactiveZoom, zoomPosition, updateAnimation])

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

        // Sensibilità aumentata per controllo più fluido
        const sensitivity = 1
        const newPosition = {
            x: zoomPosition.x + deltaX * sensitivity,
            y: zoomPosition.y + deltaY * sensitivity
        }

        setZoomPosition(newPosition)
        setLastMousePos({ x: e.clientX, y: e.clientY })

        // Aggiorna l'animazione in tempo reale
        const updatedProps = {
            ...selectedAnimation.properties,
            start: {
                level: selectedAnimation.properties.level || 1.0,
                x: 0, // Posizione centrale di partenza
                y: 0
            },
            end: {
                level: interactiveZoom,
                x: newPosition.x,
                y: newPosition.y
            }
        }
        console.log('🔍 Aggiornamento posizione:', { level: interactiveZoom, x: newPosition.x, y: newPosition.y })
        updateAnimation(selectedAnimation.id, {
            properties: updatedProps
        })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Sincronizza lo zoom interattivo con l'animazione selezionata
    useEffect(() => {
        if (selectedAnimation?.type === 'zoom') {
            // Usa i valori end se disponibili, altrimenti i valori diretti o default
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

    // Gestisci l'evento wheel con passive: false per evitare errori console
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const wheelHandler = (e: WheelEvent) => {
            // Converti l'evento nativo in React.WheelEvent-like
            const reactEvent = {
                preventDefault: () => e.preventDefault(),
                stopPropagation: () => e.stopPropagation(),
                deltaY: e.deltaY
            } as React.WheelEvent

            handleWheel(reactEvent)
        }

        container.addEventListener('wheel', wheelHandler, { passive: false })
        return () => container.removeEventListener('wheel', wheelHandler)
    }, [handleWheel])

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
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={getBackgroundStyle()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <video
                ref={videoRef}
                src={currentProject.videoUrl}
                className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out select-none"
                style={{
                    ...getVideoTransform(),
                    maxWidth: '80%',
                    maxHeight: '80%',
                    borderRadius: currentProject.deviceSettings?.borderRadius ? `${currentProject.deviceSettings.borderRadius}px` : '0px',
                }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                    if (videoRef.current) {
                        // Aggiorna la durata del progetto se necessario
                        const duration = videoRef.current.duration
                        if (duration !== currentProject.duration) {
                            useEditorStore.getState().updateProject({ duration })
                        }
                        // Disabilita l'audio del video se c'è una traccia audio separata
                        if (currentProject.musicSettings?.track) {
                            videoRef.current.muted = true
                        }
                    }
                }}
                draggable={false}
            />

            {/* Audio separato per la traccia musicale */}
            {currentProject.musicSettings?.track && (
                <audio
                    ref={audioRef}
                    src={currentProject.musicSettings.track}
                    preload="metadata"
                    onLoadedMetadata={() => {
                        if (audioRef.current) {
                            audioRef.current.volume = currentProject.musicSettings?.volume || 0.5
                        }
                    }}
                />
            )}

            {/* Indicatore quando zona zoom è attiva */}
            {(() => {
                const activeZoomAtCurrentTime = currentProject?.animations.find(anim =>
                    anim.type === 'zoom' &&
                    currentTime >= anim.startTime &&
                    currentTime <= anim.endTime
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
                    const props = activeZoomAtCurrentTime.properties
                    const startProps = props.start || {}
                    const endProps = props.end || {}
                    const progress = (currentTime - activeZoomAtCurrentTime.startTime) /
                        (activeZoomAtCurrentTime.endTime - activeZoomAtCurrentTime.startTime)

                    displayZoom = (startProps.level || 1) + ((endProps.level || startProps.level || 1) - (startProps.level || 1)) * progress
                    displayX = (startProps.x || 0) + ((endProps.x || startProps.x || 0) - (startProps.x || 0)) * progress
                    displayY = (startProps.y || 0) + ((endProps.y || startProps.y || 0) - (startProps.y || 0)) * progress
                }

                return (
                    <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg p-3 text-primary-foreground text-sm">
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
            })()}



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
