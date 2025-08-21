'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { VideoUpload } from '@/components/editor/upload/VideoUpload'
import { Upload, Play, Zap, Type, Music } from 'lucide-react'

export function LandingPage() {
    const router = useRouter()
    const [isUploading, setIsUploading] = useState(false)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        try {
            // Qui implementeremo l'upload al backend
            console.log('Uploading file:', file.name)

            // Per ora simuliamo l'upload e reindirizzamo all'editor
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Salva il file nel localStorage per ora
            const videoUrl = URL.createObjectURL(file)
            localStorage.setItem('currentVideo', JSON.stringify({
                name: file.name.replace(/\.[^/.]+$/, ''),
                url: videoUrl,
                file: file.name
            }))

            router.push('/editor')
        } catch (error) {
            console.error('Errore durante l\'upload:', error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            {/* Header */}
            <header className="container mx-auto px-6 py-8">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Play className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">DemoCraft</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                        <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                        <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                            Sign In
                        </Button>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                        Create Professional
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {' '}Screen Recordings
                        </span>
                    </h1>

                    <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Transform your screen recordings into cinematic videos with smooth zoom animations,
                        professional text overlays, and custom backgrounds. No editing experience required.
                    </p>

                    {/* Upload Section */}
                    <div className="mb-16 max-w-2xl mx-auto">
                        <VideoUpload
                            onVideoUploaded={(videoData) => {
                                console.log('Video caricato:', videoData)
                            }}
                        />
                    </div>

                    {/* Features Preview */}
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                <Zap className="h-6 w-6 text-amber-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Smart Zoom</h3>
                            <p className="text-gray-400">
                                Automatic zoom animations that follow your cursor and highlight important areas
                            </p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                <Type className="h-6 w-6 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Text Overlays</h3>
                            <p className="text-gray-400">
                                Add professional titles, callouts, and annotations with beautiful animations
                            </p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                <Music className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Background Music</h3>
                            <p className="text-gray-400">
                                Choose from our curated library or upload your own soundtrack
                            </p>
                        </div>
                    </div>

                    {/* Demo Video Placeholder */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl p-2 border border-gray-700/50 max-w-4xl mx-auto">
                        <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Play className="h-10 w-10 text-blue-400" />
                                </div>
                                <p className="text-gray-400">Watch Demo Video</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="container mx-auto px-6 py-12 border-t border-gray-800">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <Play className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-white">DemoCraft</span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
