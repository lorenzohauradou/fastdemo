'use client'

import { useState, useRef, useEffect } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Play, Pause, Upload, Volume2, Plus, ArrowLeft, X } from 'lucide-react'
import { useApi } from '@/lib/api'
import Image from 'next/image'

function AnimatedWaveform({ isPlaying, trackId }: { isPlaying: boolean, trackId: string }) {
    const [animationFrame, setAnimationFrame] = useState(0)

    useEffect(() => {
        if (!isPlaying) return

        const interval = setInterval(() => {
            setAnimationFrame(prev => prev + 1)
        }, 100)

        return () => clearInterval(interval)
    }, [isPlaying])

    return (
        <div className="flex items-center space-x-px max-w-[120px] overflow-hidden">
            {Array.from({ length: 40 }, (_, i) => {
                const baseHeight = Math.sin(i * 0.2) * 6 + Math.sin(i * 0.1) * 4 + 8
                const animatedHeight = isPlaying
                    ? baseHeight * (0.8 + Math.sin(animationFrame * 0.3 + i * 0.5) * 0.3)
                    : baseHeight
                return (
                    <div
                        key={i}
                        className={`w-0.5 rounded-full flex-shrink-0 transition-colors duration-200 ${isPlaying ? 'bg-green-500' : 'bg-gray-500'
                            }`}
                        style={{
                            height: `${Math.max(2, animatedHeight)}px`
                        }}
                    />
                )
            })}
        </div>
    )
}

const musicCategories = [
    {
        id: 'cinematic',
        name: 'Cinematic',
        description: 'Dramatic emotional soundscapes',
        color: 'from-slate-800 via-orange-900 to-slate-900',
    },
    {
        id: 'confident',
        name: 'Main Demo',
        description: 'Main demo video tracks',
        color: 'from-slate-800 via-red-900 to-slate-900',
    },
    {
        id: 'electronic',
        name: 'Electronic',
        description: 'Modern digital beats',
        color: 'from-slate-800 via-blue-900 to-slate-900',
    },
    {
        id: 'energy',
        name: 'Energy',
        description: 'High-energy exciting tracks',
        color: 'from-slate-800 via-green-900 to-slate-900',
    },
    {
        id: 'jazzy',
        name: 'Jazzy',
        description: 'Smooth sophisticated melodies',
        color: 'from-slate-800 via-emerald-900 to-slate-900',
    },
    {
        id: 'lofi',
        name: 'Lo-fi Chill',
        description: 'Relaxed nostalgic beats',
        color: 'from-slate-800 via-purple-900 to-slate-900',
    }
]

