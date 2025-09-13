'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Upload, Type, Image, Sparkles, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'

const logoTemplates = [
    {
        id: 'none',
        name: 'None',
        description: 'No logo overlay',
        animation: 'none',
        icon: null
    },
    {
        id: 'fade-in',
        name: 'Fade In',
        description: 'Simple fade in animation',
        animation: 'fadeIn',
        icon: <Sparkles className="h-4 w-4" />
    },
    {
        id: 'slide-down',
        name: 'Slide Down',
        description: 'Slide from top with fade',
        animation: 'slideDown',
        icon: <ArrowDown className="h-4 w-4" />
    },
    {
        id: 'slide-left',
        name: 'Slide Left',
        description: 'Slide from right with fade',
        animation: 'slideLeft',
        icon: <ArrowLeft className="h-4 w-4" />
    },
    {
        id: 'slide-right',
        name: 'Slide Right',
        description: 'Slide from left with fade',
        animation: 'slideRight',
        icon: <ArrowRight className="h-4 w-4" />
    }
]

const positionPresets = [
    { id: 'top-left', name: 'Top Left', x: 50, y: 50 },
    { id: 'top-center', name: 'Top Center', x: 50, y: 50 },
    { id: 'top-right', name: 'Top Right', x: 85, y: 50 },
    { id: 'center', name: 'Center', x: 50, y: 50 },
    { id: 'bottom-left', name: 'Bottom Left', x: 15, y: 85 },
    { id: 'bottom-center', name: 'Bottom Center', x: 50, y: 85 },
    { id: 'bottom-right', name: 'Bottom Right', x: 85, y: 85 }
]

