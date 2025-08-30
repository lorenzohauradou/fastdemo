interface CameraSettings {
    type?: 'none' | 'continuous_glide' | 'skewed_glide' | 'up_down'
    intensity?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'diagonal'
    angle?: number
}

interface CameraTransform {
    x: number | string | number[]
    y: number | string | number[]
    rotateY: number | number[]
    rotateX: number | number[]
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
        x: '-10%',
        y: '5%',
        rotateY: 15,
        rotateX: -3,
        z: 50
    }
}

// Calcola la trasformazione per continuous_glide
export function calculateContinuousGlide(time: number): CameraTransform {
    const progress = (time / 8000) % 1 // 8 secondi di ciclo
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

// Calcola la trasformazione per skewed_glide
export function calculateSkewedGlide(cameraSettings: CameraSettings): CameraTransform {
    const intensity = cameraSettings?.intensity || 1
    const direction = cameraSettings?.direction || 'diagonal'
    const angle = cameraSettings?.angle || 0
    
    // Calcola i valori base
    let baseRotateY = [-8 * intensity, 8 * intensity, -8 * intensity]
    let baseRotateX = [4 * intensity, -4 * intensity, 4 * intensity]
    
    // Applica la direzione
    switch (direction) {
        case 'up':
            baseRotateX = baseRotateX.map(val => Math.abs(val))
            break
        case 'down':
            baseRotateX = baseRotateX.map(val => -Math.abs(val))
            break
        case 'left':
            baseRotateY = baseRotateY.map(val => Math.abs(val))
            break
        case 'right':
            baseRotateY = baseRotateY.map(val => -Math.abs(val))
            break
    }
    
    // Applica l'angolo personalizzato
    const angleRad = (angle * Math.PI) / 180
    const finalRotateY = baseRotateY.map((ry, i) => 
        ry * Math.cos(angleRad) - baseRotateX[i] * Math.sin(angleRad)
    )
    const finalRotateX = baseRotateY.map((ry, i) => 
        ry * Math.sin(angleRad) + baseRotateX[i] * Math.cos(angleRad)
    )
    
    return {
        scale: 1,
        x: 0,
        y: 0,
        rotateY: [0, ...finalRotateY, 0] as any,
        rotateX: [0, ...finalRotateX, 0] as any,
        z: 0
    }
}

// Calcola la trasformazione per up_down - movimento solo verticale
export function calculateUpDown(cameraSettings: CameraSettings): CameraTransform {
    const intensity = cameraSettings?.intensity || 1
    return {
        scale: 1,
        x: 0, // Nessun movimento orizzontale
        y: [0, -20 * intensity, 20 * intensity, 0] as any, // Solo movimento verticale
        rotateY: 0, // Nessuna rotazione
        rotateX: 0, // Nessuna rotazione per mantenere in primo piano
        z: 0
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
        case 'skewed_glide':
            return calculateSkewedGlide(cameraSettings || {})
        case 'up_down':
            return calculateUpDown(cameraSettings || {})
        case 'withText':
            return baseCameraVariants.withText as CameraTransform
        case 'full':
        default:
            return baseCameraVariants.full as CameraTransform
    }
}
