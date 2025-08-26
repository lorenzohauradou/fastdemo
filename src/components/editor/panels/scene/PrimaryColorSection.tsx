'use client'

import { Project } from '@/lib/store'

interface PrimaryColorSectionProps {
    currentProject: Project | null
    onColorSelect: (color: string) => void
    onCustomColorClick: () => void
}

export function PrimaryColorSection({
    currentProject,
    onColorSelect,
    onCustomColorClick
}: PrimaryColorSectionProps) {
    const colorOptions = [
        { name: 'White', color: '#ffffff' },
        { name: 'Red', color: '#ef4444' },
        { name: 'Orange', color: '#f97316' },
        { name: 'Green', color: '#22c55e' },
        { name: 'Blue', color: '#3b82f6' },
        { name: 'Purple', color: '#8b5cf6' },
        { name: 'Pink', color: '#ec4899' },
        { name: 'Custom', color: currentProject?.primaryColor || '#ffffff' }
    ]

    return (
        <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Primary color</h3>
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {colorOptions.map((colorOption) => (
                    <div key={colorOption.name} className="flex-shrink-0">
                        <div
                            className={`w-12 h-12 rounded-lg cursor-pointer border-2 transition-all hover:scale-105 ${(currentProject?.primaryColor || '#ffffff') === colorOption.color
                                ? 'border-primary ring-2 ring-primary/20'
                                : 'border-border'
                                }`}
                            style={{ backgroundColor: colorOption.color }}
                            onClick={() => {
                                if (colorOption.name === 'Custom') {
                                    onCustomColorClick()
                                } else {
                                    onColorSelect(colorOption.color)
                                }
                            }}
                        >
                            {colorOption.name === 'Custom' && (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-white drop-shadow">+</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
