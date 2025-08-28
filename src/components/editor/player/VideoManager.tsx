'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { VideoClip } from './playerUtils'

interface VideoManagerProps {
    clips: VideoClip[]
    currentTime: number
    isPlaying: boolean
    onVideoReady?: (clipId: string) => void
    onVideoError?: (clipId: string, error: string) => void
}

interface VideoElement {
    element: HTMLVideoElement
    clipId: string
    isReady: boolean
    url: string
}

/**
 * VideoManager - Gestisce un pool di elementi video per switching fluido
 * Precarica le clip e gestisce le transizioni senza interruzioni
 */
export function VideoManager({
    clips,
    currentTime,
    isPlaying,
    onVideoReady,
    onVideoError
}: VideoManagerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [videoPool, setVideoPool] = useState<Map<string, VideoElement>>(new Map())
    const [activeClipId, setActiveClipId] = useState<string | null>(null)
    const [urlCache, setUrlCache] = useState<Map<string, string>>(new Map())

    // Trova la clip attiva al tempo corrente
    const getActiveClip = useCallback(() => {
        return clips.find(clip =>
            currentTime >= clip.startTime &&
            currentTime < clip.endTime
        ) || null
    }, [clips, currentTime])

    // Gestisce la cache degli URL per evitare memory leak
    const getVideoUrl = useCallback((clip: VideoClip): string => {
        const cacheKey = clip.id

        if (urlCache.has(cacheKey)) {
            return urlCache.get(cacheKey)!
        }

        let url: string
        if (clip.properties.url) {
            url = clip.properties.url
        } else if (clip.properties.file) {
            url = URL.createObjectURL(clip.properties.file)
        } else {
            return ''
        }

        setUrlCache(prev => new Map(prev.set(cacheKey, url)))
        return url
    }, [urlCache])

    // Cleanup degli URL quando non più necessari
    useEffect(() => {
        return () => {
            urlCache.forEach((url, key) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url)
                }
            })
        }
    }, [])

    // Crea un nuovo elemento video
    const createVideoElement = useCallback((clip: VideoClip): HTMLVideoElement => {
        const video = document.createElement('video')
        const url = getVideoUrl(clip)

        if (!url) return video

        // Configurazione ottimizzata per performance
        video.src = url
        video.preload = 'metadata' // Carica solo metadati inizialmente
        video.muted = true // I video sono sempre muted, l'audio è gestito separatamente
        video.playsInline = true
        video.style.position = 'absolute'
        video.style.top = '0'
        video.style.left = '0'
        video.style.width = '100%'
        video.style.height = '100%'
        video.style.objectFit = 'contain'
        video.style.opacity = '0'
        video.style.transition = 'opacity 0.1s ease-out'

        // Event listeners per il caricamento
        video.addEventListener('loadedmetadata', () => {
            setVideoPool(prev => {
                const newPool = new Map(prev)
                const videoElement = newPool.get(clip.id)
                if (videoElement) {
                    videoElement.isReady = true
                    newPool.set(clip.id, videoElement)
                }
                return newPool
            })
            onVideoReady?.(clip.id)
        })

        video.addEventListener('error', (e) => {
            console.error(`Errore caricamento video ${clip.id}:`, e)
            onVideoError?.(clip.id, 'Errore nel caricamento del video')
        })

        // Precarica i dati quando il video è pronto
        video.addEventListener('canplay', () => {
            // Precarica alcuni secondi di video per ridurre i lag
            if (video.buffered.length === 0 || video.buffered.end(0) < 3) {
                video.currentTime = 0.1 // Trigger del buffering
            }
        })

        return video
    }, [getVideoUrl, onVideoReady, onVideoError])

    // Gestisce il pool di video - mantiene attive solo le clip necessarie
    useEffect(() => {
        const activeClip = getActiveClip()
        const currentClipId = activeClip?.id || null

        // Determina quali clip devono essere precaricate
        const clipsToPreload = new Set<string>()

        if (currentClipId) {
            clipsToPreload.add(currentClipId)

            // Precarica la clip successiva per transizioni fluide
            const currentIndex = clips.findIndex(c => c.id === currentClipId)
            if (currentIndex >= 0 && currentIndex < clips.length - 1) {
                clipsToPreload.add(clips[currentIndex + 1].id)
            }

            // Mantieni anche la clip precedente se siamo vicini al bordo
            if (currentIndex > 0 && activeClip && (currentTime - activeClip.startTime) < 2) {
                clipsToPreload.add(clips[currentIndex - 1].id)
            }
        }

        setVideoPool(prev => {
            const newPool = new Map(prev)

            // Rimuovi video non più necessari
            for (const [clipId, videoElement] of prev) {
                if (!clipsToPreload.has(clipId)) {
                    if (containerRef.current?.contains(videoElement.element)) {
                        containerRef.current.removeChild(videoElement.element)
                    }
                    newPool.delete(clipId)
                }
            }

            // Aggiungi nuovi video necessari
            for (const clipId of clipsToPreload) {
                if (!newPool.has(clipId)) {
                    const clip = clips.find(c => c.id === clipId)
                    if (clip) {
                        const videoElement = createVideoElement(clip)
                        const videoData: VideoElement = {
                            element: videoElement,
                            clipId,
                            isReady: false,
                            url: getVideoUrl(clip)
                        }

                        newPool.set(clipId, videoData)

                        if (containerRef.current) {
                            containerRef.current.appendChild(videoElement)
                        }
                    }
                }
            }

            return newPool
        })

        setActiveClipId(currentClipId)
    }, [clips, getActiveClip, createVideoElement, getVideoUrl])

    // Gestisce la visibilità e sincronizzazione dei video
    useEffect(() => {
        const activeClip = getActiveClip()
        if (!activeClip) return

        const videoData = videoPool.get(activeClip.id)
        if (!videoData || !videoData.isReady) return

        const video = videoData.element
        const clipRelativeTime = currentTime - activeClip.startTime
        const trimStart = activeClip.properties.trimStart || 0
        const actualVideoTime = trimStart + clipRelativeTime

        // Sincronizza il tempo del video
        if (Math.abs(video.currentTime - actualVideoTime) > 0.1) {
            video.currentTime = actualVideoTime
        }

        // Gestisci la visibilità
        videoPool.forEach((videoElement, clipId) => {
            const isActive = clipId === activeClip.id
            videoElement.element.style.opacity = isActive ? '1' : '0'
            videoElement.element.style.zIndex = isActive ? '1' : '0'
        })

    }, [currentTime, activeClipId, videoPool, getActiveClip])

    // Gestisce play/pause
    useEffect(() => {
        const activeClip = getActiveClip()
        if (!activeClip) return

        const videoData = videoPool.get(activeClip.id)
        if (!videoData || !videoData.isReady) return

        const video = videoData.element

        if (isPlaying) {
            // Verifica che il video sia pronto prima di riprodurre
            if (video.readyState >= 3) { // HAVE_FUTURE_DATA
                video.play().catch(error => {
                    console.error('Errore durante play:', error)
                })
            } else {
                // Se non è pronto, aspetta che lo diventi
                const onCanPlay = () => {
                    video.play().catch(console.error)
                    video.removeEventListener('canplay', onCanPlay)
                }
                video.addEventListener('canplay', onCanPlay)
            }
        } else {
            video.pause()
        }

        // Pausa tutti gli altri video
        videoPool.forEach((videoElement, clipId) => {
            if (clipId !== activeClip.id) {
                videoElement.element.pause()
            }
        })

    }, [isPlaying, activeClipId, videoPool, getActiveClip])

    // Restituisce l'elemento video attivo per l'uso esterno (animazioni, etc.)
    const getActiveVideoElement = useCallback((): HTMLVideoElement | null => {
        const activeClip = getActiveClip()
        if (!activeClip) return null

        const videoData = videoPool.get(activeClip.id)
        return videoData?.element || null
    }, [getActiveClip, videoPool])

    // Esponi l'elemento video attivo tramite ref
    useEffect(() => {
        const activeVideo = getActiveVideoElement()
        if (activeVideo && containerRef.current) {
            // Aggiungi una proprietà custom per accesso esterno
            ; (containerRef.current as any).activeVideo = activeVideo
        }
    }, [getActiveVideoElement])

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden"
            style={{ backgroundColor: 'transparent' }}
        />
    )
}

// Hook per accedere al video attivo dall'esterno
export function useActiveVideo(containerRef: React.RefObject<HTMLDivElement>) {
    const [activeVideo, setActiveVideo] = useState<HTMLVideoElement | null>(null)

    useEffect(() => {
        const container = containerRef.current
        if (container) {
            const video = (container as any).activeVideo
            setActiveVideo(video || null)
        }
    }, [containerRef])

    return activeVideo
}
