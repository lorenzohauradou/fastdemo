import { useState } from 'react'
import { useAnimationFrame } from 'framer-motion'
import { Project } from '@/lib/store'
import { getCameraAnimationTransform } from '../lib/cameraAnimationUtils'

interface CameraTransform {
    x: number | string | number[]
    y: number | string | number[]
    rotateY: number | number[]
    rotateX: number | number[]
    scale: number
    z: number
}

export function useCameraAnimations(currentProject: Project | null) {
    const [continuousGlideTransform, setContinuousGlideTransform] = useState<CameraTransform>({
        x: 0,
        y: 0,
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        z: 0
    })

    // Hook per animazioni continue (continuous_glide)
    useAnimationFrame((time) => {
        if (currentProject?.cameraSettings?.type === 'continuous_glide') {
            const transform = getCameraAnimationTransform('continuous_glide', time, currentProject.cameraSettings)
            setContinuousGlideTransform(transform)
        }
    })

    // Determina quale animazione applicare
    const getCameraAnimationKey = (activeTextAnimation?: any) => {
        const cameraSettings = currentProject?.cameraSettings
        if (!cameraSettings || cameraSettings.type === 'none') {
            return activeTextAnimation ? "withText" : "full"
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
        
        // Per altre animazioni, calcola i valori
        return getCameraAnimationTransform(animationKey || 'full', 0, currentProject?.cameraSettings) as any
    }

    // Determina il tipo di transizione
    const getTransition = () => {
        const cameraType = currentProject?.cameraSettings?.type
        
        if (cameraType === 'continuous_glide') {
            return {
                type: 'tween' as const,
                duration: 0, // Nessuna transizione, usiamo i valori diretti
                ease: "linear" as const
            }
        }
        
        if (cameraType && cameraType !== 'none') {
            return {
                repeat: Infinity,
                duration: 4,
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
