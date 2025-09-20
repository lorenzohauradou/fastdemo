'use client'

import { useEffect, useRef } from 'react'
import { VideoClip, Project } from '@/lib/store'

interface ZoomProperties {
    level?: number
    x?: number
    y?: number
}

interface VideoPlayerProps {
    activeClip: VideoClip | null
    clipTime: number
    isPlaying: boolean
    currentProject: Project | null
    zoom: number
    selectedAnimation: any
    interactiveZoom: number
    zoomPosition: { x: number; y: number }
    isDragging: boolean
    hasBackground: boolean
    onLoadedMetadata?: () => void
}

export function VideoPlayer({
    activeClip,
    clipTime,
    isPlaying,
    currentProject,
    zoom,
    selectedAnimation,
    interactiveZoom,
    zoomPosition,
    isDragging,
    hasBackground,
    onLoadedMetadata
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    // Ottieni il video source dalla clip attiva
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
                    onLoadedMetadata?.()
                }

                // load video
                videoRef.current.load()
            }
        }
    }, [activeClip?.id, clipTime, onLoadedMetadata])

    // Gestisce play/pause - solo video, l'audio è gestito dal Player
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

        // Trova solo l'animazione zoom selezionata se è attiva al tempo corrente
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
                const finalZoom = (endProps as ZoomProperties).level || (props as ZoomProperties).level || 1
                const finalX = ((endProps as ZoomProperties).x || (props as ZoomProperties).x || 0) / finalZoom
                const finalY = ((endProps as ZoomProperties).y || (props as ZoomProperties).y || 0) / finalZoom

                zoomTransform = `scale(${finalZoom}) translate(${finalX}px, ${finalY}px)`
            }
        } else {
            // Nessuna animazione zoom attiva
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

    const handleLoadedMetadata = () => {
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
                // Qui dovrei usare updateProject dal store, ma per ora lo gestiamo nel componente padre
                onLoadedMetadata?.()
            }
        }
    }

    if (!videoSrc) {
        return null
    }

    return (
        <video
            ref={videoRef}
            src={videoSrc}
            className="object-contain transition-transform duration-100 ease-out select-none"
            style={{
                ...getVideoTransform(),
                width: '100%',
                height: '100%',
                borderRadius: currentProject?.deviceSettings?.borderRadius ? `${currentProject.deviceSettings.borderRadius}px` : '0px',
                boxShadow: hasBackground ? '0 20px 40px rgba(0,0,0,0.3)' : 'none',
                // Aggiungi il riflesso solo se c'è un background e non c'è zoom attivo
                ...(hasBackground && {
                    transform: `${getVideoTransform().transform || ''} scale(0.8)`,
                }),
                ...(hasBackground && !hasActiveZoom && {
                    WebkitBoxReflect: 'below 10px linear-gradient(to bottom, transparent 60%, rgba(255, 255, 255, 0.12))',
                }),
            }}
            onLoadedMetadata={handleLoadedMetadata}
            draggable={false}
            data-main-video
            muted={true}
        />
    )
}