const categoryTracks = {
    featured: [
        { id: 'cinematic/cinematic.mp3', name: 'Epic Cinematic', duration: '2:15', cover: '/images/musicpanel/cinematic.png' },
        { id: 'confident/confident.mp3', name: 'Confident Power', duration: '2:08', cover: '/images/musicpanel/confident.png' },
        { id: 'energy/rock.mp3', name: 'Rock Energy', duration: '2:33', cover: '/images/musicpanel/energy.png' },
        { id: 'jazzy/jazzy.mp3', name: 'Smooth Jazz', duration: '3:12', cover: '/images/musicpanel/jazzy.png' },
        { id: 'lofi/lofi.mp3', name: 'Chill Vibes', duration: '2:45', cover: '/images/musicpanel/lofi.png' },
        { id: 'electronic-dance/dance.mp3', name: 'Electronic Beat', duration: '2:28', cover: '/images/musicpanel/electronic.png' }
    ],
    cinematic: [
        { id: 'cinematic/cinematic.mp3', name: 'Epic Cinematic', duration: '2:15', cover: '/images/musicpanel/cinematic.png' },
        { id: 'cinematic/cinematic2.mp3', name: 'Heroic Journey', duration: '1:59', cover: '/images/musicpanel/cinematic1.png' },
        { id: 'cinematic/cinematic3.mp3', name: 'Final Battle', duration: '2:22', cover: '/images/musicpanel/cinematic2.png' }
    ],
    confident: [
        { id: 'confident/confident.mp3', name: 'Confident Power', duration: '2:08', cover: '/images/musicpanel/confident.png' },
        { id: 'confident/confident1.mp3', name: 'Victory March', duration: '1:58', cover: '/images/musicpanel/confident1.png' },
        { id: 'confident/confident3.mp3', name: 'Rising Up', duration: '2:33', cover: '/images/musicpanel/confident2.png' },
        { id: 'confident/confident4.mp3', name: 'Bold Move', duration: '2:12', cover: '/images/musicpanel/confident3.png' },
        { id: 'confident/confident5.mp3', name: 'Unstoppable', duration: '2:25', cover: '/images/musicpanel/confident4.png' }
    ],
    electronic: [
        { id: 'electronic-dance/dance.mp3', name: 'Electronic Beat', duration: '2:28', cover: '/images/musicpanel/electronic.png' },
        { id: 'electronic-dance/dance1.mp3', name: 'Digital Pulse', duration: '2:44', cover: '/images/musicpanel/electronic1.png' }
    ],
    energy: [
        { id: 'energy/dub-energic.mp3', name: 'Dub Energy', duration: '2:18', cover: '/images/musicpanel/energy.png' },
        { id: 'energy/dub-energic1.mp3', name: 'Dub Power', duration: '2:35', cover: '/images/musicpanel/energy1.png' },
        { id: 'energy/hiphop-energetic.mp3', name: 'Hip Hop Energy', duration: '2:22', cover: '/images/musicpanel/energy2.png' },
        { id: 'energy/jazzy-energetic.mp3', name: 'Jazzy Energy', duration: '2:45', cover: '/images/musicpanel/energy3.png' },
        { id: 'energy/rock.mp3', name: 'Rock Energy', duration: '2:33', cover: '/images/musicpanel/energy4.png' },
        { id: 'energy/rock1.mp3', name: 'Rock Power', duration: '2:28', cover: '/images/musicpanel/energy5.png' },
        { id: 'energy/trap-energic.mp3', name: 'Trap Energy', duration: '2:15', cover: '/images/musicpanel/energy6.png' },
        { id: 'energy/trap-energic2.mp3', name: 'Trap Hype', duration: '2:38', cover: '/images/musicpanel/energy7.png' }
    ],
    jazzy: [
        { id: 'jazzy/jazzy.mp3', name: 'Smooth Jazz', duration: '3:12', cover: '/images/musicpanel/jazzy.png' },
        { id: 'jazzy/jazzy1.mp3', name: 'Late Night Vibes', duration: '3:28', cover: '/images/musicpanel/jazzy1.png' },
        { id: 'jazzy/jazzy2.mp3', name: 'City Lights', duration: '3:45', cover: '/images/musicpanel/jazzy2.png' }
    ],
    lofi: [
        { id: 'lofi/lofi.mp3', name: 'Chill Vibes', duration: '2:45', cover: '/images/musicpanel/lofi.png' },
        { id: 'lofi/lofi1.mp3', name: 'Study Session', duration: '3:15', cover: '/images/musicpanel/lofi1.png' },
        { id: 'lofi/lofi2.mp3', name: 'Rainy Day', duration: '2:48', cover: '/images/musicpanel/lofi2.png' },
        { id: 'lofi/lofi3.mp3', name: 'Coffee Shop', duration: '3:33', cover: '/images/musicpanel/lofi3.png' }
    ]
}

