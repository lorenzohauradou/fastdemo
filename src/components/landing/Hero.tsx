"use client"

import { Button } from "@/components/ui/button"
import { Link2, Brain } from "lucide-react"
// import { useSession } from "next-auth/react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { Video } from "./Video"
import { ScreenRecorder } from "./ScreenRecorder"
import { useRouter } from "next/navigation"
import { useRef, useState, useCallback } from "react"
import { useEditorStore } from "@/lib/store"

export function Hero() {
    // const { data: session } = useSession()
    const isMobile = useIsMobile()
    const router = useRouter()
    const { setCurrentProject } = useEditorStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Funzione per processare il video e navigare all'editor
    const processVideoAndNavigate = useCallback(async (file: File) => {
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

        setIsProcessing(true)

        try {
            // Upload prima di creare il progetto
            const formData = new FormData()
            formData.append('file', file)
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json()
                alert(`Upload error: ${errorData.error}`)
                setIsProcessing(false)
                return
            }

            const uploadResult = await uploadResponse.json()
            console.log('Upload completed:', uploadResult)

            // Crea URL locale per il preview
            const videoUrl = URL.createObjectURL(file)
            const videoName = file.name.replace(/\.[^/.]+$/, '')

            // Ottieni la durata del video
            const tempVideo = document.createElement('video')
            tempVideo.src = videoUrl

            tempVideo.onloadedmetadata = () => {
                const videoDuration = tempVideo.duration

                // Crea il progetto con struttura multi-clip
                const newProject = {
                    name: videoName,
                    videoFilename: file.name, // Salva il filename originale per il backend
                    clips: [{
                        id: 'main-video',
                        name: videoName,
                        startTime: 0,
                        endTime: videoDuration,
                        duration: videoDuration,
                        videoFile: file,
                        videoUrl: videoUrl,
                        videoFilename: file.name, // Salva anche nella clip
                        originalDuration: videoDuration,
                        animations: [],
                        trimStart: 0,
                        trimEnd: 0
                    }],
                    activeClipId: 'main-video',
                    duration: videoDuration,
                    musicSettings: {
                        type: 'preset' as const,
                        volume: 0.5
                    }
                }

                // Imposta il progetto nello store
                setCurrentProject(newProject)

                // Naviga all'editor
                router.push('/editor')
            }

            tempVideo.onerror = () => {
                alert('Error uploading video')
                setIsProcessing(false)
            }
        } catch (error) {
            alert('Error uploading video')
            setIsProcessing(false)
        }
    }, [router, setCurrentProject])

    // Gestione click su Upload
    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    // Gestione selezione file
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            processVideoAndNavigate(file)
        }
    }, [processVideoAndNavigate])

    // Gestione drag & drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // Solo se stiamo uscendo dal container principale
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        const videoFile = files.find(file => file.type.startsWith('video/'))

        if (videoFile) {
            processVideoAndNavigate(videoFile)
        } else {
            alert('Please upload a video file (MP4, MOV, AVI, WebM)')
        }
    }, [processVideoAndNavigate])

    return (
        <section
            className={`relative min-h-screen bg-black overflow-hidden transition-all duration-300 ${isDragging ? 'bg-zinc-900/50' : ''
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="absolute inset-0 bg-black"></div>
            {isDragging && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center text-white">
                        <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
                            <Link2 className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-medium">Drop your video here</p>
                        <p className="text-sm text-gray-400 mt-1">MP4, MOV, AVI, WebM supported</p>
                    </div>
                </div>
            )}
            <div className="relative z-10 container mx-auto px-4 pt-36 sm:pt-28 md:pt-36 pb-8 sm:pb-12 md:pb-16">
                <div className="text-center mb-8 md:mb-12">

                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-[1.05] text-white max-w-6xl mx-auto px-2">
                        <span className="block mb-1">
                            Turn Screen Recordings into Stunning Demos

                        </span>
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-[#d1d5db] mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
                        Add fluid 3D animations, smooth zooms, and dynamic backgrounds to your SaaS showcase in minutes
                    </p>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-3 mb-8 md:mb-12 px-4 max-w-5xl mx-auto">
                        <div className="w-full md:w-[400px] flex items-center bg-zinc-800/60 backdrop-blur-sm border border-gray-700 rounded-full px-3 sm:px-4 py-2.5">
                            <Link2 className="w-4 h-4 text-[#9ca3af] mr-2 flex-shrink-0" />
                            <span className="text-[#bbbcbe] text-xs sm:text-sm flex-1 truncate">Add your screen recording</span>
                            <Button
                                onClick={handleUploadClick}
                                disabled={isProcessing}
                                className="ml-2 bg-white text-black hover:bg-gray-100 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                                {isProcessing ? 'Processing...' : isMobile ? 'Upload' : 'Upload video'}
                            </Button>
                        </div>

                        <span className="text-[#9ca3af] font-medium text-sm hidden md:block">or</span>

                        <ScreenRecorder />
                    </div>
                </div>
                <Video />
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </section>
    )
}