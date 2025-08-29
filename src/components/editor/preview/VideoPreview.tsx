'use client'

import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/lib/store'
import { VideoUpload } from '@/components/editor/upload/VideoUpload'
import { BackgroundRenderer } from './BackgroundRenderer'
import { VideoPlayer } from './VideoPlayer'
import { ZoomController } from './ZoomController'
import { ZoomIndicator } from './ZoomIndicator'
import { TextOverlay } from './TextOverlay'
import { LogoOverlay } from './LogoOverlay'

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

    // Ottieni la clip attiva e il suo video
    const activeClip = getActiveClip()
    const clipTime = getCurrentClipTime()
    const videoSrc = activeClip?.videoUrl || (activeClip?.videoFile ? URL.createObjectURL(activeClip.videoFile) : '')

    // Gestisce l'evento wheel con passive: false per evitare errori console
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

    // Verifica se c'è un background applicato
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
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseUp}
                        onWheel={onWheel}
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
                        <TextOverlay
                            activeClip={activeClip}
                            clipTime={clipTime}
                        />
                        <LogoOverlay
                            activeClip={activeClip}
                            clipTime={clipTime}
                        />
                    </div>
                </BackgroundRenderer>
            )}
        </ZoomController>
    )
}
