import { useState } from 'react'
import { useAnimationFrame } from 'framer-motion'
import { Project } from '@/lib/store'
import { getCameraAnimationTransform, getCameraVariantForTextPosition } from '../lib/cameraAnimationUtils'

interface CameraTransform {
    x: number | string | number[]
    y: number | string | number[]
    rotateY: number | number[]
    rotateX: number | number[]
    scale: number
    z: number
}

export function useCameraAnimations(currentProject: Project | null, isPlaying: boolean = false) {
    const [continuousGlideTransform, setContinuousGlideTransform] = useState<CameraTransform>({
        x: 0,
        y: 0,
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        z: 0
    })

    const [upDownTransform, setUpDownTransform] = useState<CameraTransform>({
        x: 0,
        y: 0,
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        z: 0
    })

    // Hook animazioni continue
    useAnimationFrame((time) => {
        // si attivano solo se il video è in play
        if (!isPlaying) return
        
        if (currentProject?.cameraSettings?.type === 'continuous_glide') {
            const transform = getCameraAnimationTransform('continuous_glide', time, currentProject.cameraSettings)
            setContinuousGlideTransform(transform)
        } else if (currentProject?.cameraSettings?.type === 'up_down') {
            const progress = (time / 4000) % 1 // 4 secondi di ciclo
            const translateY = Math.sin(progress * Math.PI * 2) * 10 + 10
            setUpDownTransform({
                x: 0,
                y: translateY,
                rotateY: 0,
                rotateX: 0,
                scale: 1,
                z: 0
            })
        }
    })

    // Determina quale animazione applicare
    const getCameraAnimationKey = (activeTextAnimation?: any) => {
        const cameraSettings = currentProject?.cameraSettings
        if (!cameraSettings || cameraSettings.type === 'none') {
            if (activeTextAnimation) {
                // Se c'è un testo attivo, determina la variante basata sulla sua posizione
                const textPosition = activeTextAnimation.properties?.position
                return getCameraVariantForTextPosition(textPosition)
            }
            return "full"
        }
        return cameraSettings.type
    }

    // Ottieni le varianti per l'animazione corrente
    const getCurrentVariant = (activeTextAnimation?: any) => {
        const animationKey = getCameraAnimationKey(activeTextAnimation)
        
        // Per continuous_glide, usa i valori calcolati in tempo reale
        if (animationKey === 'continuous_glide') {
            return continuousGlideTransform as any
        }
        
        // Per up_down, usa i valori calcolati in tempo reale
        if (animationKey === 'up_down') {
            return upDownTransform as any
        }
        
        // Per altre animazioni, calcola i valori
        return getCameraAnimationTransform(animationKey || 'full', 0, currentProject?.cameraSettings) as any
    }

    // Determina il tipo di transizione
    const getTransition = () => {
        const cameraType = currentProject?.cameraSettings?.type
        
        if (cameraType === 'continuous_glide' || cameraType === 'up_down') {
            return {
                type: 'tween' as const,
                duration: 0, // Nessuna transizione, usiamo i valori diretti
                ease: "linear" as const
            }
        }
        
        return {
            type: 'spring' as const,
            stiffness: 200,
            damping: 25
        }
    }

    return {
        getCurrentVariant,
        getTransition,
        getCameraAnimationKey
    }
}
