'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ArrowLeft, Upload, Shuffle } from 'lucide-react'
import { BackgroundSettings, Project } from '@/lib/store'
import { generateRandomMeshGradient } from '@/lib/meshGradientUtils'

interface BackgroundEditorProps {
    currentProject: Project | null
    onBack: () => void
    onUpdateProject: (updates: Partial<Project>) => void
}

export function BackgroundEditor({ currentProject, onBack, onUpdateProject }: BackgroundEditorProps) {
    const COLOR_PRESETS = [
        { name: 'White', color: '#ffffff' },
        { name: 'Light', color: '#f8fafc' },
        { name: 'Primary', color: currentProject?.primaryColor || '#6366f1' },
        { name: 'Dark', color: '#1e293b' },
        { name: 'Black', color: '#000000' },
        { name: 'Custom', color: '#667eea' }
    ]

    const BACKGROUND_TYPES = [
        { id: 'solid', name: 'Solid' },
        { id: 'linear-gradient', name: 'Linear\ngradient' },
        { id: 'mesh-gradient', name: 'Mesh\ngradient' },
        { id: 'image', name: 'Image' }
    ]

    const IMAGE_PRESETS = [
        {
            id: 'gradient-1',
            name: 'Gradient 1',
            url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grad1)" />
                </svg>
            `)
        },
        {
            id: 'gradient-2',
            name: 'Gradient 2',
            url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grad2)" />
                </svg>
            `)
        },
        {
            id: 'gradient-3',
            name: 'Gradient 3',
            url: 'data:image/svg+xml;base64=' + btoa(`
                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grad3)" />
                </svg>
            `)
        },
        {
            id: 'gradient-4',
            name: 'Gradient 4',
            url: 'data:image/svg+xml;base64=' + btoa(`
                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#43e97b;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#38f9d7;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grad4)" />
                </svg>
            `)
        },
        {
            id: 'gradient-5',
            name: 'Gradient 5',
            url: 'data:image/svg+xml;base64=' + btoa(`
                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fa709a;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#fee140;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grad5)" />
                </svg>
            `)
        },
        {
            id: 'gradient-6',
            name: 'Gradient 6',
            url: 'data:image/svg+xml;base64=' + btoa(`
                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#a8edea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#fed6e3;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grad6)" />
                </svg>
            `)
        }
    ]

    const currentType = currentProject?.backgroundSettings?.type || 'solid'

    const getCurrentSelectedColor = () => {
        const bg = currentProject?.backgroundSettings
        if (!bg) return currentProject?.primaryColor || '#6366f1'

        switch (bg.type) {
            case 'solid':
                return bg.color || currentProject?.primaryColor || '#6366f1'
            case 'linear-gradient':
                return bg.gradientColors?.[0] || currentProject?.primaryColor || '#6366f1'
            case 'mesh-gradient':
                return bg.meshColors?.[0] || currentProject?.primaryColor || '#6366f1'
            default:
                return currentProject?.primaryColor || '#6366f1'
        }
    }

    const currentColor = getCurrentSelectedColor()

    const adjustColorBrightness = (color: string, amount: number): string => {
        const num = parseInt(color.replace('#', ''), 16)
        const amt = Math.round(2.55 * amount)
        const R = (num >> 16) + amt
        const G = (num >> 8 & 0x00FF) + amt
        const B = (num & 0x0000FF) + amt
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
    }

    const handleColorSelect = (color: string) => {
        const currentType = currentProject?.backgroundSettings?.type || 'solid'

        let settings: BackgroundSettings = {
            type: currentType,
            opacity: 1
        }

        switch (currentType) {
            case 'solid':
                settings.color = color
                break
            case 'linear-gradient':
                settings.gradientColors = [color, adjustColorBrightness(color, -20)]
                settings.gradientAngle = currentProject?.backgroundSettings?.gradientAngle || 180
                break
            case 'mesh-gradient':
                const meshConfig = generateRandomMeshGradient(color)
                settings.meshColors = meshConfig.colors
                settings.meshSeed = meshConfig.seed
                break
            case 'image':
                settings.imageUrl = currentProject?.backgroundSettings?.imageUrl || ''
                break
        }

        onUpdateProject({ backgroundSettings: settings })
    }

    const handleTypeSelect = (type: 'solid' | 'linear-gradient' | 'mesh-gradient' | 'image') => {
        const primaryColor = currentProject?.primaryColor || '#6366f1'

        let settings: BackgroundSettings = {
            type: type,
            opacity: 1
        }

        switch (type) {
            case 'solid':
                settings.color = primaryColor
                break
            case 'linear-gradient':
                settings.gradientColors = [primaryColor, adjustColorBrightness(primaryColor, -20)]
                settings.gradientAngle = 180
                break
            case 'mesh-gradient':
                const meshConfig = generateRandomMeshGradient(primaryColor)
                settings.meshColors = meshConfig.colors
                settings.meshSeed = meshConfig.seed
                break
            case 'image':
                settings.imageUrl = ''
                break
        }

        onUpdateProject({ backgroundSettings: settings })
    }

    const randomizeMesh = () => {
        const selectedColor = getCurrentSelectedColor()

        const meshConfig = generateRandomMeshGradient(selectedColor)
        onUpdateProject({
            backgroundSettings: {
                type: 'mesh-gradient',
                meshColors: meshConfig.colors,
                meshSeed: meshConfig.seed,
                opacity: 1
            }
        })
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const url = URL.createObjectURL(file)
        onUpdateProject({
            backgroundSettings: {
                type: 'image',
                imageUrl: url,
                opacity: 1
            }
        })
    }

    const handleImagePresetSelect = (presetUrl: string) => {
        onUpdateProject({
            backgroundSettings: {
                type: 'image',
                imageUrl: presetUrl,
                opacity: 1
            }
        })
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="h-8 w-8 p-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold text-foreground">Edit background</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-foreground">Color mode</h3>
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                            Edit theme
                        </Button>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                        {COLOR_PRESETS.map((preset) => (
                            <div key={preset.name} className="text-center">
                                <div
                                    className={`w-full h-12 rounded-lg mb-1 border-2 cursor-pointer hover:scale-105 transition-transform ${currentColor === preset.color
                                        ? 'border-primary ring-2 ring-primary/20'
                                        : 'border-border'
                                        }`}
                                    style={{ backgroundColor: preset.color }}
                                    onClick={() => handleColorSelect(preset.color)}
                                />
                                <p className="text-xs font-medium text-foreground">{preset.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-foreground mb-4">Type</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {BACKGROUND_TYPES.map((type) => (
                            <div key={type.id} className="text-center">
                                <div
                                    className={`w-full h-16 rounded-lg mb-2 border-2 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center ${currentType === type.id
                                        ? 'border-primary ring-2 ring-primary/20'
                                        : 'border-border'
                                        }`}
                                    style={{ backgroundColor: currentType === type.id ? currentColor : '#374151' }}
                                    onClick={() => handleTypeSelect(type.id as any)}
                                >
                                </div>
                                <p className="text-xs font-medium text-foreground whitespace-pre-line">{type.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {currentType === 'linear-gradient' && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-muted-foreground">Gradient angle</label>
                            <span className="text-sm text-muted-foreground">{currentProject?.backgroundSettings?.gradientAngle || 180}°</span>
                        </div>
                        <Slider
                            value={[currentProject?.backgroundSettings?.gradientAngle || 180]}
                            onValueChange={(value) => {
                                if (currentProject?.backgroundSettings) {
                                    onUpdateProject({
                                        backgroundSettings: {
                                            ...currentProject.backgroundSettings,
                                            gradientAngle: value[0]
                                        }
                                    })
                                }
                            }}
                            max={360}
                            min={0}
                            step={15}
                            className="w-full"
                        />
                    </div>
                )}

                {currentType === 'mesh-gradient' && (
                    <div>
                        <Button
                            onClick={randomizeMesh}
                            variant="outline"
                            className="w-full border-border hover:bg-muted"
                        >
                            <Shuffle className="mr-2 h-4 w-4" />
                            Randomize mesh
                        </Button>
                    </div>
                )}

                {currentType === 'image' && (
                    <div className="space-y-4">
                        <label className="block w-full">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                className="w-full border-border hover:bg-muted"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Background Image
                            </Button>
                        </label>

                        <div>
                            <h4 className="text-sm font-medium text-foreground mb-3">Presets</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {IMAGE_PRESETS.map((preset) => (
                                    <div key={preset.id} className="text-center">
                                        <div
                                            className={`w-full h-16 rounded-lg mb-1 border-2 cursor-pointer hover:scale-105 transition-transform overflow-hidden ${currentProject?.backgroundSettings?.imageUrl === preset.url
                                                ? 'border-primary ring-2 ring-primary/20'
                                                : 'border-border'
                                                }`}
                                            onClick={() => handleImagePresetSelect(preset.url)}
                                        >
                                            <img
                                                src={preset.url}
                                                alt={preset.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-xs font-medium text-foreground">{preset.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {currentProject?.backgroundSettings?.imageUrl && (
                            <div className="p-3 bg-muted rounded-lg border border-border">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={currentProject.backgroundSettings.imageUrl}
                                        alt="Background preview"
                                        className="w-16 h-12 object-cover bg-muted rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-foreground">Background image</p>
                                        <p className="text-xs text-muted-foreground">Image loaded</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
