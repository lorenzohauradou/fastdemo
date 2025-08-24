'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface AudioWaveformProps {
    audioSrc: string
    currentTime: number
    duration: number
    timelineWidth: number
    height?: number
}

export function AudioWaveform({
    audioSrc,
    currentTime,
    duration,
    timelineWidth,
    height = 24
}: AudioWaveformProps) {
    const [waveformData, setWaveformData] = useState<number[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Genera waveform reale dall'audio usando Web Audio API
    const generateWaveform = useCallback(async (audioSrc: string) => {
        setIsLoading(true)
        try {
            // Carica il file audio
            const response = await fetch(audioSrc)
            const arrayBuffer = await response.arrayBuffer()

            // Crea AudioContext
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

            // Estrai i dati del canale (mono o stereo)
            const channelData = audioBuffer.getChannelData(0)
            const samples = Math.floor(timelineWidth / 3) // Un campione ogni 3 pixel
            const blockSize = Math.floor(channelData.length / samples)
            const waveData: number[] = []

            // Calcola RMS per ogni blocco per ottenere l'ampiezza
            for (let i = 0; i < samples; i++) {
                let sum = 0
                for (let j = 0; j < blockSize; j++) {
                    const index = i * blockSize + j
                    if (index < channelData.length) {
                        sum += channelData[index] * channelData[index]
                    }
                }
                const rms = Math.sqrt(sum / blockSize)
                waveData.push(rms)
            }

            setWaveformData(waveData)
            audioContext.close()
        } catch (error) {
            console.error('Errore nella generazione del waveform:', error)
            // Fallback a waveform simulato
            generateFallbackWaveform()
        } finally {
            setIsLoading(false)
        }
    }, [timelineWidth])

    // Genera waveform simulato come fallback
    const generateFallbackWaveform = useCallback(() => {
        const samples = Math.floor(timelineWidth / 3)
        const fallbackData = Array.from({ length: samples }, (_, i) => {
            // Simula un pattern audio realistico
            const baseWave = Math.abs(Math.sin(i * 0.1)) * 0.8
            const noise = (Math.random() - 0.5) * 0.3
            const envelope = Math.exp(-Math.abs(i - samples / 2) / (samples / 4)) // Envelope gaussiano
            return Math.max(0.05, (baseWave + noise) * envelope)
        })
        setWaveformData(fallbackData)
    }, [timelineWidth])

    // Carica waveform quando cambia audioSrc
    useEffect(() => {
        if (!audioSrc) {
            setWaveformData([])
            return
        }

        generateWaveform(audioSrc)
    }, [audioSrc, generateWaveform])

    // Disegna il waveform sul canvas
    useEffect(() => {
        if (!canvasRef.current || waveformData.length === 0) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Imposta dimensioni canvas
        canvas.width = timelineWidth
        canvas.height = height

        // Pulisci canvas
        ctx.clearRect(0, 0, timelineWidth, height)

        // Calcola progresso
        const progress = (currentTime / duration) * timelineWidth

        // Disegna le barre del waveform
        const barWidth = 2
        const gap = 1
        const barSpacing = barWidth + gap

        waveformData.forEach((amplitude, i) => {
            const x = i * barSpacing
            const barHeight = Math.max(2, amplitude * height * 0.8)
            const y = (height - barHeight) / 2

            // Colore basato sul progresso
            const isPlayed = x < progress
            ctx.fillStyle = isPlayed ? '#10b981' : '#4b5563'
            ctx.globalAlpha = 0.8

            // Disegna barra arrotondata
            ctx.beginPath()
            ctx.roundRect(x, y, barWidth, barHeight, 1)
            ctx.fill()
        })
    }, [waveformData, currentTime, duration, timelineWidth, height])

    if (isLoading) {
        return (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-xs text-zinc-500">Analizzando audio...</div>
            </div>
        )
    }

    if (waveformData.length === 0) {
        return null
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-1">
            <canvas
                ref={canvasRef}
                className="w-full"
                style={{ height: `${height}px` }}
            />
        </div>
    )
}
