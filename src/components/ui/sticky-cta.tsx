"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Link2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEditorStore } from "@/lib/store"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"

export function StickyCTA() {
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const router = useRouter()
    const { setCurrentProject } = useEditorStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const isMobile = useIsMobile()
    // Funzione per processare il video e navigare all'editor
    const processVideoAndNavigate = useCallback(async (file: File) => {
        // Validazione del file
        const maxSize = 500 * 1024 * 1024 // 500MB
        if (file.size > maxSize) {
            alert('Il file è troppo grande. Dimensione massima: 500MB')
            return
        }

        const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/webm']
        if (!allowedTypes.includes(file.type)) {
            alert('Formato non supportato. Usa MP4, MOV, AVI o WebM')
            return
        }

        setIsProcessing(true)

        try {
            // Crea URL locale per il preview
            const videoUrl = URL.createObjectURL(file)
            const videoName = file.name.replace(/\.[^/.]+$/, '')

            // Ottieni la durata del video
            const tempVideo = document.createElement('video')
            tempVideo.src = videoUrl

            tempVideo.onloadedmetadata = () => {
                const videoDuration = tempVideo.duration

                // Crea il progetto con la nuova struttura multi-clip
                const newProject = {
                    name: videoName,
                    clips: [{
                        id: 'main-video',
                        name: videoName,
                        startTime: 0,
                        endTime: videoDuration,
                        duration: videoDuration,
                        videoFile: file,
                        videoUrl: videoUrl,
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
                alert('Errore nel caricamento del video')
                setIsProcessing(false)
            }
        } catch (error) {
            console.error('Errore durante il processamento del video:', error)
            alert('Errore durante il caricamento del video')
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

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY
            const windowHeight = window.innerHeight

            const finalCTA = document.querySelector('#final-cta')
            const finalCTAPosition = finalCTA ? finalCTA.getBoundingClientRect().top + window.scrollY - windowHeight : Infinity

            if (scrollPosition > windowHeight * 0.8 &&
                scrollPosition < (finalCTAPosition || Infinity) &&
                !isDismissed) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isDismissed])

    if (isDismissed) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed bottom-0 left-0 right-0 z-50"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        opacity: { duration: 0.2 }
                    }}
                >
                    <div className="px-4 py-6 pb-6">
                        <div className="container mx-auto max-w-xl">
                            <div className="flex items-center justify-center gap-4">
                                <motion.div
                                    className="flex w-full items-center bg-transparent backdrop-blur-sm border border-purple-300/50 rounded-full px-4 py-2.5"
                                    whileHover={{
                                        scale: 1.02,
                                        borderColor: "rgba(168, 85, 247, 0.8)",
                                        boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)"
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 3,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Link2 className="w-4 h-4 text-[#9ca3af] mr-2 flex-shrink-0" />
                                    </motion.div>
                                    <span className="text-[#d1d5db] text-sm flex-1 whitespace-nowrap">Add your screen recording and ...</span>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <Button
                                            onClick={handleUploadClick}
                                            disabled={isProcessing}
                                            className={`ml-2 bg-white text-black hover:bg-gray-100 px-4 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-50 `}
                                        >
                                            {isProcessing ? 'Processing...' : isMobile ? 'Get Demo' : 'Upload Video'}
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
} 