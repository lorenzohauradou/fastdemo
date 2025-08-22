'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Monitor, Smartphone, Laptop, Square, RotateCcw, Volume2, X, Edit, ArrowLeft } from 'lucide-react'

export function ScenePanel() {
    const { currentProject } = useEditorStore()
    const [showBackgroundEdit, setShowBackgroundEdit] = useState(false)
    const [showColorPicker, setShowColorPicker] = useState(false)

    // Device templates
    const devices = [
        { id: 'rectangle', name: 'Rectangle', icon: Square },
        { id: 'macbook', name: 'Macbook', icon: Laptop },
        { id: 'iphone', name: 'iPhone', icon: Smartphone },
        { id: 'samsung', name: 'Samsung', icon: Smartphone },
    ]

    // Background options
    const backgrounds = [
        { id: '3d', name: '3D scene', description: 'Primary color' },
    ]

    const formatDuration = (duration: number) => {
        const minutes = Math.floor(duration / 60)
        const seconds = (duration % 60).toFixed(0).padStart(2, '0')
        return `${minutes}:${seconds}`
    }

    // Componente per Color Picker
    const ColorPickerPanel = () => {
        const [selectedColor, setSelectedColor] = useState('#FFFFFF')

        // Palette di colori predefiniti
        const colorPalette = [
            // Riga 1
            ['#EF4444', '#F97316', '#F59E0B', '#22C55E', '#059669', '#3B82F6', '#4F46E5', '#8B5CF6', '#A855F7', '#000000'],
            // Riga 2  
            ['#F87171', '#FB923C', '#FBBF24', '#4ADE80', '#10B981', '#60A5FA', '#6366F1', '#A78BFA', '#C084FC', '#6B7280'],
            // Riga 3
            ['#FCA5A5', '#FDD8A0', '#FDE68A', '#86EFAC', '#6EE7B7', '#93C5FD', '#A5B4FC', '#C4B5FD', '#DDD6FE', '#9CA3AF'],
            // Riga 4
            ['#FECACA', '#FED7AA', '#FEF3C7', '#BBF7D0', '#A7F3D0', '#BFDBFE', '#C7D2FE', '#DDD6FE', '#E9D5FF', '#D1D5DB'],
            // Riga 5
            ['#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#374151', '#1F2937', '#111827']
        ]

        return (
            <>
                {/* Backdrop - click fuori per chiudere con z-index molto alto */}
                <div
                    className="fixed inset-0 z-[100] bg-black/10"
                    onClick={() => {
                        console.log('Backdrop clicked - closing color picker')
                        setShowColorPicker(false)
                    }}
                />

                {/* Color Picker posizionato vicino al custom button */}
                <div className="fixed top-1/2 left-80 transform -translate-y-1/2 z-[101] w-80">
                    <div
                        className="bg-card border border-border rounded-lg p-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Gradient Picker Area */}
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
                                {/* Selector circulare */}
                                <div className="w-4 h-4 border-2 border-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />
                            </div>

                            {/* Hue Slider */}
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

                        {/* Input HEX */}
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

                        {/* Link icon */}
                        <div className="mb-3 text-center">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <span className="text-sm">🔗</span>
                            </Button>
                        </div>

                        {/* Color Palette */}
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

                        {/* Done Button */}
                        <Button
                            className="w-full h-8"
                            onClick={() => setShowColorPicker(false)}
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </>
        )
    }

    // Componente per Edit Background
    const BackgroundEditPanel = () => {
        const colorModes = [
            { id: 'white', name: 'White', color: '#ffffff' },
            { id: 'light', name: 'Light', color: '#f3f4f6' },
            { id: 'primary', name: 'Primary', color: '#3b82f6' },
            { id: 'dark', name: 'Dark', color: '#1f2937' },
            { id: 'black', name: 'Black', color: '#000000' },
            { id: 'custom', name: 'Custom', gradient: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24)' },
        ]

        const backgroundTypes = [
            { id: '3d', name: '3D scene', active: true },
            { id: 'solid', name: 'Solid' },
            { id: 'linear', name: 'Linear gradient' },
            { id: 'mesh', name: 'Mesh gradient' },
            { id: 'image', name: 'Image', icon: '🖼️' },
        ]

        return (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border">
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowBackgroundEdit(false)}
                            className="h-8 w-8 p-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-semibold text-foreground">Edit background</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-visible p-4 space-y-6">
                    {/* Color Mode Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-foreground">Color mode</h3>
                            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                                Edit theme
                            </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {colorModes.map((color) => (
                                <div key={color.id} className="text-center relative">
                                    <div
                                        className={`w-full aspect-square rounded-lg mb-2 border-2 ${color.id === 'primary' ? 'border-primary' : 'border-border'} cursor-pointer hover:scale-105 transition-transform`}
                                        style={{
                                            backgroundColor: color.color,
                                            background: color.gradient || color.color,
                                        }}
                                        onClick={() => {
                                            if (color.id === 'custom') {
                                                setShowColorPicker(true)
                                            }
                                        }}
                                    />
                                    <p className="text-xs font-medium text-foreground">
                                        {color.name}
                                    </p>

                                    {/* Color Picker per Custom */}
                                    {color.id === 'custom' && showColorPicker && <ColorPickerPanel />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Type Section */}
                    <div>
                        <h3 className="text-sm font-medium text-foreground mb-4">Type</h3>

                        <div className="grid grid-cols-3 gap-3">
                            {backgroundTypes.slice(0, 3).map((type) => (
                                <div key={type.id} className="text-center">
                                    <div
                                        className={`w-full h-16 bg-primary rounded-lg mb-2 border-2 ${type.active ? 'border-primary ring-2 ring-primary/20' : 'border-border'} cursor-pointer hover:scale-105 transition-transform flex items-center justify-center`}
                                    >
                                        {type.icon ? (
                                            <span className="text-lg">{type.icon}</span>
                                        ) : (
                                            <div className="w-6 h-4 bg-primary-foreground rounded opacity-60" />
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-foreground">
                                        {type.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            {backgroundTypes.slice(3).map((type) => (
                                <div key={type.id} className="text-center">
                                    <div
                                        className={`w-full h-16 bg-primary rounded-lg mb-2 border-2 ${type.active ? 'border-primary ring-2 ring-primary/20' : 'border-border'} cursor-pointer hover:scale-105 transition-transform flex items-center justify-center`}
                                    >
                                        {type.icon ? (
                                            <span className="text-lg">{type.icon}</span>
                                        ) : (
                                            <div className="w-6 h-4 bg-primary-foreground rounded opacity-60" />
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-foreground">
                                        {type.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (showBackgroundEdit) {
        return <BackgroundEditPanel />
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Scene</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Media Section */}
                <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">Media</h3>

                    {currentProject?.videoUrl ? (
                        <Card className="bg-muted/30 border-muted">
                            <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                    {/* Video thumbnail */}
                                    <div className="relative w-12 h-9 bg-muted rounded overflow-hidden flex-shrink-0">
                                        <video
                                            src={currentProject.videoUrl}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                        <div className="absolute inset-0 bg-black/20" />
                                    </div>

                                    {/* Video info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium text-foreground truncate">
                                                {currentProject.name}.mp4
                                            </p>
                                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDuration(currentProject.duration || 0)}
                                        </p>
                                    </div>
                                </div>

                                {/* Video controls */}
                                <div className="flex items-center justify-center mt-2 pt-2 border-t border-border gap-2">
                                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                                        <RotateCcw className="h-3 w-3 mr-1" />
                                        Replace
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                                        <Volume2 className="h-3 w-3 mr-1" />
                                        Audio
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                            <Button className="w-full h-8" variant="default" size="sm">
                                <Monitor className="h-3 w-3 mr-2" />
                                New screen recording
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                                Import image or video
                            </p>
                        </div>
                    )}
                </div>

                {/* Background Section */}
                <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">Background</h3>

                    <div className="space-y-2">
                        {backgrounds.map((bg) => (
                            <Card
                                key={bg.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => setShowBackgroundEdit(true)}
                            >
                                <CardContent className="p-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 bg-primary rounded" />
                                            <div>
                                                <p className="text-xs font-medium text-foreground">
                                                    {bg.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {bg.description}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs h-6 px-2 pointer-events-none"
                                        >
                                            Edit →
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Device Section */}
                <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">Device</h3>

                    <div className="grid grid-cols-2 gap-2">
                        {devices.map((device) => {
                            const Icon = device.icon
                            return (
                                <Card
                                    key={device.id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors border-2 border-primary"
                                >
                                    <CardContent className="p-3 text-center">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                            <Icon className="h-4 w-4 text-white" />
                                        </div>
                                        <p className="text-xs font-medium text-foreground">
                                            {device.name}
                                        </p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
