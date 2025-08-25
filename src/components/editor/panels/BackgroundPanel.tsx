'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Upload, Palette, Image as ImageIcon, Monitor } from 'lucide-react'

const backgroundTypes = [
    {
        id: 'none',
        name: 'None',
        description: 'Transparent background',
        type: 'none',
        preview: 'transparent'
    },
    {
        id: 'solid-black',
        name: 'Solid Black',
        description: 'Pure black background',
        type: 'solid',
        color: '#000000',
        preview: '#000000'
    },
    {
        id: 'solid-white',
        name: 'Solid White',
        description: 'Pure white background',
        type: 'solid',
        color: '#ffffff',
        preview: '#ffffff'
    },
    {
        id: 'gradient-blue',
        name: 'Blue Gradient',
        description: 'Blue to purple gradient',
        type: 'gradient',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        id: 'gradient-sunset',
        name: 'Sunset Gradient',
        description: 'Orange to pink gradient',
        type: 'gradient',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
        id: 'gradient-ocean',
        name: 'Ocean Gradient',
        description: 'Blue to teal gradient',
        type: 'gradient',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
        id: 'gradient-forest',
        name: 'Forest Gradient',
        description: 'Green to dark green gradient',
        type: 'gradient',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        preview: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
        id: 'blur-light',
        name: 'Light Blur',
        description: 'Soft light background',
        type: 'blur',
        color: '#f8fafc',
        blur: 20,
        preview: '#f8fafc'
    },
    {
        id: 'blur-dark',
        name: 'Dark Blur',
        description: 'Soft dark background',
        type: 'blur',
        color: '#1e293b',
        blur: 20,
        preview: '#1e293b'
    }
]

export function BackgroundPanel() {
    const { currentTime, addAnimation, currentProject, updateProject } = useEditorStore()
    const [selectedBackground, setSelectedBackground] = useState<string>('none')
    const [customColor, setCustomColor] = useState('#000000')
    const [customImage, setCustomImage] = useState<File | null>(null)
    const [customImageUrl, setCustomImageUrl] = useState('')
    const [opacity, setOpacity] = useState([80])
    const [blur, setBlur] = useState([0])
    const [duration, setDuration] = useState([5])

    const handleBackgroundSelect = (backgroundId: string) => {
        const background = backgroundTypes.find(bg => bg.id === backgroundId)
        if (!background) return

        setSelectedBackground(backgroundId)

        // Aggiorna le impostazioni del progetto
        if (background.type === 'none') {
            updateProject({
                backgroundSettings: {
                    type: 'none'
                }
            })
        } else {
            updateProject({
                backgroundSettings: {
                    type: background.type,
                    color: background.color,
                    gradient: background.gradient,
                    blur: background.blur,
                    opacity: opacity[0] / 100
                }
            })

            // animazione background
            const animation = {
                type: 'background' as const,
                startTime: currentTime,
                endTime: currentTime + duration[0],
                properties: {
                    backgroundType: background.type,
                    color: background.color,
                    gradient: background.gradient,
                    blur: background.blur || blur[0],
                    opacity: opacity[0] / 100
                }
            }

            addAnimation(animation)
        }
    }

    const handleCustomColorSelect = () => {
        updateProject({
            backgroundSettings: {
                type: 'solid',
                color: customColor,
                opacity: opacity[0] / 100
            }
        })

        const animation = {
            type: 'background' as const,
            startTime: currentTime,
            endTime: currentTime + duration[0],
            properties: {
                backgroundType: 'solid',
                color: customColor,
                opacity: opacity[0] / 100
            }
        }

        addAnimation(animation)
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setCustomImage(file)
        const url = URL.createObjectURL(file)
        setCustomImageUrl(url)

        updateProject({
            backgroundSettings: {
                type: 'image',
                imageUrl: url,
                opacity: opacity[0] / 100,
                blur: blur[0]
            }
        })

        const animation = {
            type: 'background' as const,
            startTime: currentTime,
            endTime: currentTime + duration[0],
            properties: {
                backgroundType: 'image',
                imageUrl: url,
                opacity: opacity[0] / 100,
                blur: blur[0]
            }
        }

        addAnimation(animation)
    }

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-2">Background</h2>
                <p className="text-sm text-gray-400">Customize your video background</p>
            </div>

            {/* Background Presets */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Presets</h3>
                <div className="grid grid-cols-2 gap-3">
                    {backgroundTypes.map((bg) => (
                        <Card
                            key={bg.id}
                            className={`p-3 cursor-pointer transition-all hover:bg-gray-750 ${selectedBackground === bg.id
                                ? 'ring-2 ring-blue-500'
                                : 'bg-gray-800 border-gray-700'
                                }`}
                            onClick={() => handleBackgroundSelect(bg.id)}
                        >
                            <div
                                className="aspect-video rounded mb-2 border border-gray-600"
                                style={{
                                    background: bg.preview === 'transparent'
                                        ? 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px'
                                        : bg.preview
                                }}
                            />
                            <h4 className="text-sm font-medium text-white">{bg.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">{bg.description}</p>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Custom Color */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Custom Color</h3>
                <div className="flex items-center space-x-2">
                    <Input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-16 h-10 p-1 bg-gray-800 border-gray-600"
                    />
                    <Input
                        type="text"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="flex-1 bg-gray-800 border-gray-600 text-white"
                        placeholder="#000000"
                    />
                    <Button
                        onClick={handleCustomColorSelect}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Palette className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Custom Image */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Custom Image</h3>
                <label className="block w-full">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        className="w-full border-gray-600 hover:bg-gray-700"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {customImage ? customImage.name : 'Upload Background Image'}
                    </Button>
                </label>

                {customImageUrl && (
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-3">
                            <img
                                src={customImageUrl}
                                alt="Background preview"
                                className="w-16 h-12 object-cover bg-gray-700 rounded"
                            />
                            <div className="flex-1">
                                <p className="text-sm text-white">{customImage?.name}</p>
                                <p className="text-xs text-gray-400">Background image loaded</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Opacity Control */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Opacity</label>
                    <span className="text-sm text-gray-400">{opacity[0]}%</span>
                </div>
                <Slider
                    value={opacity}
                    onValueChange={setOpacity}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                />
            </div>

            {/* Blur Control */}
            {(customImageUrl || selectedBackground.includes('blur')) && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-300">Blur</label>
                        <span className="text-sm text-gray-400">{blur[0]}px</span>
                    </div>
                    <Slider
                        value={blur}
                        onValueChange={setBlur}
                        max={50}
                        min={0}
                        step={1}
                        className="w-full"
                    />
                </div>
            )}

            {/* Duration */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Duration</label>
                    <span className="text-sm text-gray-400">{duration[0]}s</span>
                </div>
                <Slider
                    value={duration}
                    onValueChange={setDuration}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                />
            </div>

            {/* Current Background Info */}
            {currentProject?.backgroundSettings && (
                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-medium text-white mb-2">Current Background</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                        <div>Type: {currentProject.backgroundSettings.type}</div>
                        {currentProject.backgroundSettings.color && (
                            <div>Color: {currentProject.backgroundSettings.color}</div>
                        )}
                        <div>Opacity: {Math.round((currentProject.backgroundSettings.opacity || 1) * 100)}%</div>
                        {currentProject.backgroundSettings.blur && (
                            <div>Blur: {currentProject.backgroundSettings.blur}px</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
