'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, Upload, Volume2 } from 'lucide-react'

const presetTracks = [
    {
        id: 'cinematic-1',
        name: 'Cinematic',
        description: 'Dramatic emotional soundscapes',
        category: 'cinematic',
        duration: 180,
        preview: '/music/cinematic-preview.mp3'
    },
    {
        id: 'confident-1',
        name: 'Confident Energy',
        description: 'Bold motivational tracks',
        category: 'confident',
        duration: 165,
        preview: '/music/confident-preview.mp3'
    },
    {
        id: 'electronic-1',
        name: 'Electronic',
        description: 'Modern digital beats',
        category: 'electronic',
        duration: 200,
        preview: '/music/electronic-preview.mp3'
    },
    {
        id: 'hype-1',
        name: 'Hype',
        description: 'High-energy exciting tracks',
        category: 'hype',
        duration: 145,
        preview: '/music/hype-preview.mp3'
    },
    {
        id: 'jazzy-1',
        name: 'Jazzy',
        description: 'Smooth sophisticated melodies',
        category: 'jazzy',
        duration: 220,
        preview: '/music/jazzy-preview.mp3'
    },
    {
        id: 'lofi-1',
        name: 'Lo-fi Chill',
        description: 'Relaxed nostalgic beats',
        category: 'lofi',
        duration: 190,
        preview: '/music/lofi-preview.mp3'
    }
]

const categoryColors = {
    cinematic: 'from-orange-500 to-red-600',
    confident: 'from-red-500 to-pink-600',
    electronic: 'from-blue-500 to-purple-600',
    hype: 'from-green-500 to-teal-600',
    jazzy: 'from-emerald-500 to-green-600',
    lofi: 'from-purple-500 to-indigo-600'
}

export function MusicPanel() {
    const { currentProject, updateProject } = useEditorStore()
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState([50])

    const handleTrackSelect = (trackId: string) => {
        const track = presetTracks.find(t => t.id === trackId)
        if (!track) return

        updateProject({
            musicSettings: {
                type: 'preset',
                track: trackId,
                volume: volume[0] / 100
            }
        })

        setSelectedTrack(trackId)
    }

    const handleCustomUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const audioUrl = URL.createObjectURL(file)

        updateProject({
            musicSettings: {
                type: 'custom',
                track: audioUrl,
                volume: volume[0] / 100
            }
        })
    }

    const togglePreview = (trackId: string) => {
        setIsPlaying(!isPlaying)
        console.log('Toggle preview for:', trackId)
    }

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-2">Music</h2>
                <p className="text-sm text-gray-400">Add background music to your video</p>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Volume</label>
                    <span className="text-sm text-gray-400">{volume[0]}%</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4 text-gray-400" />
                    <Slider
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="flex-1"
                    />
                </div>
            </div>

            {/* Custom Upload */}
            <div>
                <label className="block w-full">
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleCustomUpload}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        className="w-full border-gray-600 hover:bg-gray-700"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Import music file
                    </Button>
                </label>
            </div>

            {/* Tracks Section */}
            <div>
                <h3 className="text-sm font-medium text-white mb-3">Tracks</h3>
                <div className="space-y-3">
                    {presetTracks.map((track) => (
                        <Card
                            key={track.id}
                            className={`p-3 bg-gray-800 border-gray-700 cursor-pointer transition-all hover:bg-gray-750 ${selectedTrack === track.id ? 'ring-2 ring-blue-500' : ''
                                }`}
                            onClick={() => handleTrackSelect(track.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${categoryColors[track.category as keyof typeof categoryColors]}`} />
                                        <h4 className="text-sm font-medium text-white">{track.name}</h4>
                                    </div>
                                    <p className="text-xs text-gray-400">{track.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                                    </p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        togglePreview(track.id)
                                    }}
                                    className="text-gray-400 hover:text-white"
                                >
                                    {isPlaying && selectedTrack === track.id ? (
                                        <Pause className="h-4 w-4" />
                                    ) : (
                                        <Play className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Library Categories */}
            <div>
                <h3 className="text-sm font-medium text-white mb-3">Library</h3>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(categoryColors).map(([category, gradient]) => (
                        <Card
                            key={category}
                            className={`p-3 bg-gradient-to-r ${gradient} cursor-pointer hover:opacity-80 transition-opacity`}
                        >
                            <h4 className="text-sm font-medium text-white capitalize">{category}</h4>
                            <p className="text-xs text-white/80 mt-1">
                                {presetTracks.filter(t => t.category === category).length} tracks
                            </p>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Featured Section */}
            <div>
                <h3 className="text-sm font-medium text-white mb-3">Featured</h3>
                <Card className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
                    <h4 className="text-sm font-medium text-white mb-1">Most popular tracks</h4>
                    <p className="text-xs text-white/80">Curated selection of trending music</p>
                </Card>
            </div>
        </div>
    )
}
