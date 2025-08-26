'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Play, Upload, Volume2, ArrowLeft, Plus, X } from 'lucide-react'
import { useApi } from '@/lib/api'

const musicCategories = [
    {
        id: 'cinematic',
        name: 'Cinematic',
        description: 'Dramatic emotional soundscapes',
        color: 'from-orange-500 to-red-600'
    },
    {
        id: 'confident',
        name: 'Confident Energy',
        description: 'Bold motivational tracks',
        color: 'from-red-500 to-pink-600'
    },
    {
        id: 'electronic',
        name: 'Electronic',
        description: 'Modern digital beats',
        color: 'from-blue-500 to-purple-600'
    },
    {
        id: 'hype',
        name: 'Hype',
        description: 'High-energy exciting tracks',
        color: 'from-green-500 to-teal-600'
    },
    {
        id: 'jazzy',
        name: 'Jazzy',
        description: 'Smooth sophisticated melodies',
        color: 'from-emerald-500 to-green-600'
    },
    {
        id: 'lofi',
        name: 'Lo-fi Chill',
        description: 'Relaxed nostalgic beats',
        color: 'from-purple-500 to-indigo-600'
    }
]

const categoryTracks = {
    cinematic: [
        { id: 'dramatic-reveal', name: 'Dramatic Reveal', duration: '1:59' },
        { id: 'epic-journey', name: 'Epic Journey', duration: '2:05' },
        { id: 'final-battle', name: 'Final Battle', duration: '1:59' },
        { id: 'heroic-moment', name: 'Heroic Moment', duration: '2:02' },
        { id: 'opening-scene', name: 'Opening Scene', duration: '2:01' }
    ],
    confident: [
        { id: 'confident-1', name: 'Power Drive', duration: '2:15' },
        { id: 'confident-2', name: 'Victory March', duration: '1:58' },
        { id: 'confident-3', name: 'Rising Up', duration: '2:33' }
    ],
    electronic: [
        { id: 'electronic-1', name: 'Neon Lights', duration: '3:12' },
        { id: 'electronic-2', name: 'Digital Pulse', duration: '2:44' },
        { id: 'electronic-3', name: 'Cyber Dreams', duration: '3:01' }
    ],
    hype: [
        { id: 'hype-1', name: 'Energy Boost', duration: '2:28' },
        { id: 'hype-2', name: 'Adrenaline Rush', duration: '1:55' },
        { id: 'hype-3', name: 'Peak Performance', duration: '2:17' }
    ],
    jazzy: [
        { id: 'jazzy-1', name: 'Smooth Operator', duration: '3:45' },
        { id: 'jazzy-2', name: 'Late Night Vibes', duration: '4:12' },
        { id: 'jazzy-3', name: 'City Lights', duration: '3:28' }
    ],
    lofi: [
        { id: 'lofi-1', name: 'Study Session', duration: '3:15' },
        { id: 'lofi-2', name: 'Rainy Day', duration: '2:48' },
        { id: 'lofi-3', name: 'Coffee Shop', duration: '3:33' }
    ]
}

