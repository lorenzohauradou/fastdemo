interface CameraSettings {
    type?: 'none' | 'continuous_glide' | 'up_down'
    intensity?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'diagonal'
    angle?: number
}

interface CameraTransform {
    x: number
    y: number
    rotateY: number
    rotateX: number
    scale: number
    z: number
}

// Varianti base per le animazioni
export const baseCameraVariants = {
    full: {
        scale: 1,
        x: 0,
        y: 0,
        rotateY: 0,
        rotateX: 0,
        z: 0
    },
    withText: {
        scale: 0.8,
        x: -50,
        y: 25,
        rotateY: 15,
        rotateX: -3,
        z: 50
    },
    // Nuove varianti per posizioni centrate del testo
    withTextTop: {
        scale: 0.8,
        x: 0,
        y: 100,
        rotateY: 0,
        rotateX: -5,
        z: 20
    },
    withTextBottom: {
        scale: 0.8,
        x: 0,
        y: -100,
        rotateY: 0,
        rotateX: 5,
        z: 20
    },
    withTextLeft: {
        scale: 0.8,
        x: 100,
        y: 0,
        rotateY: -8,
        rotateX: 0,
        z: 20
    },
    withTextRight: {
        scale: 0.8,
        x: -100,
        y: 0,
        rotateY: 8,
        rotateX: 0,
        z: 20
    }
}

// Calcola la trasformazione per continuous_glide
export function calculateContinuousGlide(time: number): CameraTransform {
    const progress = (time / 8000) % 1 // 6 secondi di ciclo
    const translateX = Math.sin(progress * Math.PI * 2) * 20
    const translateY = Math.cos(progress * Math.PI * 2) * 10
    const rotateY = Math.sin(progress * Math.PI * 2) * -5
    
    return {
        scale: 1,
        x: translateX,
        y: translateY,
        rotateY: rotateY,
        rotateX: 0,
        z: 0
    }
}


// Calcola la trasformazione per up_down - movimento solo verticale
export function calculateUpDown(cameraSettings: CameraSettings): CameraTransform {
    return {
        scale: 1,
        x: 0,
        y: 0, // Sarà gestito dinamicamente nel hook
        rotateY: 0,
        rotateX: 0,
        z: 0
    }
}

// Funzione per determinare la variante camera basata sulla posizione del testo
export function getCameraVariantForTextPosition(textPosition?: 'top' | 'bottom' | 'left' | 'right'): string {
    if (!textPosition) {
        return 'withText' // Default se non c'è posizione specifica
    }
    
    switch (textPosition) {
        case 'top':
            return 'withTextTop'
        case 'bottom':
            return 'withTextBottom'
        case 'left':
            return 'withTextLeft'
        case 'right':
            return 'withTextRight'
        default:
            return 'withText'
    }
}

// Funzione principale per ottenere la trasformazione
export function getCameraAnimationTransform(
    animationType: string, 
    time: number = 0, 
    cameraSettings?: CameraSettings
): CameraTransform {
    switch (animationType) {
        case 'continuous_glide':
            return calculateContinuousGlide(time)
        case 'up_down':
            return calculateUpDown(cameraSettings || {})
        case 'withText':
            return baseCameraVariants.withText as CameraTransform
        case 'withTextTop':
            return baseCameraVariants.withTextTop as CameraTransform
        case 'withTextBottom':
            return baseCameraVariants.withTextBottom as CameraTransform
        case 'withTextLeft':
            return baseCameraVariants.withTextLeft as CameraTransform
        case 'withTextRight':
            return baseCameraVariants.withTextRight as CameraTransform
        case 'full':
        default:
            return baseCameraVariants.full as CameraTransform
    }
}
