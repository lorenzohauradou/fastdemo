'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface ColorPickerModalProps {
    isOpen: boolean
    onClose: () => void
    onColorSelect: (color: string) => void
}

export function ColorPickerModal({ isOpen, onClose, onColorSelect }: ColorPickerModalProps) {
    const [selectedColor, setSelectedColor] = useState('#FFFFFF')
    const [hue, setHue] = useState(0)
    const [saturation, setSaturation] = useState(100)
    const [lightness, setLightness] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const [isHueDragging, setIsHueDragging] = useState(false)

    const colorAreaRef = useRef<HTMLDivElement>(null)
    const hueSliderRef = useRef<HTMLDivElement>(null)

    // Funzione per convertire HSL in HEX
    const hslToHex = useCallback((h: number, s: number, l: number) => {
        const hNormalized = h / 360
        const sNormalized = s / 100
        const lNormalized = l / 100

        const c = (1 - Math.abs(2 * lNormalized - 1)) * sNormalized
        const x = c * (1 - Math.abs((hNormalized * 6) % 2 - 1))
        const m = lNormalized - c / 2

        let r = 0, g = 0, b = 0

        if (0 <= hNormalized && hNormalized < 1 / 6) {
            r = c; g = x; b = 0
        } else if (1 / 6 <= hNormalized && hNormalized < 2 / 6) {
            r = x; g = c; b = 0
        } else if (2 / 6 <= hNormalized && hNormalized < 3 / 6) {
            r = 0; g = c; b = x
        } else if (3 / 6 <= hNormalized && hNormalized < 4 / 6) {
            r = 0; g = x; b = c
        } else if (4 / 6 <= hNormalized && hNormalized < 5 / 6) {
            r = x; g = 0; b = c
        } else if (5 / 6 <= hNormalized && hNormalized < 1) {
            r = c; g = 0; b = x
        }

        r = Math.round((r + m) * 255)
        g = Math.round((g + m) * 255)
        b = Math.round((b + m) * 255)

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase()
    }, [])

    // Aggiorna il colore selezionato quando cambiano hue, saturation, lightness
    const updateSelectedColor = useCallback(() => {
        const newColor = hslToHex(hue, saturation, lightness)
        setSelectedColor(newColor)
    }, [hue, saturation, lightness, hslToHex])

    // Gestione del drag per l'area del colore principale
    const handleColorAreaMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true)
        handleColorAreaMove(e)
    }, [])

    const handleColorAreaMove = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!colorAreaRef.current) return

        const rect = colorAreaRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height))

        const newSaturation = (x / rect.width) * 100
        const newLightness = 100 - (y / rect.height) * 100

        setSaturation(newSaturation)
        setLightness(newLightness)
    }, [])

    // Gestione del drag per la barra hue
    const handleHueMouseDown = useCallback((e: React.MouseEvent) => {
        setIsHueDragging(true)
        handleHueMove(e)
    }, [])

    const handleHueMove = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!hueSliderRef.current) return

        const rect = hueSliderRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
        const newHue = (x / rect.width) * 360

        setHue(newHue)
    }, [])

    // Event listeners globali per il mouse
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            handleColorAreaMove(e)
        }
        if (isHueDragging) {
            handleHueMove(e)
        }
    }, [isDragging, isHueDragging, handleColorAreaMove, handleHueMove])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
        setIsHueDragging(false)
    }, [])

    // Aggiungi/rimuovi event listeners
    React.useEffect(() => {
        if (isDragging || isHueDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isDragging, isHueDragging, handleMouseMove, handleMouseUp])

    // Aggiorna il colore quando cambiano i valori HSL
    React.useEffect(() => {
        updateSelectedColor()
    }, [updateSelectedColor])

    // Funzione per convertire HEX in HSL
    const hexToHsl = useCallback((hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255
        const g = parseInt(hex.slice(3, 5), 16) / 255
        const b = parseInt(hex.slice(5, 7), 16) / 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        let h = 0, s = 0
        const l = (max + min) / 2

        if (max !== min) {
            const d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break
                case g: h = (b - r) / d + 2; break
                case b: h = (r - g) / d + 4; break
            }
            h /= 6
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        }
    }, [])

    // Funzione per gestire la selezione di un colore dalla palette
    const handlePaletteColorSelect = useCallback((color: string) => {
        const hsl = hexToHsl(color)
        setHue(hsl.h)
        setSaturation(hsl.s)
        setLightness(hsl.l)
        setSelectedColor(color)
    }, [hexToHsl])

    // Funzione per gestire il cambio dell'input HEX
    const handleHexInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSelectedColor(value)

        // Se il valore è un HEX valido, aggiorna anche HSL
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            const hsl = hexToHsl(value)
            setHue(hsl.h)
            setSaturation(hsl.s)
            setLightness(hsl.l)
        }
    }, [hexToHsl])

    const colorPalette = [
        ['#EF4444', '#F97316', '#F59E0B', '#22C55E', '#059669', '#3B82F6', '#4F46E5', '#8B5CF6', '#A855F7', '#000000'],
        ['#F87171', '#FB923C', '#FBBF24', '#4ADE80', '#10B981', '#60A5FA', '#6366F1', '#A78BFA', '#C084FC', '#6B7280'],
        ['#FCA5A5', '#FDD8A0', '#FDE68A', '#86EFAC', '#6EE7B7', '#93C5FD', '#A5B4FC', '#C4B5FD', '#DDD6FE', '#9CA3AF'],
        ['#FECACA', '#FED7AA', '#FEF3C7', '#BBF7D0', '#A7F3D0', '#BFDBFE', '#C7D2FE', '#DDD6FE', '#E9D5FF', '#D1D5DB'],
        ['#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#374151', '#1F2937', '#111827']
    ]

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 z-[100] bg-black/10"
                onClick={onClose}
            />

            <div className="fixed top-1/2 left-80 transform -translate-y-1/2 z-[101] w-80">
                <div
                    className="bg-card border border-border rounded-lg p-4 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mb-4">
                        <div
                            ref={colorAreaRef}
                            className="w-full h-32 rounded-lg mb-3 relative cursor-crosshair select-none"
                            style={{
                                background: `linear-gradient(to bottom, 
                                    transparent 0%, 
                                    rgba(0,0,0,1) 100%), 
                                linear-gradient(to right, 
                                    rgba(255,255,255,1) 0%, 
                                    hsl(${hue}, 100%, 50%) 100%)`
                            }}
                            onMouseDown={handleColorAreaMouseDown}
                        >
                            <div
                                className="w-4 h-4 border-2 border-white rounded-full absolute shadow-lg pointer-events-none"
                                style={{
                                    left: `${saturation}%`,
                                    top: `${100 - lightness}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />
                        </div>

                        <div className="relative mb-3">
                            <div
                                ref={hueSliderRef}
                                className="w-full h-3 rounded-full cursor-pointer select-none"
                                style={{
                                    background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                                }}
                                onMouseDown={handleHueMouseDown}
                            >
                                <div
                                    className="w-4 h-4 border-2 border-white rounded-full absolute top-0 shadow-lg bg-white pointer-events-none"
                                    style={{
                                        left: `${(hue / 360) * 100}%`,
                                        transform: 'translate(-50%, -25%)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <input
                            type="text"
                            value={selectedColor}
                            onChange={handleHexInputChange}
                            className="w-full px-3 py-2 border border-border rounded bg-background text-foreground text-center text-sm"
                            placeholder="#FFFFFF"
                        />

                    </div>

                    <div className="space-y-1 mb-4">
                        {colorPalette.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex space-x-1">
                                {row.map((color, colIndex) => (
                                    <button
                                        key={`${rowIndex}-${colIndex}`}
                                        className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        onClick={() => handlePaletteColorSelect(color)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    <Button
                        className="w-full h-8"
                        onClick={() => {
                            onColorSelect(selectedColor)
                            onClose()
                        }}
                    >
                        Done
                    </Button>
                </div>
            </div>
        </>
    )
}