export function MusicPanel() {
    const { currentProject, updateProject } = useEditorStore()
    const [currentView, setCurrentView] = useState<'main' | 'category' | 'imported'>('main')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [importedFile, setImportedFile] = useState<File | null>(null)
    const [volume, setVolume] = useState([50])
    const [isUploading, setIsUploading] = useState(false)
    const api = useApi()

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId)
        setCurrentView('category')
    }

    const handleTrackSelect = (trackId: string) => {
        updateProject({
            musicSettings: {
                type: 'preset',
                track: trackId,
                volume: volume[0] / 100
            }
        })
    }

    const handleCustomUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Verifica che sia un file audio
        if (!file.type.startsWith('audio/')) {
            alert('Il file deve essere un audio')
            return
        }

        setIsUploading(true)

        try {
            // Carica il file usando l'API
            const response = await api.uploadAudio(file)

            setImportedFile(file)
            setCurrentView('imported')

            // Salva il nome del file invece dell'URL blob
            updateProject({
                musicSettings: {
                    type: 'custom',
                    track: response.audioUrl, // URL per il preview locale
                    volume: volume[0] / 100,
                    fileName: response.filename, // Nome del file per il backend
                    track_path: null // Sarà impostato dal backend
                }
            })
        } catch (error) {
            console.error('Errore upload audio:', error)
            alert('Errore durante l\'upload dell\'audio')
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemoveImported = () => {
        setImportedFile(null)
        setCurrentView('main')
        updateProject({
            musicSettings: {
                type: 'custom',
                track: '',
                volume: volume[0] / 100
            }
        })
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const formatDuration = (file: File) => {
        return '03:18'
    }

    if (currentView === 'main') {
        return (
            <div className="p-4 space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-white">Music</h2>
                </div>

                <label className="block w-full">
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleCustomUpload}
                        className="hidden"
                        disabled={isUploading}
                    />
                    <Button
                        variant="outline"
                        className="w-full border-gray-600 hover:bg-gray-700"
                        disabled={isUploading}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? 'Uploading...' : 'Import music file'}
                    </Button>
                </label>

                <div>
                    <h3 className="text-lg font-medium text-white mb-3">Library</h3>

                    <div className="mb-4">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-white">Featured</h4>
                            <p className="text-sm text-white/80">Most popular tracks</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {musicCategories.map((category) => (
                            <div
                                key={category.id}
                                onClick={() => handleCategorySelect(category.id)}
                                className={`bg-gradient-to-r ${category.color} rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity`}
                            >
                                <h4 className="text-lg font-medium text-white">{category.name}</h4>
                                <p className="text-sm text-white/80">{category.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (currentView === 'category' && selectedCategory) {
        const category = musicCategories.find(c => c.id === selectedCategory)
        const tracks = categoryTracks[selectedCategory as keyof typeof categoryTracks] || []

        return (
            <div className="p-4 space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-white">Music</h2>
                </div>

                <label className="block w-full">
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleCustomUpload}
                        className="hidden"
                        disabled={isUploading}
                    />
                    <Button
                        variant="outline"
                        className="w-full border-gray-600 hover:bg-gray-700"
                        disabled={isUploading}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? 'Uploading...' : 'Import music file'}
                    </Button>
                </label>

                <div>
                    <h3 className="text-lg font-medium text-white mb-3">Library</h3>

                    <Button
                        variant="ghost"
                        onClick={() => setCurrentView('main')}
                        className="mb-4 text-white hover:bg-gray-700"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <div className="mb-4">
                        <h4 className="text-lg font-medium text-white mb-2">Featured</h4>
                        <p className="text-sm text-gray-400 mb-3">Most popular tracks</p>
                    </div>

                    <div className="space-y-3">
                        {tracks.map((track) => (
                            <div
                                key={track.id}
                                className="bg-card rounded-lg p-4 hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center justify-between min-w-0">
                                    <div className="flex-1 min-w-0 mr-3">
                                        <h4 className="text-lg font-medium text-white truncate">{track.name}</h4>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                console.log('Play preview:', track.name)
                                            }}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <Play className="h-5 w-5" />
                                        </Button>
                                        {/* Waveform - contenuta senza overflow con pattern fisso */}
                                        <div className="flex items-center space-x-px max-w-[120px] overflow-hidden">
                                            {Array.from({ length: 40 }, (_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-0.5 bg-gray-500 rounded-full flex-shrink-0"
                                                    style={{
                                                        height: `${Math.sin(i * 0.2) * 6 + Math.sin(i * 0.1) * 4 + 8}px`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-400 text-right w-10">{track.duration}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation() // Previene la propagazione del click
                                                handleTrackSelect(track.id) // Seleziona la traccia
                                            }}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (currentView === 'imported' && importedFile) {
        return (
            <div className="p-4 space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-white">Music</h2>
                </div>

                <div>
                    <h3 className="text-lg font-medium text-white mb-3">Tracks</h3>

                    <div className="bg-card rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h4 className="text-lg font-medium text-white">1. {importedFile.name}</h4>
                                <p className="text-sm text-gray-400">{formatDuration(importedFile)}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-white"
                                >
                                    <Volume2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-white"
                                >
                                    <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-white"
                                >
                                    <ArrowLeft className="h-4 w-4 rotate-90" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveImported}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <label className="block w-full">
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleCustomUpload}
                        className="hidden"
                        disabled={isUploading}
                    />
                    <Button
                        variant="outline"
                        className="w-full border-gray-600 hover:bg-gray-700"
                        disabled={isUploading}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? 'Uploading...' : 'Import music file'}
                    </Button>
                </label>
                <div>
                    <h3 className="text-lg font-medium text-white mb-3">Library</h3>

                    <div className="mb-4">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-white">Featured</h4>
                            <p className="text-sm text-white/80">Most popular tracks</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {musicCategories.map((category) => (
                            <div
                                key={category.id}
                                onClick={() => handleCategorySelect(category.id)}
                                className={`bg-gradient-to-r ${category.color} rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity`}
                            >
                                <h4 className="text-lg font-medium text-white">{category.name}</h4>
                                <p className="text-sm text-white/80">{category.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return null
}
