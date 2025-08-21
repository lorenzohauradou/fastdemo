'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { ZoomIn, Move, Sparkles } from 'lucide-react'

// Animazioni Camera
const cameraAnimations = [
    {
        id: 'basic',
        name: 'Basic',
        type: 'zoom' as const,
        selected: true
    },
    {
        id: 'continuous-glide',
        name: 'Continuous Glide',
        type: 'pan' as const,
        selected: false
    },
    {
        id: 'skewed',
        name: 'Skewed',
        type: 'pan' as const,
        selected: false
    },
    {
        id: 'orbit-glide',
        name: 'Orbit Glide',
        type: 'pan' as const,
        selected: false
    }
]

// Animazioni Intro come da foto
const introAnimations = [
    {
        id: 'none',
        name: 'None',
        selected: true
    },
    {
        id: 'slide-down-fade',
        name: 'Slide down and fade',
        selected: false
    },
    {
        id: 'slide-left-fade',
        name: 'Slide left and fade',
        selected: false
    },
    {
        id: 'slide-right-fade',
        name: 'Slide right and fade',
        selected: false
    },
    {
        id: 'quick-slide-away',
        name: 'Quick slide away',
        selected: false
    },
    {
        id: 'quick-slide-towards',
        name: 'Quick slide towards',
        selected: false
    }
]

// Animazioni Outro come da foto
const outroAnimations = [
    {
        id: 'none',
        name: 'None',
        selected: true
    },
    {
        id: 'slide-up-fade',
        name: 'Slide up and fade',
        selected: false
    },
    {
        id: 'slide-left-fade-outro',
        name: 'Slide left and fade',
        selected: false
    },
    {
        id: 'slide-right-fade-outro',
        name: 'Slide right and fade',
        selected: false
    },
    {
        id: 'quick-slide-towards-outro',
        name: 'Quick slide towards',
        selected: false
    },
    {
        id: 'quick-slide-away-outro',
        name: 'Quick slide away',
        selected: false
    }
]

export function AnimationPanel() {
    const {
        currentTime,
        addAnimation,
        selectedAnimation,
        currentProject
    } = useEditorStore()

    const [selectedCamera, setSelectedCamera] = useState('basic')
    const [selectedIntro, setSelectedIntro] = useState('none')
    const [selectedOutro, setSelectedOutro] = useState('none')

    const handleCameraSelect = (cameraId: string) => {
        setSelectedCamera(cameraId)

        const camera = cameraAnimations.find(c => c.id === cameraId)
        if (!camera) return

        let animation
        switch (camera.id) {
            case 'basic':
                animation = {
                    type: 'zoom' as const,
                    startTime: currentTime,
                    endTime: currentTime + 2,
                    properties: { level: 1.5, x: 0, y: 0 }
                }
                break
            case 'continuous-glide':
                animation = {
                    type: 'pan' as const,
                    startTime: currentTime,
                    endTime: currentTime + 4,
                    properties: { from_x: -100, from_y: 0, to_x: 100, to_y: 0 }
                }
                break
            case 'skewed':
                animation = {
                    type: 'pan' as const,
                    startTime: currentTime,
                    endTime: currentTime + 3,
                    properties: { from_x: -50, from_y: -50, to_x: 50, to_y: 50 }
                }
                break
            case 'orbit-glide':
                animation = {
                    type: 'pan' as const,
                    startTime: currentTime,
                    endTime: currentTime + 5,
                    properties: {
                        from_x: 0,
                        from_y: -100,
                        to_x: 0,
                        to_y: 100,
                        orbit: true,
                        radius: 100
                    }
                }
                break
            default:
                return
        }

        addAnimation(animation)
    }

    const handleIntroSelect = (introId: string) => {
        setSelectedIntro(introId)
        console.log('Selected intro:', introId)
    }

    const handleOutroSelect = (outroId: string) => {
        setSelectedOutro(outroId)
        console.log('Selected outro:', outroId)
    }

    // Componente per la preview video
    const VideoPreview = ({ className }: { className?: string }) => {
        if (!currentProject?.videoUrl && !currentProject?.videoFile) {
            return (
                <div className={`bg-gray-800 rounded flex items-center justify-center ${className}`}>
                    <div className="text-gray-500 text-xs">No video</div>
                </div>
            )
        }

        const videoSrc = currentProject.videoUrl || (currentProject.videoFile ? URL.createObjectURL(currentProject.videoFile) : '')

        return (
            <div className={`bg-black rounded overflow-hidden ${className}`}>
                <video
                    src={videoSrc}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay={false}
                />
            </div>
        )
    }

    return (
        <div className="p-4 space-y-6 h-full overflow-y-auto">
            {/* Header */}
            <div>
                <h2 className="text-xl font-semibold text-white">Animation</h2>
            </div>

            {/* Camera Animation Style */}
            <div>
                <h3 className="text-lg font-medium text-white mb-4">Camera animation style</h3>
                <div className="grid grid-cols-2 gap-3">
                    {cameraAnimations.map((camera) => (
                        <div
                            key={camera.id}
                            onClick={() => handleCameraSelect(camera.id)}
                            className={`cursor-pointer rounded-lg overflow-hidden transition-all ${selectedCamera === camera.id
                                ? 'ring-2 ring-blue-500'
                                : 'hover:ring-1 hover:ring-gray-500'
                                }`}
                        >
                            <VideoPreview className="aspect-video" />
                            <div className="p-3 bg-card">
                                <h4 className="text-sm font-medium text-white text-center">{camera.name}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Intro */}
            <div>
                <h3 className="text-lg font-medium text-white mb-4">Intro</h3>
                <div className="grid grid-cols-2 gap-3">
                    {introAnimations.map((intro) => (
                        <div
                            key={intro.id}
                            onClick={() => handleIntroSelect(intro.id)}
                            className={`cursor-pointer rounded-lg overflow-hidden transition-all ${selectedIntro === intro.id
                                ? 'ring-2 ring-blue-500'
                                : 'hover:ring-1 hover:ring-gray-500'
                                }`}
                        >
                            {intro.id === 'none' ? (
                                <div className="aspect-video bg-card rounded flex items-center justify-center">
                                    <span className="text-white text-lg font-medium">None</span>
                                </div>
                            ) : (
                                <VideoPreview className="aspect-video" />
                            )}
                            <div className="p-3 bg-card">
                                <h4 className="text-sm font-medium text-white text-center">{intro.name}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Outro */}
            <div>
                <h3 className="text-lg font-medium text-white mb-4">Outro</h3>
                <div className="grid grid-cols-2 gap-3">
                    {outroAnimations.map((outro) => (
                        <div
                            key={outro.id}
                            onClick={() => handleOutroSelect(outro.id)}
                            className={`cursor-pointer rounded-lg overflow-hidden transition-all ${selectedOutro === outro.id
                                ? 'ring-2 ring-blue-500'
                                : 'hover:ring-1 hover:ring-gray-500'
                                }`}
                        >
                            {outro.id === 'none' ? (
                                <div className="aspect-video bg-card rounded flex items-center justify-center">
                                    <span className="text-white text-lg font-medium">None</span>
                                </div>
                            ) : (
                                <VideoPreview className="aspect-video" />
                            )}
                            <div className="p-3 bg-card">
                                <h4 className="text-sm font-medium text-white text-center">{outro.name}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
