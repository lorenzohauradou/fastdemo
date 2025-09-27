"use client"

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Image from "next/image"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useRef, useState, useCallback } from "react"
import { useEditorStore } from "@/lib/store"
import { upload } from '@vercel/blob/client'

export function Header() {
    const isMobile = useIsMobile()
    const router = useRouter()
    const { setCurrentProject } = useEditorStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const processVideoAndNavigate = useCallback(async (file: File) => {
        const maxSize = 500 * 1024 * 1024
        if (file.size > maxSize) {
            alert('file is too large. Maximum size: 500MB')
            return
        }

        const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/webm']
        const isValidType = allowedTypes.some(type => file.type.startsWith(type))

        if (!isValidType) {
            alert('Unsupported format. Use MP4, MOV, AVI or WebM')
            return
        }

        setIsProcessing(true)

        try {
            // Upload diretto a Vercel Blob (bypassa il limite di 4.5MB)
            const blob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/video/upload',
            })

            const videoUrl = blob.url
            const videoName = file.name.replace(/\.[^/.]+$/, '')

            // Crea URL locale temporaneo per ottenere la durata
            const tempVideoUrl = URL.createObjectURL(file)
            const tempVideo = document.createElement('video')
            tempVideo.src = tempVideoUrl

            tempVideo.onloadedmetadata = () => {
                const videoDuration = tempVideo.duration

                // Pulisci l'URL temporaneo
                URL.revokeObjectURL(tempVideoUrl)

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

                router.push('/editor')
                setIsProcessing(false)
            }

            tempVideo.onerror = () => {
                alert('Error processing video')
                setIsProcessing(false)
            }
        } catch (error) {
            console.error('Errore upload:', error)
            alert(`Error uploading video: ${error instanceof Error ? error.message : 'Unknown error'}`)
            setIsProcessing(false)
        }
    }, [router, setCurrentProject])

    const handleDemoClick = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            processVideoAndNavigate(file)
        }
    }, [processVideoAndNavigate])

    return (
        <motion.header
            className="fixed bg-transparent backdrop-blur-sm top-0 w-full z-50"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <motion.div
                        className="w-12 h-12 md:w-15 md:h-15 flex items-center justify-center overflow-hidden"
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Image
                            src="/favicon.ico"
                            alt="SnapScreen Logo"
                            width={64}
                            height={64}
                            className="object-contain w-full h-full"
                        />
                    </motion.div>
                    <motion.span
                        className="ml-4 text-2xl font-bold text-white min-w-[200px]"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Snap Screen
                    </motion.span>
                </Link>
                <motion.nav
                    className="hidden lg:flex space-x-8 justify-start items-left w-full ml-16"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                        <Link
                            href="#features"
                            className="text-gray-300 hover:text-white transition-colors font-xl"
                        >
                            Features
                        </Link>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                        <Link
                            href="#pricing"
                            className="text-gray-300 hover:text-white transition-colors font-xl"
                        >
                            Pricing
                        </Link>
                    </motion.div>

                    <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Link
                            href="/faq"
                            className="text-gray-300 hover:text-white transition-colors font-xl"
                        >
                            FAQ
                        </Link>
                    </motion.div>
                </motion.nav>
                <motion.div
                    className="flex items-center space-x-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <Button
                                onClick={handleDemoClick}
                                disabled={isProcessing}
                                className={`bg-white pr-6 md:mr-0 text-black hover:bg-gray-100 text-sm font-medium px-4 py-2 rounded-full transition-all disabled:opacity-50 ${isMobile ? 'w-full' : ''}`}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <LoadingSpinner size="sm" className="text-black" />
                                        Processing...
                                    </div>
                                ) : (
                                    isMobile ? 'Free Demo' : 'Get Free Demo'
                                )}
                            </Button>
                        </motion.div>
                    </>
                </motion.div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </motion.header>
    )
}
