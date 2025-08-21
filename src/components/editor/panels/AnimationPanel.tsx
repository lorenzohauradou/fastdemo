'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { ZoomIn, Move, Sparkles } from 'lucide-react'

const animationTemplates = [
    {
        id: 'basic',
        name: 'Basic',
        description: 'Simple zoom and pan',
        preview: '/animations/basic-preview.gif',
        type: 'zoom' as const
    },
    {
        id: 'continuous-glide',
        name: 'Continuous Glide',
        description: 'Smooth continuous movement',
        preview: '/animations/glide-preview.gif',
        type: 'pan' as const
    },
    {
        id: 'skewed',
        name: 'Skewed',
        description: 'Angled perspective movement',
        preview: '/animations/skewed-preview.gif',
        type: 'pan' as const
    },
    {
        id: 'orbit-glide',
        name: 'Orbit Glide',
        description: 'Circular motion around point',
        preview: '/animations/orbit-preview.gif',
        type: 'pan' as const
    }
]

export function AnimationPanel() {
    const {
        currentTime,
        addAnimation,
        selectedAnimation
    } = useEditorStore()

    const [intensity, setIntensity] = useState([5])
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

    const handleAddZoom = () => {
        const animation = {
            type: 'zoom' as const,
            startTime: currentTime,
            endTime: currentTime + 3,
            properties: {
                level: 1 + (intensity[0] / 10),
                x: 0,
                y: 0
            }
        }

        addAnimation(animation)
    }

    const handleAddPan = () => {
        const animation = {
            type: 'pan' as const,
            startTime: currentTime,
            endTime: currentTime + 3,
            properties: {
                from_x: 0,
                from_y: 0,
                to_x: intensity[0] * 10,
                to_y: intensity[0] * 5
            }
        }

        addAnimation(animation)
    }

    const handleTemplateSelect = (templateId: string) => {
        const template = animationTemplates.find(t => t.id === templateId)
        if (!template) return

        setSelectedTemplate(templateId)

        let animation
        switch (template.id) {
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

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-2">Animation</h2>
                <p className="text-sm text-gray-400">Add camera movements and effects</p>
            </div>

            {/* Camera Animation Style */}
            <div>
                <h3 className="text-sm font-medium text-white mb-3">Camera animation style</h3>
                <div className="grid grid-cols-2 gap-3">
                    {animationTemplates.map((template) => (
                        <Card
                            key={template.id}
                            className={`p-3 bg-gray-800 border-gray-700 cursor-pointer transition-all hover:bg-gray-750 ${selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                                }`}
                            onClick={() => handleTemplateSelect(template.id)}
                        >
                            <div className="aspect-video bg-gray-700 rounded mb-2 flex items-center justify-center">
                                <div className="w-8 h-8 bg-blue-500 rounded animate-pulse" />
                            </div>
                            <h4 className="text-sm font-medium text-white">{template.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Intensity Control */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Intensity</label>
                    <span className="text-sm text-gray-400">{intensity[0]}</span>
                </div>
                <Slider
                    value={intensity}
                    onValueChange={setIntensity}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                />
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Quick Actions</h3>

                <Button
                    onClick={handleAddZoom}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                    <ZoomIn className="mr-2 h-4 w-4" />
                    Add Zoom
                </Button>

                <Button
                    onClick={handleAddPan}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Move className="mr-2 h-4 w-4" />
                    Add Pan
                </Button>
            </div>

            {/* Intro Templates */}
            <div>
                <h3 className="text-sm font-medium text-white mb-3">Intro</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3 bg-blue-600 cursor-pointer hover:bg-blue-700 transition-colors">
                        <div className="aspect-video bg-blue-700 rounded mb-2 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-sm font-medium text-white">None</h4>
                    </Card>

                    <Card className="p-3 bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors">
                        <div className="aspect-video bg-gray-700 rounded mb-2 flex items-center justify-center">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded" />
                        </div>
                        <h4 className="text-sm font-medium text-white">Slide down and fade</h4>
                    </Card>

                    <Card className="p-3 bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors">
                        <div className="aspect-video bg-gray-700 rounded mb-2 flex items-center justify-center">
                            <div className="w-6 h-6 bg-gradient-to-l from-green-400 to-blue-500 rounded" />
                        </div>
                        <h4 className="text-sm font-medium text-white">Slide left and fade</h4>
                    </Card>

                    <Card className="p-3 bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors">
                        <div className="aspect-video bg-gray-700 rounded mb-2 flex items-center justify-center">
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded" />
                        </div>
                        <h4 className="text-sm font-medium text-white">Slide right and fade</h4>
                    </Card>
                </div>
            </div>

            {/* Current Animation Info */}
            {selectedAnimation && (
                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-medium text-white mb-2">Selected Animation</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                        <div>Type: {selectedAnimation.type}</div>
                        <div>Start: {selectedAnimation.startTime.toFixed(1)}s</div>
                        <div>End: {selectedAnimation.endTime.toFixed(1)}s</div>
                        <div>Duration: {(selectedAnimation.endTime - selectedAnimation.startTime).toFixed(1)}s</div>
                    </div>
                </div>
            )}
        </div>
    )
}
