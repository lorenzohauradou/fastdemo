'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Square } from 'lucide-react'
import { Project } from '@/lib/store'

interface DeviceSectionProps {
    currentProject: Project | null
    selectedDevice: string
    borderRadius: number[]
    onDeviceSelect: (deviceId: string) => void
    onBorderRadiusChange: (value: number[]) => void
}

export function DeviceSection({
    currentProject,
    selectedDevice,
    borderRadius,
    onDeviceSelect,
    onBorderRadiusChange
}: DeviceSectionProps) {
    const devices = [
        { id: 'rectangle', name: 'Rectangle', icon: Square },
        // { id: 'macbook', name: 'MacBook', icon: Laptop },
        // { id: 'iphone', name: 'iPhone', icon: Smartphone },
        // { id: 'ipad', name: 'iPad', icon: Tablet },
    ]

    return (
        <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Device</h3>

            <div className="grid grid-cols-2 gap-2">
                {devices.map((device) => {
                    const isSelected = selectedDevice === device.id
                    return (
                        <Card
                            key={device.id}
                            className={`cursor-pointer hover:bg-muted/50 transition-colors border-2 ${isSelected ? 'border-primary' : 'border-border'
                                }`}
                            onClick={() => onDeviceSelect(device.id)}
                        >
                            <CardContent className="p-3 text-center">
                                <div className="w-24 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                </div>
                                <p className="text-xs font-medium text-foreground">
                                    {device.name}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {selectedDevice === 'rectangle' && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">Corner Roundness</label>
                            <span className="text-sm text-muted-foreground">{borderRadius[0]}px</span>
                        </div>
                        <Slider
                            value={borderRadius}
                            onValueChange={onBorderRadiusChange}
                            max={50}
                            min={0}
                            step={1}
                            className="w-full"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
