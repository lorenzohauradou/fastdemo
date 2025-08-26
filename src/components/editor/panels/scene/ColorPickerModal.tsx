'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ColorPickerModalProps {
    isOpen: boolean
    onClose: () => void
    onColorSelect: (color: string) => void
}

export function ColorPickerModal({ isOpen, onClose, onColorSelect }: ColorPickerModalProps) {
    const [selectedColor, setSelectedColor] = useState('#FFFFFF')

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
                            className="w-full h-32 rounded-lg mb-3 relative cursor-crosshair"
                            style={{
                                background: `linear-gradient(to bottom, 
                                    transparent 0%, 
                                    rgba(0,0,0,1) 100%), 
                                linear-gradient(to right, 
                                    rgba(255,255,255,1) 0%, 
                                    ${selectedColor} 100%)`
                            }}
                        >
                            <div className="w-4 h-4 border-2 border-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />
                        </div>

                        <div className="relative mb-3">
                            <div
                                className="w-full h-3 rounded-full cursor-pointer"
                                style={{
                                    background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                                }}
                            >
                                <div className="w-4 h-4 border-2 border-white rounded-full absolute top-0 left-1/4 transform -translate-x-1/2 -translate-y-0.5 shadow-lg bg-white" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <input
                            type="text"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded bg-background text-foreground text-center text-sm"
                            placeholder="#FFFFFF"
                        />
                        <p className="text-xs text-muted-foreground text-center mt-1">HEX</p>
                    </div>

                    <div className="mb-3 text-center">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <span className="text-sm">🔗</span>
                        </Button>
                    </div>

                    <div className="space-y-1 mb-4">
                        {colorPalette.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex space-x-1">
                                {row.map((color, colIndex) => (
                                    <button
                                        key={`${rowIndex}-${colIndex}`}
                                        className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        onClick={() => setSelectedColor(color)}
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
