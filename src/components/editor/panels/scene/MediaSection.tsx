'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Monitor, RotateCcw, Volume2, X, Edit } from 'lucide-react'
import { Project } from '@/lib/store'

interface MediaSectionProps {
    currentProject: Project | null
}

export function MediaSection({ currentProject }: MediaSectionProps) {
    const formatDuration = (duration: number) => {
        const minutes = Math.floor(duration / 60)
        const seconds = (duration % 60).toFixed(0).padStart(2, '0')
        return `${minutes}:${seconds}`
    }

    return (
        <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Media</h3>

            {currentProject?.videoUrl ? (
                <Card className="bg-muted/30 border-muted">
                    <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-9 bg-muted rounded overflow-hidden flex-shrink-0">
                                <video
                                    src={currentProject.videoUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>

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
    )
}
