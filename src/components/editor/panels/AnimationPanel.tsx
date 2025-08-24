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
        id: 'none',
        name: 'None',
        type: 'none' as const,
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

export function AnimationPanel() {
    const {
        currentTime,
        addAnimation,
        selectedAnimation,
        currentProject,
        updateProject
    } = useEditorStore()

    const [selectedCamera, setSelectedCamera] = useState('none')

    const handleCameraSelect = (cameraId: string) => {
        setSelectedCamera(cameraId)

        const camera = cameraAnimations.find(c => c.id === cameraId)
        if (!camera) return

        // Per continuous glide, impostiamo le cameraSettings globali invece di un'animazione specifica
        if (camera.id === 'continuous-glide') {
            updateProject({
                cameraSettings: {
                    type: 'continuous_glide',
                    intensity: 0.15,
                    zoom_range: 0.1,
                    direction: 'diagonal'
                }
            })
            console.log('Impostato Continuous Glide come animazione camera globale')
            return
        }

        // Reset camera settings per altri tipi
        updateProject({
            cameraSettings: undefined
        })
        if (camera.id === 'none') {
            console.log('🎬 Nessuna animazione camera selezionata')
            return
        }

        let animation
        switch (camera.id) {
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
        </div>
    )
}