export function LogoHeadlinePanel() {
    const { currentTime, addAnimation, currentProject } = useEditorStore()
    const [selectedTemplate, setSelectedTemplate] = useState<string>('none')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoUrl, setLogoUrl] = useState<string>('')
    const [headlineText, setHeadlineText] = useState('')
    const [subheadlineText, setSubheadlineText] = useState('')
    const [duration, setDuration] = useState([3])
    const [logoSize, setLogoSize] = useState([100])
    const [position, setPosition] = useState({ x: 85, y: 85 }) // Default bottom-right come negli screenshot

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setLogoFile(file)
        const url = URL.createObjectURL(file)
        setLogoUrl(url)
    }

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId)

        if (templateId === 'none') return

        // Crea animazione per il logo se presente
        if (logoUrl || headlineText) {
            const template = logoTemplates.find(t => t.id === templateId)
            if (!template) return

            const logoAnimation = {
                type: 'logo' as const,
                startTime: currentTime,
                endTime: currentTime + duration[0],
                properties: {
                    logoUrl,
                    headlineText,
                    subheadlineText,
                    animation: template.animation,
                    size: logoSize[0],
                    position: position,
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: '#ffffff',
                    logoOpacity: 0.9
                }
            }

            addAnimation(logoAnimation)
        }
    }

    const handlePositionPreset = (preset: typeof positionPresets[0]) => {
        setPosition({ x: preset.x, y: preset.y })
    }

    const addHeadlineOnly = () => {
        if (!headlineText) return

        const animation = {
            type: 'text' as const,
            startTime: currentTime,
            endTime: currentTime + duration[0],
            properties: {
                content: headlineText,
                subtitle: subheadlineText,
                x: (position.x / 100) * 800, // Assumendo una larghezza di 800px
                y: (position.y / 100) * 600, // Assumendo un'altezza di 600px
                fontSize: 32,
                fontWeight: 'bold',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '12px 24px',
                borderRadius: '8px',
                animation: selectedTemplate !== 'none' ? logoTemplates.find(t => t.id === selectedTemplate)?.animation : 'fadeIn'
            }
        }

        addAnimation(animation)
    }

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-2">Logo & Headlines</h2>
                <p className="text-sm text-gray-400">Add logo and text overlays to your video</p>
            </div>

            {/* Logo Upload */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Logo</h3>
                <label className="block w-full">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        className="w-full border-gray-600 hover:bg-gray-700"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {logoFile ? logoFile.name : 'Upload Logo'}
                    </Button>
                </label>

                {logoUrl && (
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-3">
                            <img
                                src={logoUrl}
                                alt="Logo preview"
                                className="w-12 h-12 object-contain bg-gray-700 rounded"
                            />
                            <div className="flex-1">
                                <p className="text-sm text-white">{logoFile?.name}</p>
                                <p className="text-xs text-gray-400">Logo caricato</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Headlines */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Headlines</h3>
                <div className="space-y-2">
                    <Input
                        placeholder="Main headline..."
                        value={headlineText}
                        onChange={(e) => setHeadlineText(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                    <Input
                        placeholder="Subheadline (optional)..."
                        value={subheadlineText}
                        onChange={(e) => setSubheadlineText(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                </div>

                <Button
                    onClick={addHeadlineOnly}
                    disabled={!headlineText}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                    <Type className="mr-2 h-4 w-4" />
                    Add Headline
                </Button>
            </div>

            {/* Animation Templates */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Animation Style</h3>
                <div className="grid grid-cols-2 gap-2">
                    {logoTemplates.map((template) => (
                        <Card
                            key={template.id}
                            className={`p-3 cursor-pointer transition-all hover:bg-gray-750 ${selectedTemplate === template.id
                                ? 'bg-blue-600 border-blue-500'
                                : 'bg-gray-800 border-gray-700'
                                }`}
                            onClick={() => handleTemplateSelect(template.id)}
                        >
                            <div className="flex items-center space-x-2 mb-2">
                                {template.icon}
                                <h4 className="text-sm font-medium text-white">{template.name}</h4>
                            </div>
                            <p className="text-xs text-gray-400">{template.description}</p>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Position Presets */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Position</h3>
                <div className="grid grid-cols-3 gap-2">
                    {positionPresets.map((preset) => (
                        <Button
                            key={preset.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handlePositionPreset(preset)}
                            className={`text-xs border-gray-600 hover:bg-gray-700 ${position.x === preset.x && position.y === preset.y
                                ? 'bg-gray-700 border-gray-500'
                                : ''
                                }`}
                        >
                            {preset.name}
                        </Button>
                    ))}
                </div>

                {/* Custom Position */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">X (%)</label>
                        <Input
                            type="number"
                            value={position.x}
                            onChange={(e) => setPosition(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                            className="h-8 text-sm bg-gray-800 border-gray-600"
                            min="0"
                            max="100"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Y (%)</label>
                        <Input
                            type="number"
                            value={position.y}
                            onChange={(e) => setPosition(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                            className="h-8 text-sm bg-gray-800 border-gray-600"
                            min="0"
                            max="100"
                        />
                    </div>
                </div>
            </div>

            {/* Logo Size */}
            {logoUrl && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-300">Logo Size</label>
                        <span className="text-sm text-gray-400">{logoSize[0]}%</span>
                    </div>
                    <Slider
                        value={logoSize}
                        onValueChange={setLogoSize}
                        max={200}
                        min={25}
                        step={5}
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
                    max={10}
                    min={0.5}
                    step={0.5}
                    className="w-full"
                />
            </div>

            {/* Apply Button */}
            <Button
                onClick={() => handleTemplateSelect(selectedTemplate)}
                disabled={!logoUrl && !headlineText}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
                <Image className="mr-2 h-4 w-4" />
                Apply Logo & Headlines
            </Button>

            {/* Preview Info */}
            {(logoUrl || headlineText) && (
                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-medium text-white mb-2">Preview Settings</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                        {logoUrl && <div>Logo: {logoFile?.name}</div>}
                        {headlineText && <div>Headline: &quot;{headlineText}&quot;</div>}
                        <div>Position: {position.x}%, {position.y}%</div>
                        <div>Duration: {duration[0]}s</div>
                        <div>Animation: {logoTemplates.find(t => t.id === selectedTemplate)?.name}</div>
                    </div>
                </div>
            )}
        </div>
    )
}