export function MusicPanel() {
    const { currentProject, updateProject } = useEditorStore()
    const [currentView, setCurrentView] = useState<'main' | 'category' | 'imported'>('main')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [importedFile, setImportedFile] = useState<File | null>(null)
    const [volume, setVolume] = useState([50])
    const [isUploading, setIsUploading] = useState(false)
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const api = useApi()

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId)
        setCurrentView('category')
    }

    const handlePlayPause = (trackId: string) => {
        if (currentlyPlaying === trackId) {
            // Pause current track
            if (audioRef.current) {
                audioRef.current.pause()
                setCurrentlyPlaying(null)
            }
        } else {
            // Stop any current track
            if (audioRef.current) {
                audioRef.current.pause()
            }

            // Play new track
            const audio = new Audio(`/api/music/${trackId}`)
            audio.volume = 0.3
            audioRef.current = audio

            audio.play().then(() => {
                setCurrentlyPlaying(trackId)
            }).catch(() => {
                setCurrentlyPlaying(null)
            })

            // Reset when track ends
            audio.onended = () => {
                setCurrentlyPlaying(null)
                audioRef.current = null
            }
        }
    }

    const handleTrackSelect = (trackId: string) => {
        const apiPath = `/api/music/${trackId}`

        updateProject({
            musicSettings: {
                type: 'preset',
                track: apiPath, // URL per il Player frontend
                fileName: trackId, // Path per il backend rendering
                volume: volume[0] / 100
            }
        })
    }

    const handleCustomUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Verifica
        if (!file.type.startsWith('audio/')) {
            alert('The file must be an audio')
            return
        }

        setIsUploading(true)

        try {
            const response = await api.uploadAudio(file)

            setImportedFile(file)
            setCurrentView('imported')

            updateProject({
                musicSettings: {
                    type: 'custom',
                    track: response.audioUrl, // URL per preview locale
                    volume: volume[0] / 100,
                    fileName: response.filename // Nome file per backend
                }
            })
        } catch (error) {
            alert('Error during audio upload')
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

    const formatDuration = (file: File) => {
        return '03:18'
    }

    if (currentView === 'main') {
        return (
            <div className="p-4 space-y-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleCustomUpload}
                    className="hidden"
                    disabled={isUploading}
                />

                <div>
                    <h2 className="text-xl font-semibold text-white">Music</h2>
                </div>

                <Button
                    variant="outline"
                    className="w-full border-gray-600 hover:bg-gray-700"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Import music file'}
                </Button>

                <div>
                    <h3 className="text-lg font-medium text-white mb-3">Library</h3>

                    <div className="mb-4 text-center">
                        <div
                            onClick={() => handleCategorySelect('featured')}
                            className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity border border-slate-600/50"
                        >
                            <h4 className="text-lg font-medium text-white">Featured</h4>
                            <p className="text-sm text-slate-300">Most popular tracks</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {musicCategories.map((category) => (
                            <div
                                key={category.id}
                                onClick={() => handleCategorySelect(category.id)}
                                className={`bg-gradient-to-br ${category.color} rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity border border-slate-700/50`}
                            >
                                <h4 className="text-lg font-medium text-white">{category.name}</h4>
                                <p className="text-sm text-slate-300">{category.description}</p>
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

                <Button
                    variant="outline"
                    className="w-full border-gray-600 hover:bg-gray-700"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Import music file'}
                </Button>

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
                        <h4 className="text-lg font-medium text-white mb-2">
                            {selectedCategory === 'featured' ? 'Featured' : category?.name}
                        </h4>
                        <p className="text-sm text-gray-400 mb-3">
                            {selectedCategory === 'featured' ? 'Most popular tracks' : category?.description}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {tracks.map((track) => (
                            <div
                                key={track.id}
                                className="bg-card rounded-lg p-4 hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center justify-between min-w-0">
                                    <div className="flex items-center flex-1 min-w-0 mr-2">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                                            {track.cover ? (
                                                <Image
                                                    src={track.cover}
                                                    alt={track.name}
                                                    width={48}
                                                    height={48}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        // Fallback se l'immagine non esiste
                                                        e.currentTarget.style.display = 'none'
                                                    }}
                                                />
                                            ) : (
                                                <div className="text-slate-400 text-xs"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-medium text-white truncate">{track.name}</h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handlePlayPause(track.id)
                                            }}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            {currentlyPlaying === track.id ? (
                                                <Pause className="h-5 w-5" />
                                            ) : (
                                                <Play className="h-5 w-5" />
                                            )}
                                        </Button>
                                        <AnimatedWaveform
                                            isPlaying={currentlyPlaying === track.id}
                                            trackId={track.id}
                                        />
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
                                    onClick={handleRemoveImported}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full border-gray-600 hover:bg-gray-700"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Import music file'}
                </Button>

                <div>
                    <h3 className="text-lg font-medium text-white mb-3">Library</h3>

                    <div className="mb-4">
                        <div
                            onClick={() => handleCategorySelect('featured')}
                            className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity border border-slate-600/50"
                        >
                            <h4 className="text-lg font-medium text-white">Featured</h4>
                            <p className="text-sm text-slate-300">Most popular tracks</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {musicCategories.map((category) => (
                            <div
                                key={category.id}
                                onClick={() => handleCategorySelect(category.id)}
                                className={`bg-gradient-to-br ${category.color} rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity border border-slate-700/50`}
                            >
                                <h4 className="text-lg font-medium text-white">{category.name}</h4>
                                <p className="text-sm text-slate-300">{category.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return null
}