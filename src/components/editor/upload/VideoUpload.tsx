'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload } from 'lucide-react'

interface VideoUploadProps {
    onVideoUploaded?: (videoData: any) => void
    className?: string
}

export function VideoUpload({ onVideoUploaded, className = '' }: VideoUploadProps) {
    const router = useRouter()
    const { setCurrentProject } = useEditorStore()
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

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
            alert('Please upload a video file (MP4, MOV, AVI)')
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleVideoFile(file)
        }
    }

    const handleVideoFile = async (file: File) => {
        const maxSize = 500 * 1024 * 1024
        if (file.size > maxSize) {
            alert('The file is too large. Maximum size: 500MB')
            return
        }

        const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/webm']
        const isValidType = allowedTypes.some(type => file.type.startsWith(type))

        if (!isValidType) {
            alert('Unsupported format. Use MP4, MOV, AVI or WebM')
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        try {
            // Upload a Vercel Blob tramite API route
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/video/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Error during upload')
            }

            const uploadResult = await response.json()
            const videoUrl = uploadResult.url
            const videoName = file.name.replace(/\.[^/.]+$/, '')

            // Simula progress upload veloce
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 20
                })
            }, 50)

            setUploadProgress(100)

            const tempVideo = document.createElement('video')
            tempVideo.src = videoUrl

            tempVideo.onloadedmetadata = () => {
                const videoDuration = tempVideo.duration

                // Crea un nuovo progetto con il sistema multi-clip
                const newProject = {
                    name: videoName,
                    videoFilename: file.name,
                    blobUrl: videoUrl,
                    videoUrl: videoUrl,
                    videoFile: file,
                    duration: videoDuration,
                    originalDuration: videoDuration,
                    clips: [{
                        id: 'main-video',
                        name: videoName,
                        startTime: 0,
                        endTime: videoDuration,
                        duration: videoDuration,
                        videoFile: file,
                        videoUrl: videoUrl,
                        videoFilename: file.name,
                        blobUrl: videoUrl,
                        originalDuration: videoDuration,
                        animations: [],
                        trimStart: 0,
                        trimEnd: 0
                    }],
                    activeClipId: 'main-video',
                    musicSettings: {
                        type: 'preset' as const,
                        volume: 0.5
                    }
                }

                // Salva nel localStorage
                localStorage.setItem('currentVideo', JSON.stringify({
                    name: videoName,
                    url: videoUrl,
                    file: file.name,
                    size: file.size,
                    type: file.type
                }))

                setCurrentProject(newProject)
                router.push('/editor')
                setIsUploading(false)
            }

            // Fallback se non riusciamo a ottenere la durata
            tempVideo.onerror = () => {
                const newProject = {
                    name: videoName,
                    videoFilename: file.name,
                    blobUrl: videoUrl,
                    videoUrl: videoUrl,
                    videoFile: file,
                    duration: 30,
                    originalDuration: 30,
                    clips: [{
                        id: 'main-video',
                        name: videoName,
                        startTime: 0,
                        endTime: 30,
                        duration: 30,
                        videoFile: file,
                        videoUrl: videoUrl,
                        videoFilename: file.name,
                        blobUrl: videoUrl,
                        originalDuration: 30,
                        animations: [],
                        trimStart: 0,
                        trimEnd: 0
                    }],
                    activeClipId: 'main-video',
                    musicSettings: {
                        type: 'preset' as const,
                        volume: 0.5
                    }
                }

                // Salva nel localStorage
                localStorage.setItem('currentVideo', JSON.stringify({
                    name: videoName,
                    url: videoUrl,
                    file: file.name,
                    size: file.size,
                    type: file.type
                }))

                setCurrentProject(newProject)
                router.push('/editor')
                setIsUploading(false)
            }

        } catch (error) {
            console.error('Upload error:', error)
            alert(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`)
            setIsUploading(false)
        }
    }



    return (
        <div className={className}>
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${isUploading
                    ? 'border-border bg-muted/50 cursor-not-allowed'
                    : isDragging
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                onDragOver={!isUploading ? handleDragOver : undefined}
                onDragLeave={!isUploading ? handleDragLeave : undefined}
                onDrop={!isUploading ? handleDrop : undefined}
            >
                <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <Upload className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {isUploading ? 'Processing video...' : isDragging ? 'Drop the video here' : 'Upload your video'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {isUploading ? 'Please wait while we prepare your video' : 'Drag and drop a video file or click to select'}
                        </p>
                        {!isUploading && (
                            <p className="text-sm text-muted-foreground/80">
                                Supports MP4, MOV, AVI, WebM • Max 500MB
                            </p>
                        )}
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
                            disabled={isUploading}
                        >
                            {isUploading ? 'Processing...' : 'Select File'}
                        </Button>
                    </div>
                </div>
            </div>

            {isUploading && (
                <div className="mt-4 bg-card rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground">Uploading...</span>
                        <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                </div>
            )}
        </div>
    )
}
