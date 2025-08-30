'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Video } from 'lucide-react'
import fixWebmDuration from 'fix-webm-duration'

interface ScreenRecorderProps {
    onRecordingComplete?: (videoData: any) => void
    className?: string
}

export function ScreenRecorder({ onRecordingComplete, className = '' }: ScreenRecorderProps) {
    const router = useRouter()
    const { setCurrentProject } = useEditorStore()
    const [isRecording, setIsRecording] = useState(false)

    const [recordingTime, setRecordingTime] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [processingProgress, setProcessingProgress] = useState(0)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(0) // Per calcolare la durata effettiva

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

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }, [])

    const startRecording = useCallback(async () => {
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
                alert('Error: unable to access screen video')
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

            // Gestisci i cambi di stato
            mediaRecorder.onstart = () => {
            }

            // Gestisci la chiusura dello stream (quando l'utente clicca "Stop sharing")
            if (videoTrack) {
                videoTrack.onended = () => {
                    // Usa setTimeout per evitare problemi di timing
                    setTimeout(() => {
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                            stopRecording()
                        }
                    }, 100)
                }
            }

            // Inizia la registrazione
            mediaRecorder.start(1000) // Salva chunk ogni secondo
            setIsRecording(true)
            setRecordingTime(0)
            startTimeRef.current = Date.now() // Salva il tempo di inizio
            startTimer()

        } catch (error) {
            alert('Error starting recording. Make sure you have given permission to share your screen.')
        }
    }, [isRecording, startTimer])



    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            // Ferma il timer
            stopTimer()
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            // Ferma lo stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
        }
    }, [isRecording, recordingTime, stopTimer])

    const handleRecordingComplete = useCallback(async () => {
        if (chunksRef.current.length === 0) {
            alert('No data recorded')
            return
        }

        setIsProcessing(true)
        setProcessingProgress(0)

        try {
            // Simula progress processing
            const progressInterval = setInterval(() => {
                setProcessingProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 20
                })
            }, 100)

            // Determina il tipo MIME e l'estensione del file
            const mimeType = chunksRef.current[0]?.type || 'video/webm'
            const extension = mimeType.includes('mp4') ? 'mp4' : 'webm'

            // durata effettiva dalla registrazione
            const actualDuration = startTimeRef.current > 0
                ? Math.round((Date.now() - startTimeRef.current) / 1000)
                : recordingTime

            // blob video iniziale
            const videoBlob = new Blob(chunksRef.current, { type: mimeType })

            // fix-webm-duration per correggere i metadati
            const fixedBlob = await fixWebmDuration(videoBlob, actualDuration * 1000) // fix-webm-duration vuole millisecondi

            const videoUrl = URL.createObjectURL(fixedBlob)
            const videoFile = new File([fixedBlob], `screen-recording-${Date.now()}.${extension}`, {
                type: mimeType
            })

            setProcessingProgress(100)
            setTimeout(async () => {
                await processVideo(actualDuration)
            }, 100)

            const processVideo = async (duration: number) => {
                const videoDuration = duration
                const videoName = `Screen Recording ${new Date().toLocaleString()}`

                // Upload del file al backend prima di creare il progetto
                try {
                    const formData = new FormData()
                    formData.append('file', videoFile)

                    const uploadResponse = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    })

                    if (!uploadResponse.ok) {
                        const errorData = await uploadResponse.json()
                        alert(`Errore upload: ${errorData.error}`)
                        setIsProcessing(false)
                        return
                    }

                    const uploadResult = await uploadResponse.json()
                    console.log('Upload screen recording completato:', uploadResult)
                } catch (uploadError) {
                    console.warn('Errore upload screen recording:', uploadError)
                    // Continua comunque per permettere il preview locale
                }

                // crea un nuovo progetto con il sistema multi-clip (stesso formato di VideoUpload)
                const newProject = {
                    name: videoName,
                    videoFilename: videoFile.name, // Salva il filename originale per il backend
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
                        videoFilename: videoFile.name, // Salva anche nella clip
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

                // Salva nel localStorage (stesso formato di VideoUpload)
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
                setProcessingProgress(0)
                chunksRef.current = []

                // Naviga all'editor
                router.push('/editor')
            }



        } catch (error) {
            alert('Error processing recording')
            setIsProcessing(false)
            setProcessingProgress(0)
        }
    }, [recordingTime, setCurrentProject, router])

    // Cleanup effect - solo quando il componente viene smontato
    React.useEffect(() => {
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
    }, []) // Array vuoto - esegue solo al mount/unmount

    if (isProcessing) {
        return (
            <div className={className}>
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
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground">Processing...</span>
                        <span className="text-sm text-muted-foreground">{processingProgress}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                </div>
            </div>
        )
    }

    if (isRecording) {
        return (
            <div className={className}>
                <Button
                    onClick={stopRecording}
                    className="w-full h-[60px] md:w-auto bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2.5 rounded-full text-sm font-medium transition-all border border-red-500/40"
                >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                    Recording {formatTime(recordingTime)} • Click to stop
                </Button>
            </div>
        )
    }

    return (
        <div className={className}>
            <Button
                onClick={startRecording}
                className="w-full h-[60px] md:w-auto bg-transparent text-white hover:bg-white/10 px-4 py-2.5 rounded-full text-sm font-medium transition-all border border-[#404040]"
                disabled={isRecording || isProcessing}
            >
                <Video className="h-4 w-4" />
                Record your screen
            </Button>
        </div>
    )
}
