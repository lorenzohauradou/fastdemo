'use client'

import { useState, useEffect } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

export function ZoomControls() {
    const { currentProject, currentTime, addAnimation } = useEditorStore()
    const [videoZoom, setVideoZoom] = useState([100]) // Zoom percentuale del video
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
    const [isZoomActive, setIsZoomActive] = useState(false)

    // Preset di zoom comuni come negli screenshot
    const zoomPresets = [
        { label: '3.8x', value: 380 },
        { label: '4x', value: 400 },
        { label: '3.4x', value: 340 },
        { label: '3.3x', value: 330 },
        { label: '3.76x', value: 376 },
        { label: '3.62x', value: 362 },
        { label: '3.34x', value: 334 }
    ]

    const handleZoomChange = (value: number[]) => {
        setVideoZoom(value)
        if (value[0] !== 100) {
            setIsZoomActive(true)
        } else {
            setIsZoomActive(false)
        }
    }

    const handlePresetZoom = (zoomValue: number) => {
        setVideoZoom([zoomValue])
        setIsZoomActive(true)

        // Aggiungi automaticamente un'animazione di zoom alla timeline
        const animation = {
            type: 'zoom' as const,
            startTime: currentTime,
            endTime: currentTime + 2,
            properties: {
                level: zoomValue / 100,
                x: zoomPosition.x,
                y: zoomPosition.y
            }
        }
        addAnimation(animation)
    }

    const resetZoom = () => {
        setVideoZoom([100])
        setZoomPosition({ x: 0, y: 0 })
        setIsZoomActive(false)
    }

    const handleManualZoomInput = (value: string) => {
        const numValue = parseFloat(value)
        if (!isNaN(numValue) && numValue > 0) {
            setVideoZoom([numValue])
            setIsZoomActive(numValue !== 100)
        }
    }

    return (
        <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 min-w-[280px] border border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">Zoom Controls</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetZoom}
                    className="text-gray-400 hover:text-white"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>

            {/* Zoom Presets - Stile degli screenshot */}
            <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Quick Zoom</label>
                <div className="flex flex-wrap gap-2">
                    {zoomPresets.map((preset) => (
                        <Button
                            key={preset.value}
                            variant="outline"
                            size="sm"
                            onClick={() => handlePresetZoom(preset.value)}
                            className={`text-xs px-2 py-1 h-7 border-amber-500/50 text-amber-400 hover:bg-amber-500/20 ${videoZoom[0] === preset.value ? 'bg-amber-500/30 border-amber-400' : ''
                                }`}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Manual Zoom Input */}
            <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Manual Zoom (%)</label>
                <div className="flex items-center space-x-2">
                    <Input
                        type="number"
                        value={videoZoom[0]}
                        onChange={(e) => handleManualZoomInput(e.target.value)}
                        className="flex-1 h-8 text-sm bg-gray-800 border-gray-600"
                        min="10"
                        max="1000"
                        step="0.1"
                    />
                    <span className="text-xs text-gray-400">%</span>
                </div>
            </div>

            {/* Zoom Slider */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-400">Zoom Level</label>
                    <span className="text-xs text-amber-400">{(videoZoom[0] / 100).toFixed(2)}x</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleZoomChange([Math.max(10, videoZoom[0] - 10)])}
                        className="text-gray-400 hover:text-white p-1 h-7 w-7"
                    >
                        <ZoomOut className="h-3 w-3" />
                    </Button>

                    <Slider
                        value={videoZoom}
                        onValueChange={handleZoomChange}
                        max={500}
                        min={10}
                        step={1}
                        className="flex-1"
                    />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleZoomChange([Math.min(500, videoZoom[0] + 10)])}
                        className="text-gray-400 hover:text-white p-1 h-7 w-7"
                    >
                        <ZoomIn className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Position Controls */}
            {isZoomActive && (
                <div className="border-t border-gray-700 pt-4">
                    <label className="text-xs text-gray-400 mb-2 block">Zoom Position</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-500">X</label>
                            <Input
                                type="number"
                                value={zoomPosition.x}
                                onChange={(e) => setZoomPosition(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                                className="h-7 text-xs bg-gray-800 border-gray-600"
                                step="10"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Y</label>
                            <Input
                                type="number"
                                value={zoomPosition.y}
                                onChange={(e) => setZoomPosition(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                                className="h-7 text-xs bg-gray-800 border-gray-600"
                                step="10"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Status Indicator */}
            {isZoomActive && (
                <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400">
                    Zoom attivo: {(videoZoom[0] / 100).toFixed(2)}x
                </div>
            )}
        </div>
    )
}
