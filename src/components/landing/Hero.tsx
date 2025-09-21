"use client"

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Link2 } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Video } from "./Video"
import { ScreenRecorder } from "./ScreenRecorder"
import { useRouter } from "next/navigation"
import { useRef, useState, useCallback } from "react"
import { useEditorStore } from "@/lib/store"
import { motion } from "framer-motion"

export function Hero() {
    const isMobile = useIsMobile()
    const router = useRouter()
    const { setCurrentProject } = useEditorStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const processVideoAndNavigate = useCallback(async (file: File) => {
        const maxSize = 500 * 1024 * 1024
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
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/video/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Errore durante l\'upload')
            }

            const uploadResult = await response.json()
            const videoUrl = uploadResult.url
            const videoName = file.name.replace(/\.[^/.]+$/, '')

            // Ottieni la durata del video
            const tempVideo = document.createElement('video')
            tempVideo.src = videoUrl

            tempVideo.onloadedmetadata = () => {
                const videoDuration = tempVideo.duration

                // Crea il progetto con struttura multi-clip
                const newProject = {
                    name: videoName,
                    videoFilename: file.name,
                    blobUrl: videoUrl,
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
                setIsProcessing(false)
            }

            tempVideo.onerror = () => {
                alert('Error processing video')
                setIsProcessing(false)
            }
        } catch (error) {
            console.error('Errore upload:', error)
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
            className={`relative min-h-screen bg-black transition-all duration-300 ${isDragging ? 'bg-zinc-900/50' : ''
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

                    <motion.h1
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-[1.05] text-white max-w-6xl mx-auto px-2"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <span className="block mb-1">
                            Turn Screen Recordings into Stunning Demos

                        </span>
                    </motion.h1>
                    <motion.p
                        className="text-sm sm:text-base md:text-lg text-[#d1d5db] mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed px-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                    >
                        Add fluid 3D animations, smooth zooms, and dynamic backgrounds to your SaaS showcase in minutes
                    </motion.p>

                    <motion.div
                        className="flex flex-col md:flex-row justify-center items-center gap-3 mb-8 md:mb-12 px-4 max-w-5xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                    >
                        <motion.div
                            className="w-full md:w-[400px] flex items-center bg-zinc-800/60 backdrop-blur-sm border border-gray-700 rounded-full px-3 sm:px-4 py-2.5"
                            whileHover={{ scale: 1.02, borderColor: "rgba(156, 163, 175, 0.5)" }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <Link2 className="w-4 h-4 text-[#9ca3af] mr-2 flex-shrink-0" />
                            <span className="text-[#bbbcbe] text-xs sm:text-sm flex-1 truncate">Add your screen recording</span>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Button
                                    onClick={handleUploadClick}
                                    disabled={isProcessing}
                                    className="ml-2 bg-white text-black hover:bg-gray-100 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all disabled:opacity-50 whitespace-nowrap"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <LoadingSpinner size="sm" className="text-black" />
                                            Processing...
                                        </div>
                                    ) : (
                                        isMobile ? 'Upload' : 'Upload video'
                                    )}
                                </Button>
                            </motion.div>
                        </motion.div>

                        <motion.span
                            className="text-[#9ca3af] font-medium text-sm hidden md:block"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                        >
                            or
                        </motion.span>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                        >
                            <ScreenRecorder />
                        </motion.div>
                    </motion.div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                >
                    <Video />
                </motion.div>
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