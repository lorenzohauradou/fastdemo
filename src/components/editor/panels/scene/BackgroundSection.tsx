'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Project } from '@/lib/store'

interface BackgroundSectionProps {
    currentProject: Project | null
    onEditClick: () => void
}

export function BackgroundSection({ currentProject, onEditClick }: BackgroundSectionProps) {
    const backgrounds = [
        { id: '3d', name: '3D scene', description: 'Primary color' },
    ]

    return (
        <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Background</h3>

            <div className="space-y-2">
                {backgrounds.map((bg) => (
                    <Card
                        key={bg.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={onEditClick}
                    >
                        <CardContent className="p-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div
                                        className="w-6 h-6 rounded"
                                        style={{ backgroundColor: currentProject?.primaryColor || '#6366f1' }}
                                    />
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
    )
}
