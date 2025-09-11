'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Monitor, RotateCcw, X, Upload, Video } from 'lucide-react'
import { Project, useEditorStore } from '@/lib/store'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import fixWebmDuration from 'fix-webm-duration'

interface MediaSectionProps {
    currentProject: Project | null
}

export function MediaSection({ currentProject }: MediaSectionProps) {
    const router = useRouter()
    const { setCurrentProject } = useEditorStore()
    const [isUploading, setIsUploading] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(0)

    const formatDuration = (duration: number) => {
        const minutes = Math.floor(duration / 60)
        const seconds = (duration % 60).toFixed(0).padStart(2, '0')
        return `${minutes}:${seconds}`
    }

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }, [])

    const startTimer = useCallback(() => {
        timerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1)
        }, 1000)
    }, [])

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }, [])

    // Gestione upload video
    const handleVideoUpload = useCallback(async (file: File) => {
        // Validazione del file
        const maxSize = 500 * 1024 * 1024 // 500MB
        if (file.size > maxSize) {
            alert('file is too large. Maximum size: 500MB')
            return
        }

        const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/webm']
        const isWebM = file.type.startsWith('video/webm')
        const isAllowedType = allowedTypes.includes(file.type) || isWebM

        if (!isAllowedType) {
            alert('Unsupported format. Use MP4, MOV, AVI or WebM')
            return
        }

        setIsUploading(true)

        try {
            // Upload del file al backend
            const formData = new FormData()
            formData.append('file', file)

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })


            const uploadResult = await uploadResponse.json()

            // URL locale per il preview
            const videoUrl = URL.createObjectURL(file)
            const videoName = file.name.replace(/\.[^/.]+$/, '')

            // durata del video
            const tempVideo = document.createElement('video')
            tempVideo.src = videoUrl

            tempVideo.onloadedmetadata = () => {
                const videoDuration = tempVideo.duration

                // Crea un nuovo progetto con il sistema multi-clip
                const newProject = {
                    name: videoName,
                    videoFilename: file.name,
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
                setIsUploading(false)
            }


        } catch (error) {
            console.error('Upload error:', error)
            alert('Error during video upload')
            setIsUploading(false)
        }
    }, [setCurrentProject])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleVideoUpload(file)
        }
    }, [handleVideoUpload])

    const handleImportVideo = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleNewScreenRecording = useCallback(async () => {
        try {
            // Richiedi accesso allo schermo
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                },
                audio: true
            })

            // Verifica che lo stream sia attivo
            const videoTrack = stream.getVideoTracks()[0]
            if (!videoTrack || videoTrack.readyState === 'ended') {
                alert('Error: unable to access the screen video')
                return
            }

            streamRef.current = stream
            chunksRef.current = []

            // Crea MediaRecorder con fallback per diversi formati
            let mediaRecorder: MediaRecorder
            const supportedMimeTypes = [
                'video/webm;codecs=vp9,opus',
                'video/webm;codecs=vp8,opus',
                'video/webm',
                'video/mp4'
            ]

            let selectedMimeType = 'video/webm'
            for (const mimeType of supportedMimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    selectedMimeType = mimeType
                    break
                }
            }

            mediaRecorder = new MediaRecorder(stream, {
                mimeType: selectedMimeType
            })

            mediaRecorderRef.current = mediaRecorder

            // Gestisci i dati della registrazione
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            // Gestisci la fine della registrazione
            mediaRecorder.onstop = async () => {
                await handleRecordingComplete()
            }

            // Gestisci errori del MediaRecorder
            mediaRecorder.onerror = (event) => {
                alert('Error during recording')
                setIsRecording(false)
                stopTimer()
            }

            // Gestisci la chiusura dello stream (quando l'utente clicca "Stop sharing")
            if (videoTrack) {
                videoTrack.onended = () => {
                    setTimeout(() => {
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                            stopRecording()
                        }
                    }, 100)
                }
            }

            // Inizia la registrazione
            mediaRecorder.start(1000)
            setIsRecording(true)
            setRecordingTime(0)
            startTimeRef.current = Date.now()
            startTimer()

        } catch (error) {
            alert('Error starting recording. Ensure you have given permission to share the screen.')
        }
    }, [startTimer])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            stopTimer()
            mediaRecorderRef.current.stop()
            setIsRecording(false)

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
        }
    }, [isRecording, stopTimer])

    const handleRecordingComplete = useCallback(async () => {
        if (chunksRef.current.length === 0) {
            alert('No data recorded')
            return
        }

        setIsProcessing(true)

        try {
            // Determina il tipo MIME e l'estensione del file
            const mimeType = chunksRef.current[0]?.type || 'video/webm'
            const extension = mimeType.includes('mp4') ? 'mp4' : 'webm'

            // Durata effettiva dalla registrazione
            const actualDuration = startTimeRef.current > 0
                ? Math.round((Date.now() - startTimeRef.current) / 1000)
                : recordingTime

            // Blob video iniziale
            const videoBlob = new Blob(chunksRef.current, { type: mimeType })

            // Fix-webm-duration per correggere i metadati
            const fixedBlob = await fixWebmDuration(videoBlob, actualDuration * 1000)

            const videoUrl = URL.createObjectURL(fixedBlob)
            const videoFile = new File([fixedBlob], `screen-recording-${Date.now()}.${extension}`, {
                type: mimeType
            })

            const videoDuration = actualDuration
            const videoName = `Screen Recording ${new Date().toLocaleString()}`

            // Upload del file al backend
            try {
                const formData = new FormData()
                formData.append('file', videoFile)

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json()
                    console.warn(`Upload error: ${errorData.error}`)
                    // Non bloccare il flusso, continua con il video locale
                }

            } catch (uploadError) {
                console.warn('Errore upload screen recording:', uploadError)
            }

            // Crea un nuovo progetto
            const newProject = {
                name: videoName,
                videoFilename: videoFile.name,
                videoUrl: videoUrl,
                videoFile: videoFile,
                duration: videoDuration,
                originalDuration: videoDuration,
                clips: [{
                    id: 'main-video',
                    name: videoName,
                    startTime: 0,
                    endTime: videoDuration,
                    duration: videoDuration,
                    videoFile: videoFile,
                    videoUrl: videoUrl,
                    videoFilename: videoFile.name,
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
                file: videoFile.name,
                size: videoFile.size,
                type: videoFile.type
            }))

            setCurrentProject(newProject)

            // Reset stato
            setRecordingTime(0)
            setIsProcessing(false)
            setIsRecording(false)
            chunksRef.current = []
            router.push('/editor')

        } catch (error) {
            alert('Error processing recording')
            setIsProcessing(false)
            setIsRecording(false)
            setRecordingTime(0)
            chunksRef.current = []
        }
    }, [recordingTime, setCurrentProject, router])

    const handleRemoveVideo = useCallback(() => {
        localStorage.removeItem('currentVideo')
        setCurrentProject(null)
    }, [setCurrentProject])

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop()
            }
        }
    }, [])

    // Se stiamo processando la registrazione
    if (isProcessing) {
        return (
            <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Media</h3>
                <div className="bg-card rounded-lg p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Video className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Processing recording...
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        Please wait while we prepare your screen recording
                    </p>
                </div>
            </div>
        )
    }

    // Se stiamo registrando
    if (isRecording) {
        return (
            <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Media</h3>
                <div className="text-center space-y-3">
                    <Button
                        onClick={stopRecording}
                        className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40"
                    >
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                        Recording {formatTime(recordingTime)} • Click to stop
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Media</h3>

            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {(currentProject?.videoUrl || currentProject?.videoFile || (currentProject?.clips && currentProject.clips.length > 0 && currentProject.clips[0]?.videoUrl)) ? (
                <Card className="bg-muted/30 border-muted">
                    <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-9 bg-muted rounded overflow-hidden flex-shrink-0">
                                <video
                                    src={currentProject.videoUrl || (currentProject.videoFile ? URL.createObjectURL(currentProject.videoFile) : '') || (currentProject.clips?.[0]?.videoUrl)}
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0"
                                        onClick={handleRemoveVideo}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {formatDuration(currentProject.duration || 0)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center mt-2 pt-2 border-t border-border gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={handleImportVideo}
                                disabled={isUploading}
                            >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Replace
                            </Button>

                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center space-y-3">
                    {isUploading ? (
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                                Uploading video...
                            </div>
                        </div>
                    ) : (
                        <>
                            <Button
                                className="w-full h-8 hover:bg-gray-700"
                                variant="default"
                                size="sm"
                                onClick={handleNewScreenRecording}
                            >
                                <Monitor className="h-3 w-3 mr-2" />
                                New screen recording
                            </Button>
                            <Button
                                className="w-full h-8"
                                variant="outline"
                                size="sm"
                                onClick={handleImportVideo}
                            >
                                <Upload className="h-3 w-3 mr-2" />
                                Import video
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
