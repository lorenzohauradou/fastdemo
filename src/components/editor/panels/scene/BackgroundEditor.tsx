'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ArrowLeft, Shuffle } from 'lucide-react'
import { BackgroundSettings, Project } from '@/lib/store'
import { generateRandomMeshGradient } from '@/lib/meshGradientUtils'
import { ColorPickerModal } from './ColorPickerModal'
import { useState, useEffect } from 'react'

interface BackgroundEditorProps {
    currentProject: Project | null
    onBack: () => void
    onUpdateProject: (updates: Partial<Project>) => void
}

export function BackgroundEditor({ currentProject, onBack, onUpdateProject }: BackgroundEditorProps) {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [selectedColorMode, setSelectedColorMode] = useState<string>('')
    const [presetImages, setPresetImages] = useState<{ url: string, remotionPath: string }[]>([])
    const [loadingImages, setLoadingImages] = useState(false)
    const COLOR_PRESETS = [
        { name: 'White', color: '#ffffff' },
        { name: 'Light', color: '#E1D9D1' },
        { name: 'Primary', color: currentProject?.primaryColor || '#3B82F6' },
        { name: 'Dark', color: '#1e293b' },
        { name: 'Black', color: '#000000' },
        { name: 'Custom', color: '#3B82F6' }
    ]

    const BACKGROUND_TYPES = [
        { id: 'solid', name: 'Solid' },
        { id: 'linear-gradient', name: 'Linear\ngradient' },
        { id: 'mesh-gradient', name: 'Mesh\ngradient' },
        { id: 'image', name: 'Images' }
    ]

    const currentType = currentProject?.backgroundSettings?.type || 'solid'

    const getCurrentSelectedColor = () => {
        const bg = currentProject?.backgroundSettings
        if (!bg) return currentProject?.primaryColor || '#3B82F6'

        switch (bg.type) {
            case 'solid':
                return bg.color || currentProject?.primaryColor || '#3B82F6'
            case 'linear-gradient':
                return bg.gradientColors?.[0] || currentProject?.primaryColor || '#3B82F6'
            case 'mesh-gradient':
                return bg.meshColors?.[0] || currentProject?.primaryColor || '#3B82F6'
            default:
                return currentProject?.primaryColor || '#3B82F6'
        }
    }

    // Inizializza selectedColorMode con il colore corrente
    useEffect(() => {
        if (!selectedColorMode) {
            setSelectedColorMode(getCurrentSelectedColor())
        }
    }, [currentProject])

    // Carica le immagini preset quando il componente si monta
    useEffect(() => {
        const loadPresetImages = async () => {
            setLoadingImages(true)
            try {
                const response = await fetch('/api/bg-images')
                if (response.ok) {
                    const images = await response.json()
                    setPresetImages(images)
                }
            } catch (error) {
                console.error('Error loading preset images:', error)
            } finally {
                setLoadingImages(false)
            }
        }

        loadPresetImages()
    }, [])

    const currentColor = selectedColorMode || getCurrentSelectedColor()

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
        // Aggiorna il colore selezionato in Color mode
        setSelectedColorMode(color)

        const currentType = currentProject?.backgroundSettings?.type || 'solid'

        const settings: BackgroundSettings = {
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
        }

        onUpdateProject({ backgroundSettings: settings })
    }

    const handleTypeSelect = (type: 'solid' | 'linear-gradient' | 'mesh-gradient' | 'image') => {
        const selectedColor = selectedColorMode || getCurrentSelectedColor()

        const settings: BackgroundSettings = {
            type: type,
            opacity: 1
        }

        switch (type) {
            case 'solid':
                settings.color = selectedColor
                break
            case 'linear-gradient':
                settings.gradientColors = [selectedColor, adjustColorBrightness(selectedColor, -20)]
                settings.gradientAngle = 180
                break
            case 'mesh-gradient':
                const meshConfig = generateRandomMeshGradient(selectedColor)
                settings.meshColors = meshConfig.colors
                settings.meshSeed = meshConfig.seed
                break
            case 'image':
                settings.imageUrl = presetImages[0]?.url || ''
                settings.imageRemotionPath = presetImages[0]?.remotionPath || ''
                break
        }

        onUpdateProject({ backgroundSettings: settings })
    }

    const randomizeMesh = () => {
        const selectedColor = selectedColorMode || getCurrentSelectedColor()

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


    const handleImagePresetSelect = (imageData: { url: string, remotionPath: string }) => {
        onUpdateProject({
            backgroundSettings: {
                type: 'image',
                imageUrl: imageData.url,
                imageRemotionPath: imageData.remotionPath,
                opacity: 1
            }
        })
    }

    const handleColorPickerSelect = (color: string) => {
        setSelectedColorMode(color)
        handleColorSelect(color)
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
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground">Color mode</h3>
                    </div>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {COLOR_PRESETS.filter(preset => preset.name !== 'Custom').map((preset) => (
                            <div key={preset.name} className="flex-shrink-0">
                                <div
                                    className={`w-12 h-12 rounded-lg cursor-pointer border-2 transition-all hover:scale-105 ${currentColor === preset.color
                                        ? 'border-primary ring-2 ring-primary/20'
                                        : 'border-border'
                                        }`}
                                    style={{ backgroundColor: preset.color }}
                                    onClick={() => handleColorSelect(preset.color)}
                                />
                            </div>
                        ))}
                        <div className="flex-shrink-0">
                            <div
                                className="w-12 h-12 rounded-lg cursor-pointer border-2 transition-all hover:scale-105 border-border flex items-center justify-center"
                                style={{ backgroundColor: currentColor }}
                                onClick={() => setShowColorPicker(true)}
                            >
                                <span className="text-xs font-bold text-white drop-shadow">+</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-foreground mb-4">Type</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {BACKGROUND_TYPES.map((type) => (
                            <div key={type.id} className="text-center">
                                <div
                                    className={`w-full h-16 rounded-lg mb-2 border-2 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center overflow-hidden ${currentType === type.id
                                        ? 'border-primary ring-2 ring-primary/20'
                                        : 'border-border'
                                        }`}
                                    style={{ backgroundColor: currentType === type.id ? currentColor : '#374151' }}
                                    onClick={() => handleTypeSelect(type.id as any)}
                                >
                                    {type.id === 'image' && presetImages.length > 0 ? (
                                        <img
                                            src={presetImages[7].url}
                                            alt="Background preset"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : null}
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
                    <div>
                        <h3 className="text-sm font-medium text-foreground mb-3">Background Images</h3>
                        {loadingImages ? (
                            <div className="text-center py-4">
                                <div className="text-sm text-muted-foreground">Loading images...</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {presetImages.map((imageData, index) => (
                                    <div
                                        key={index}
                                        className={`aspect-square rounded-lg cursor-pointer border-2 transition-all hover:scale-105 overflow-hidden ${currentProject?.backgroundSettings?.imageUrl === imageData.url
                                            ? 'border-primary ring-2 ring-primary/20'
                                            : 'border-border'
                                            }`}
                                        onClick={() => handleImagePresetSelect(imageData)}
                                    >
                                        <img
                                            src={imageData.url}
                                            alt={`Background preset ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ColorPickerModal
                isOpen={showColorPicker}
                onClose={() => setShowColorPicker(false)}
                onColorSelect={handleColorPickerSelect}
            />
        </div>
    )
}
