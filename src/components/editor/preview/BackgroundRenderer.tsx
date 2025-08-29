'use client'

import { BackgroundSettings } from '@/lib/store'

interface BackgroundRendererProps {
    backgroundSettings?: BackgroundSettings
    children: React.ReactNode
    className?: string
}

export function BackgroundRenderer({ backgroundSettings, children, className = '' }: BackgroundRendererProps) {
    // Funzioni utility per generare i background
    const generateLinearGradientCSS = (colors: string[], angle: number): string => {
        return `linear-gradient(${angle}deg, ${colors.join(', ')})`
    }

    const generateMeshGradientCSS = (colors: string[]): string => {
        const gradients = [
            `radial-gradient(at 40% 20%, ${colors[0]} 0px, transparent 50%)`,
            `radial-gradient(at 80% 0%, ${colors[1]} 0px, transparent 50%)`,
            `radial-gradient(at 0% 50%, ${colors[2]} 0px, transparent 50%)`,
            `radial-gradient(at 80% 50%, ${colors[3]} 0px, transparent 50%)`,
            `radial-gradient(at 0% 100%, ${colors[0]} 0px, transparent 50%)`,
            `radial-gradient(at 80% 100%, ${colors[1]} 0px, transparent 50%)`,
            `radial-gradient(at 40% 100%, ${colors[2]} 0px, transparent 50%)`
        ]
        return gradients.join(', ')
    }

    // Verifica se c'è un background applicato
    const hasBackground = () => {
        if (!backgroundSettings) return false
        return backgroundSettings.type !== 'none' && backgroundSettings.type !== undefined
    }

    // Calcola lo stile del background
    const getBackgroundStyle = () => {
        if (!backgroundSettings) return { backgroundColor: '#000000' }

        const bg = backgroundSettings
        const opacity = bg.opacity || 1

        switch (bg.type) {
            case 'none':
                return { backgroundColor: 'transparent' }
            case 'solid':
                return {
                    backgroundColor: bg.color || '#000000',
                    opacity
                }
            case 'linear-gradient':
                if (bg.gradientColors && bg.gradientColors.length >= 2) {
                    return {
                        background: generateLinearGradientCSS(
                            bg.gradientColors,
                            bg.gradientAngle || 180
                        ),
                        opacity
                    }
                }
                break
            case 'mesh-gradient':
                if (bg.meshColors && bg.meshColors.length >= 4) {
                    return {
                        background: generateMeshGradientCSS(bg.meshColors),
                        opacity
                    }
                }
                break
            case 'image':
                if (bg.imageUrl) {
                    return {
                        backgroundImage: `url(${bg.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: bg.blur ? `blur(${bg.blur}px)` : 'none',
                        opacity
                    }
                }
                break
            default:
                return { backgroundColor: '#000000' }
        }

        // Fallback
        return { backgroundColor: '#000000' }
    }

    return (
        <div
            className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
            style={getBackgroundStyle()}
            data-has-background={hasBackground()}
        >
            {children}
        </div>
    )
}
