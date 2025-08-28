'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditorStore } from '@/lib/store'
import { VideoUpload } from '@/components/editor/upload/VideoUpload'
import { Search } from 'lucide-react'

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
        updateAnimation,
        getActiveClip,
        getCurrentClipTime
    } = useEditorStore()

    // Ottieni la clip attiva e il suo video
    const activeClip = getActiveClip()
    const clipTime = getCurrentClipTime()
    const videoSrc = activeClip?.videoUrl || (activeClip?.videoFile ? URL.createObjectURL(activeClip.videoFile) : '')

    // Sincronizza il video della clip attiva con il tempo corrente
    useEffect(() => {
        if (!videoRef.current || !videoSrc || !activeClip) return

        const trimStart = activeClip.trimStart || 0
        // Il tempo nel video originale = trimStart + tempo relativo alla clip
        const actualVideoTime = trimStart + clipTime

        // Aggiorna il tempo del video con una soglia più alta per ridurre i lag
        if (Math.abs(videoRef.current.currentTime - actualVideoTime) > 0.5) {
            videoRef.current.currentTime = actualVideoTime
        }
    }, [clipTime, activeClip, videoSrc, isPlaying])

    // Gestisce il cambio di clip - ricarica il video quando cambia la clip attiva
    useEffect(() => {
        if (videoRef.current && videoSrc && activeClip) {
            const currentSrc = videoRef.current.src
            const newSrc = activeClip.videoUrl || (activeClip.videoFile ? URL.createObjectURL(activeClip.videoFile) : '')

            if (currentSrc !== newSrc && newSrc) {
                // Preload più aggressivo per ridurre il lag al cambio clip
                videoRef.current.preload = 'auto'
                videoRef.current.src = newSrc

                // Caricamento ottimizzato
                videoRef.current.onloadedmetadata = () => {
                    const trimStart = activeClip.trimStart || 0
                    const actualVideoTime = trimStart + clipTime
                    if (videoRef.current) {
                        videoRef.current.currentTime = actualVideoTime
                    }
                }

                // Carica il video completamente per evitare lag
                videoRef.current.load()
            }
        }
    }, [activeClip?.id])

    // Gestisce il cambio di video source - RIMOSSO per evitare doppio caricamento
    // La gestione del cambio video è già ottimizzata nell'useEffect sopra

    // Gestisce play/pause - SOLO VIDEO, l'audio è gestito dal Player
    useEffect(() => {
        if (!videoRef.current) return

        if (isPlaying) {
            videoRef.current.play().catch(error => {
                console.error('Errore durante play video:', error)
            })
        } else {
            videoRef.current.pause()
        }
    }, [isPlaying])

    // Trova l'animazione zoom attiva al tempo corrente (nella clip attiva)
    const getActiveZoomAnimation = () => {
        if (!activeClip) return null

        const zoomAnimations = activeClip.animations.filter(anim => anim.type === 'zoom')

        // Trova SOLO l'animazione zoom selezionata se è attiva al tempo corrente
        return selectedAnimation?.type === 'zoom' &&
            clipTime >= selectedAnimation.startTime &&
            clipTime <= selectedAnimation.endTime
            ? selectedAnimation
            : zoomAnimations.find(anim =>
                clipTime >= anim.startTime &&
                clipTime <= anim.endTime &&
                anim.startTime < anim.endTime
            ) || null
    }

    const activeZoomAnimation = getActiveZoomAnimation()

    // Controlla se c'è uno zoom attivo (per nascondere il riflesso)
    const hasActiveZoom = activeZoomAnimation !== null

    // Applica le trasformazioni CSS in tempo reale per il preview
    const getVideoTransform = () => {
        if (!activeClip) return {}

        const zoomAnimations = activeClip.animations.filter(anim => anim.type === 'zoom')

        // Trova l'animazione zoom attiva al tempo corrente
        const activeZoomAtCurrentTime = zoomAnimations.find(anim =>
            clipTime >= anim.startTime &&
            clipTime <= anim.endTime
        )

        let zoomTransform = ''

        if (activeZoomAtCurrentTime) {
            // Se l'animazione attiva è quella selezionata, usa i valori interattivi per l'editing
            if (selectedAnimation?.id === activeZoomAtCurrentTime.id) {
                const finalZoom = interactiveZoom
                const finalX = zoomPosition.x / finalZoom
                const finalY = zoomPosition.y / finalZoom
                zoomTransform = `scale(${finalZoom}) translate(${finalX}px, ${finalY}px)`
            } else {
                // Se l'animazione attiva NON è quella selezionata, usa direttamente i valori finali
                const props = activeZoomAtCurrentTime.properties
                const endProps = props.end || props // Se non c'è 'end', usa le proprietà principali

                // Usa direttamente i valori finali per uno zoom immediato
                const finalZoom = endProps.level || props.level || 1
                const finalX = (endProps.x || props.x || 0) / finalZoom
                const finalY = (endProps.y || props.y || 0) / finalZoom

                zoomTransform = `scale(${finalZoom}) translate(${finalX}px, ${finalY}px)`
            }
        } else {
            // Nessuna animazione zoom attiva, usa il zoom base della timeline
            zoomTransform = `scale(${zoom})`
        }

        return {
            transform: zoomTransform,
            cursor: activeZoomAtCurrentTime && selectedAnimation?.id === activeZoomAtCurrentTime.id
                ? (isDragging ? 'grabbing' : 'grab')
                : 'default',
            transformOrigin: 'center center'
        }
    }



    // Gestori per il zoom interattivo - controllo libero e fluido
    const handleWheel = useCallback((e: React.WheelEvent) => {
        // Permetti zoom sempre quando c'è un'animazione zoom selezionata
        if (!selectedAnimation || selectedAnimation.type !== 'zoom') return
        if (clipTime < selectedAnimation.startTime || clipTime > selectedAnimation.endTime) return

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
    }, [selectedAnimation, clipTime, interactiveZoom, zoomPosition, updateAnimation])

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!selectedAnimation || selectedAnimation.type !== 'zoom') return
        if (clipTime < selectedAnimation.startTime || clipTime > selectedAnimation.endTime) return

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
                x: newPosition.x, // Mantieni i pixel per il pan interattivo
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

    if (!videoSrc) {
        return (
            <div className="flex items-center justify-center w-full h-full p-8">
                <div className="max-w-md w-full">
                    <VideoUpload className="w-full" />
                </div>
            </div>
        )
    }

    // Funzioni utility per generare i background (stesse del componente Remotion)
    const generateLinearGradientCSS = (colors: string[], angle: number): string => {
        return `linear-gradient(${angle}deg, ${colors.join(', ')})`
    }

    const generateMeshGradientCSS = (colors: string[]): string => {
        const gradients = [
            `radial-gradient(at 40% 20%, ${colors[0]} 0px, transparent 50%)`,
            `radial-gradient(at 80% 0%, ${colors[1]} 0px, transparent 50%)`,
            `radial-gradient(at 0% 50%, ${colors[2]} 0px, transparent 50%)`,
            `radial-gradient(at 80% 50%, ${colors[3]} 0px, transparent 50%)`,
            `radial-gradient(at 0% 100%, ${colors[0]} 0px, transparent 50%)`,
            `radial-gradient(at 80% 100%, ${colors[1]} 0px, transparent 50%)`,
            `radial-gradient(at 40% 100%, ${colors[2]} 0px, transparent 50%)`
        ]
        return gradients.join(', ')
    }

    // Verifica se c'è un background applicato
    const hasBackground = () => {
        if (!currentProject?.backgroundSettings) return false
        const bg = currentProject.backgroundSettings
        return bg.type !== 'none' && bg.type !== undefined
    }

    // Calcola lo stile del background
    const getBackgroundStyle = () => {
        if (!currentProject?.backgroundSettings) return { backgroundColor: '#000000' }

        const bg = currentProject.backgroundSettings
        const opacity = bg.opacity || 1

        switch (bg.type) {
            case 'none':
                return { backgroundColor: 'transparent' }
            case 'solid':
                return {
                    backgroundColor: bg.color || '#000000',
                    opacity
                }
            case 'linear-gradient':
                if (bg.gradientColors && bg.gradientColors.length >= 2) {
                    return {
                        background: generateLinearGradientCSS(
                            bg.gradientColors,
                            bg.gradientAngle || 180
                        ),
                        opacity
                    }
                }
                break
            case 'mesh-gradient':
                if (bg.meshColors && bg.meshColors.length >= 4) {
                    return {
                        background: generateMeshGradientCSS(bg.meshColors),
                        opacity
                    }
                }
                break
            case 'image':
                if (bg.imageUrl) {
                    return {
                        backgroundImage: `url(${bg.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: bg.blur ? `blur(${bg.blur}px)` : 'none',
                        opacity
                    }
                }
                break
            default:
                return { backgroundColor: '#000000' }
        }

        // Fallback
        return { backgroundColor: '#000000' }
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
            {/* VIDEO PRINCIPALE */}
            <video
                ref={videoRef}
                src={videoSrc}
                className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out select-none"
                style={{
                    ...getVideoTransform(),
                    maxWidth: '80%',
                    maxHeight: '80%',
                    borderRadius: currentProject?.deviceSettings?.borderRadius ? `${currentProject.deviceSettings.borderRadius}px` : '0px',
                    boxShadow: hasBackground() ? '0 20px 40px rgba(0,0,0,0.3)' : 'none',
                    // Aggiungi il riflesso solo se c'è un background e NON c'è zoom attivo
                    ...(hasBackground() && !hasActiveZoom && {
                        WebkitBoxReflect: 'below 10px linear-gradient(to bottom, transparent 60%, rgba(255, 255, 255, 0.12))',
                    }),
                }}

                onLoadedMetadata={() => {
                    if (videoRef.current && currentProject) {
                        // Aggiorna la durata del progetto se necessario
                        const duration = videoRef.current.duration
                        const updates: any = {}

                        if (duration !== currentProject.duration) {
                            updates.duration = duration
                        }

                        // Salva la durata originale se non è già impostata
                        if (!currentProject.originalDuration) {
                            updates.originalDuration = duration
                        }

                        if (Object.keys(updates).length > 0) {
                            useEditorStore.getState().updateProject(updates)
                        }

                        // Disabilita l'audio del video se c'è una traccia audio separata
                        if (currentProject.musicSettings?.track) {
                            videoRef.current.muted = true
                        }
                    }
                }}
                draggable={false}
            />



            {/* Indicatore quando zona zoom è attiva */}
            {(() => {
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
                    const props = activeZoomAtCurrentTime.properties
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
            })()}
            {(() => {
                if (!activeClip) return null

                const textAnimations = activeClip.animations.filter(anim =>
                    anim.type === 'text' &&
                    clipTime >= anim.startTime &&
                    clipTime <= anim.endTime
                )

                return textAnimations.map((textAnim, index) => (
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
            })()}

            {/* Overlay per le animazioni logo */}
            {activeClip?.animations
                .filter(anim => anim.type === 'logo' && clipTime >= anim.startTime && clipTime <= anim.endTime)
                .map((logoAnim, index) => {
                    const progress = (clipTime - logoAnim.startTime) / (logoAnim.endTime - logoAnim.startTime)
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
