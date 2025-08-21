'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditorStore } from '@/lib/store'
import { useApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Play, FileVideo } from 'lucide-react'

interface VideoUploadProps {
    onVideoUploaded?: (videoData: any) => void
    className?: string
}

export function VideoUpload({ onVideoUploaded, className = '' }: VideoUploadProps) {
    const router = useRouter()
    const api = useApi()
    const { setCurrentProject } = useEditorStore()
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadedVideo, setUploadedVideo] = useState<{
        file: File
        url: string
        name: string
    } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        const videoFile = files.find(file => file.type.startsWith('video/'))

        if (videoFile) {
            handleVideoFile(videoFile)
        } else {
            alert('Per favore, carica un file video (MP4, MOV, AVI)')
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleVideoFile(file)
        }
    }

    const handleVideoFile = async (file: File) => {
        // Validazione del file
        const maxSize = 500 * 1024 * 1024 // 500MB
        if (file.size > maxSize) {
            alert('Il file è troppo grande. Dimensione massima: 500MB')
            return
        }

        const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi']
        if (!allowedTypes.includes(file.type)) {
            alert('Formato non supportato. Usa MP4, MOV o AVI')
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        try {
            // Crea URL locale per il preview
            const videoUrl = URL.createObjectURL(file)

            // Salva localmente per ora
            const videoData = {
                file,
                url: videoUrl,
                name: file.name.replace(/\.[^/.]+$/, ''),
                size: file.size,
                type: file.type
            }

            setUploadedVideo(videoData)

            // Simula progress upload
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 100)

            // Upload usando l'API client
            try {
                const result = await api.uploadVideo(file)
                console.log('✅ Video caricato:', result)
                setUploadProgress(100)

                if (result.note) {
                    console.info('ℹ️ Nota:', result.note)
                }
            } catch (error) {
                console.warn('⚠️ Errore durante upload:', error)
                setUploadProgress(100)
            }

            // Salva nel localStorage
            localStorage.setItem('currentVideo', JSON.stringify({
                name: videoData.name,
                url: videoData.url,
                file: file.name,
                size: file.size,
                type: file.type
            }))

            // Callback
            if (onVideoUploaded) {
                onVideoUploaded(videoData)
            }

        } catch (error) {
            console.error('Errore durante l\'upload:', error)
            alert('Errore durante il caricamento del video')
        } finally {
            setIsUploading(false)
        }
    }

    const handleStartEditing = () => {
        if (!uploadedVideo) return

        // Crea un nuovo progetto
        const newProject = {
            name: uploadedVideo.name,
            videoUrl: uploadedVideo.url,
            duration: 0, // Sarà aggiornato quando il video si carica
            animations: [],
            musicSettings: {
                type: 'preset' as const,
                volume: 0.5
            }
        }

        setCurrentProject(newProject)
        router.push('/editor')
    }

    const handleRemoveVideo = () => {
        if (uploadedVideo?.url) {
            URL.revokeObjectURL(uploadedVideo.url)
        }
        setUploadedVideo(null)
        setUploadProgress(0)
        localStorage.removeItem('currentVideo')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    if (uploadedVideo) {
        return (
            <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Video Caricato</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveVideo}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-4">
                    {/* Video Preview */}
                    <div className="aspect-video bg-background rounded-lg overflow-hidden">
                        <video
                            src={uploadedVideo.url}
                            className="w-full h-full object-contain"
                            controls
                            preload="metadata"
                        />
                    </div>

                    {/* Video Info */}
                    <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                            <FileVideo className="h-5 w-5 text-primary" />
                            <div>
                                <h4 className="text-foreground font-medium">{uploadedVideo.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {(uploadedVideo.file.size / (1024 * 1024)).toFixed(1)} MB • {uploadedVideo.file.type}
                                </p>
                            </div>
                        </div>

                        {isUploading && (
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">Caricamento...</span>
                                    <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                            </div>
                        )}

                        <Button
                            onClick={handleStartEditing}
                            disabled={isUploading}
                            className="w-full bg-primary hover:bg-primary/90"
                        >
                            <Play className="mr-2 h-4 w-4" />
                            Inizia Editing
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={className}>
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <Upload className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {isDragging ? 'Rilascia il video qui' : 'Carica il tuo video'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Trascina e rilascia un file video o clicca per selezionare
                        </p>
                        <p className="text-sm text-muted-foreground/80">
                            Supporta MP4, MOV, AVI • Max 500MB
                        </p>
                    </div>

                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="border-border hover:bg-muted"
                        >
                            Seleziona File
                        </Button>
                    </div>
                </div>
            </div>

            {isUploading && (
                <div className="mt-4 bg-card rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground">Caricamento in corso...</span>
                        <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                </div>
            )}
        </div>
    )
}
