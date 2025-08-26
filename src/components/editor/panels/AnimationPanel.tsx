'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import Image from 'next/image'

const cameraAnimations = [
    {
        id: 'none',
        name: 'None',
        preview: '/images/icons/none.png',
        type: 'none' as const,
        selected: true
    },
    {
        id: 'continuous-glide',
        name: 'Continuous Glide',
        preview: '/videos/animations/continuous-glide.mp4',
        type: 'pan' as const,
        selected: false
    },
    {
        id: 'skewed',
        name: 'Skewed',
        preview: '/videos/animations/skewed.mp4',
        type: 'pan' as const,
        selected: false
    },
    {
        id: 'orbit-glide',
        name: 'Orbit Glide',
        preview: '/videos/animations/orbit-glide.mp4',
        type: 'pan' as const,
        selected: false
    }
]

export function AnimationPanel() {
    const {
        currentProject,
        updateProject
    } = useEditorStore()

    const [selectedCamera, setSelectedCamera] = useState('none')

    const handleCameraSelect = (cameraId: string) => {
        setSelectedCamera(cameraId)

        const camera = cameraAnimations.find(c => c.id === cameraId)
        if (!camera) return

        // Gestisce le diverse animazioni camera
        switch (camera.id) {
            case 'continuous-glide':
                updateProject({
                    cameraSettings: {
                        type: 'continuous_glide',
                    }
                })
                console.log('Impostato Continuous Glide come animazione camera globale')
                break
            case 'skewed':
                updateProject({
                    cameraSettings: {
                        type: 'skewed_glide',
                        intensity: 1,
                        direction: 'diagonal',
                        angle: 0
                    }
                })
                console.log('Impostato Skewed Glide come animazione camera globale')
                break
            case 'orbit-glide':
                updateProject({
                    cameraSettings: {
                        type: 'orbit_glide',
                        intensity: 1
                    }
                })
                console.log('Impostato Orbit Glide come animazione camera globale')
                break
            case 'none':
            default:
                updateProject({
                    cameraSettings: undefined
                })
                console.log('🎬 Nessuna animazione camera selezionata')
                break
        }
    }

    // Gestori per i controlli delle animazioni
    const handleIntensityChange = (value: number[]) => {
        if (!currentProject?.cameraSettings) return
        updateProject({
            cameraSettings: {
                ...currentProject.cameraSettings,
                intensity: value[0]
            }
        })
    }

    const handleDirectionChange = (direction: 'up' | 'down' | 'left' | 'right' | 'diagonal') => {
        if (!currentProject?.cameraSettings) return
        updateProject({
            cameraSettings: {
                ...currentProject.cameraSettings,
                direction
            }
        })
    }

    const handleAngleChange = (value: number[]) => {
        if (!currentProject?.cameraSettings) return
        updateProject({
            cameraSettings: {
                ...currentProject.cameraSettings,
                angle: value[0]
            }
        })
    }

    const AnimationPreview = ({ animationId, className }: { animationId: string, className?: string }) => {
        const animation = cameraAnimations.find(anim => anim.id === animationId)

        if (!animation) {
            return (
                <div className={`bg-gray-800 rounded flex items-center justify-center ${className}`}>
                    <div className="text-gray-500 text-xs">Not found</div>
                </div>
            )
        }

        if (animationId === 'none') {
            return (
                <div className={`bg-primary rounded flex items-center justify-center ${className}`}>
                    <Image
                        src={animation.preview}
                        alt={animation.name}
                        width={30}
                        height={30}
                        className="object-contain"
                    />
                </div>
            )
        }

        return (
            <div className={`bg-black rounded overflow-hidden ${className}`}>
                <video
                    src={animation.preview}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                />
            </div>
        )
    }

    return (
        <div className="p-4 space-y-6 h-full overflow-y-auto">
            <div>
                <h2 className="text-xl font-semibold text-white">Animation</h2>
            </div>
            <div>
                <h3 className="text-lg font-medium text-white mb-4">Camera animation style</h3>
                <div className="grid grid-cols-2 gap-3">
                    {cameraAnimations.map((camera) => (
                        <div
                            key={camera.id}
                            onClick={() => handleCameraSelect(camera.id)}
                            className={`cursor-pointer rounded-lg overflow-hidden transition-all ${selectedCamera === camera.id
                                ? 'ring-2 ring-primary-foreground'
                                : 'hover:ring-1 hover:ring-gray-500'
                                }`}
                        >
                            <AnimationPreview animationId={camera.id} className="aspect-video" />
                            <div className="p-3 bg-card">
                                <h4 className="text-sm font-medium text-white text-center">{camera.name}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {currentProject?.cameraSettings && (
                <div className="space-y-4">
                    {currentProject.cameraSettings.type === 'skewed_glide' && (
                        <>
                            <div>
                                <h4 className="text-sm font-medium text-white mb-3">Movement direction</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['up', 'down', 'left', 'right', 'diagonal'] as const).map((dir) => (
                                        <Button
                                            key={dir}
                                            variant={currentProject.cameraSettings?.direction === dir ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleDirectionChange(dir)}
                                            className="text-xs capitalize"
                                        >
                                            {dir === 'diagonal' ? '↗' : dir === 'up' ? '↑' : dir === 'down' ? '↓' : dir === 'left' ? '←' : '→'}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-white">Skew angle</h4>
                                    <span className="text-xs text-gray-400">{currentProject.cameraSettings.angle || 0}°</span>
                                </div>
                                <Slider
                                    value={[currentProject.cameraSettings.angle || 0]}
                                    onValueChange={handleAngleChange}
                                    min={-90}
                                    max={90}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                        </>
                    )}

                    {currentProject.cameraSettings.type === 'orbit_glide' && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-white">Intensity</h4>
                                <span className="text-xs text-gray-400">{((currentProject.cameraSettings.intensity || 1) * 10).toFixed(0)}</span>
                            </div>
                            <Slider
                                value={[currentProject.cameraSettings.intensity || 1]}
                                onValueChange={handleIntensityChange}
                                min={0.1}
                                max={2}
                                step={0.1}
                                className="w-full"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
