'use client'

import { useState, useEffect } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Palette, X } from 'lucide-react'
import { ColorPickerModal } from './scene/ColorPickerModal'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function TextPanel() {
    const { currentTime, addAnimation, selectedAnimation, updateAnimation, setSelectedAnimation, getActiveClip, setIsEditingText, removeAnimation, currentProject } = useEditorStore()
    const [customText, setCustomText] = useState('')
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

    // has background
    const hasActiveBackground = () => {
        if (!currentProject?.backgroundSettings) return false
        const bg = currentProject.backgroundSettings
        return bg.type !== 'none' && bg.type !== undefined
    }

    const handleDeleteText = (textId: string, e: React.MouseEvent) => {
        e.stopPropagation() // Previene il click sulla card
        removeAnimation(textId)
        if (selectedAnimation?.id === textId) {
            setSelectedAnimation(null)
            setIsEditingText(false)
        }
    }

    const handleAddCustomText = () => {
        if (!customText.trim()) return

        const animation = {
            type: 'text' as const,
            startTime: currentTime,
            endTime: currentTime + 3,
            properties: {
                content: customText,
                position: 'top', // Default position: top center per titoli principali
                fontSize: 64,
                fontWeight: 'bold', // Bold di default per titoli
                fontFamily: 'Inter',
                color: '#ffffff'
            }
        }

        addAnimation(animation)
        setCustomText('')
    }

    // Verifica se c'è un testo selezionato dalla timeline
    const selectedTextAnimation = selectedAnimation?.type === 'text' ? selectedAnimation : null

    const handleTextPropertyChange = (property: string, value: unknown) => {
        if (!selectedTextAnimation) return

        updateAnimation(selectedTextAnimation.id, {
            properties: {
                ...selectedTextAnimation.properties,
                [property]: value
            }
        })
    }

    // Effetto per tracciare quando siamo nel pannello di editing
    useEffect(() => {
        if (selectedTextAnimation) {
            setIsEditingText(true)
        } else {
            setIsEditingText(false)
        }
    }, [selectedTextAnimation, setIsEditingText])

    // Se c'è un testo selezionato dalla timeline, mostra il pannello di editing
    if (selectedTextAnimation) {
        return (
            <div className="p-4 space-y-6">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            setSelectedAnimation(null)
                            setIsEditingText(false)
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ←
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Edit Text</h2>
                        <p className="text-sm text-gray-400">Customize your text properties</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Content</label>
                        <Input
                            value={(selectedTextAnimation.properties as any)?.content || ''}
                            onChange={(e) => handleTextPropertyChange('content', e.target.value)}
                            className="bg-zinc-800 border-zinc-600 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                            Font Size: {(selectedTextAnimation.properties as any)?.fontSize || 24}px
                        </label>
                        <input
                            type="range"
                            min="12"
                            max="72"
                            value={(selectedTextAnimation.properties as any)?.fontSize || 24}
                            onChange={(e) => handleTextPropertyChange('fontSize', parseInt(e.target.value))}
                            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Font Family</label>
                        <select
                            value={(selectedTextAnimation.properties as any)?.fontFamily || 'Inter'}
                            onChange={(e) => handleTextPropertyChange('fontFamily', e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white text-sm"
                        >
                            <optgroup label="System Fonts">
                                <option value="Inter">Inter</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Open Sans">Open Sans</option>
                                <option value="Montserrat">Montserrat</option>
                                <option value="Poppins">Poppins</option>
                                <option value="Lato">Lato</option>
                                <option value="Nunito">Nunito</option>
                                <option value="Source Sans Pro">Source Sans Pro</option>
                                <option value="Raleway">Raleway</option>
                                <option value="Ubuntu">Ubuntu</option>
                                <option value="Arial">Arial</option>
                                <option value="Helvetica">Helvetica</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Verdana">Verdana</option>
                            </optgroup>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Font Weight</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['normal', 'bold', '600'].map((weight) => (
                                <Button
                                    key={weight}
                                    variant={(selectedTextAnimation.properties as any)?.fontWeight === weight ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleTextPropertyChange('fontWeight', weight)}
                                    className="text-xs"
                                >
                                    {weight === 'normal' ? 'Regular' : weight === 'bold' ? 'Bold' : 'Semi'}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Color</label>
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-8 h-8 rounded border-2 border-gray-600 cursor-pointer"
                                style={{ backgroundColor: (selectedTextAnimation.properties as any)?.color || '#ffffff' }}
                                onClick={() => setIsColorPickerOpen(true)}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsColorPickerOpen(true)}
                                className="flex items-center space-x-2"
                            >
                                <Palette className="h-4 w-4" />
                                <span>Choose Color</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <ColorPickerModal
                    isOpen={isColorPickerOpen}
                    onClose={() => setIsColorPickerOpen(false)}
                    onColorSelect={(color) => {
                        handleTextPropertyChange('color', color)
                    }}
                />
            </div>
        )
    }
    const activeClip = getActiveClip()
    const textAnimations = activeClip?.animations.filter(anim => anim.type === 'text') || []

    // Pannello di default per aggiungere nuovo testo
    return (
        <TooltipProvider>
            <div className="p-4 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Text</h2>
                    <p className="text-sm text-gray-400">Add text overlays to your video</p>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white">Add Custom Text</h3>
                    <div className="flex space-x-2">
                        <Input
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            placeholder="Enter your text..."
                            className="flex-1 bg-zinc-800 border-zinc-600 text-white placeholder-zinc-400"
                        />
                        <Button
                            onClick={handleAddCustomText}
                            disabled={!customText.trim()}
                            className="bg-zinc-800 hover:bg-zinc-600"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {textAnimations.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-white">Text Elements</h3>
                        <div className="space-y-2">
                            {textAnimations.map((textAnim) => {
                                const shouldShowTooltip = !hasActiveBackground()

                                const textCard = (
                                    <div
                                        key={textAnim.id}
                                        className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 cursor-pointer transition-colors group"
                                        onClick={() => {
                                            setSelectedAnimation(textAnim)
                                            setIsEditingText(true)
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">
                                                    {(textAnim.properties as any)?.content || 'Untitled Text'}
                                                </p>
                                                <p className="text-gray-400 text-xs">
                                                    {(textAnim.properties as any)?.fontFamily || 'Inter'} • {(textAnim.properties as any)?.fontSize || 24}px
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-4 h-4 rounded border border-gray-600"
                                                    style={{ backgroundColor: (textAnim.properties as any)?.color || '#ffffff' }}
                                                />
                                                <span className="text-xs text-gray-400 capitalize">
                                                    {(textAnim.properties as any)?.position || 'right'}
                                                </span>
                                                <button
                                                    onClick={(e) => handleDeleteText(textAnim.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
                                                    title="Delete text"
                                                >
                                                    <X className="h-3 w-3 text-gray-400 hover:text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )

                                if (shouldShowTooltip) {
                                    return (
                                        <Tooltip key={textAnim.id}>
                                            <TooltipTrigger asChild>
                                                {textCard}
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="max-w-sm">
                                                <p className="text-sm">
                                                    Add a background for better visual effects
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )
                                }

                                return textCard
                            })}
                        </div>
                    </div>
                )}
            </div>

            <ColorPickerModal
                isOpen={isColorPickerOpen}
                onClose={() => setIsColorPickerOpen(false)}
                onColorSelect={(color) => {
                    if (selectedTextAnimation) {
                        handleTextPropertyChange('color', color)
                    }
                }}
            />
        </TooltipProvider>
    )
}