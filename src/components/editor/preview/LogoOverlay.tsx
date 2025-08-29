'use client'

import { VideoClip } from '@/lib/store'

interface LogoOverlayProps {
    activeClip: VideoClip | null
    clipTime: number
}

export function LogoOverlay({ activeClip, clipTime }: LogoOverlayProps) {
    if (!activeClip) return null

    const logoAnimations = activeClip.animations.filter(anim =>
        anim.type === 'logo' &&
        clipTime >= anim.startTime &&
        clipTime <= anim.endTime
    )

    if (logoAnimations.length === 0) return null

    return (
        <>
            {logoAnimations.map((logoAnim, index) => {
                const progress = (clipTime - logoAnim.startTime) / (logoAnim.endTime - logoAnim.startTime)

                const getAnimationStyle = () => {
                    const baseStyle = {
                        left: `${logoAnim.properties.position?.x || 85}%`,
                        top: `${logoAnim.properties.position?.y || 85}%`,
                        transform: 'translate(-50%, -50%)',
                        opacity: logoAnim.properties.logoOpacity || 0.9
                    }

                    switch (logoAnim.properties.animation) {
                        case 'slideDown':
                            return {
                                ...baseStyle,
                                transform: `translate(-50%, -50%) translateY(${-50 * (1 - progress)}px)`,
                                opacity: progress * (logoAnim.properties.logoOpacity || 0.9)
                            }
                        case 'slideLeft':
                            return {
                                ...baseStyle,
                                transform: `translate(-50%, -50%) translateX(${50 * (1 - progress)}px)`,
                                opacity: progress * (logoAnim.properties.logoOpacity || 0.9)
                            }
                        case 'slideRight':
                            return {
                                ...baseStyle,
                                transform: `translate(-50%, -50%) translateX(${-50 * (1 - progress)}px)`,
                                opacity: progress * (logoAnim.properties.logoOpacity || 0.9)
                            }
                        case 'fadeIn':
                        default:
                            return {
                                ...baseStyle,
                                opacity: progress * (logoAnim.properties.logoOpacity || 0.9)
                            }
                    }
                }

                return (
                    <div
                        key={`logo-${logoAnim.id}-${index}`}
                        className="absolute pointer-events-none"
                        style={getAnimationStyle()}
                    >
                        {/* Logo */}
                        {logoAnim.properties.logoUrl && (
                            <img
                                src={logoAnim.properties.logoUrl}
                                alt="Logo"
                                className="max-w-none"
                                style={{
                                    width: `${logoAnim.properties.size || 100}px`,
                                    height: 'auto',
                                    marginBottom: logoAnim.properties.headlineText ? '8px' : '0'
                                }}
                            />
                        )}

                        {/* Headline Text */}
                        {logoAnim.properties.headlineText && (
                            <div className="text-center">
                                <div
                                    style={{
                                        fontSize: `${logoAnim.properties.fontSize || 32}px`,
                                        fontWeight: logoAnim.properties.fontWeight || 'bold',
                                        color: logoAnim.properties.color || '#ffffff',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    {logoAnim.properties.headlineText}
                                </div>
                                {logoAnim.properties.subheadlineText && (
                                    <div
                                        className="mt-1 opacity-80"
                                        style={{
                                            fontSize: `${(logoAnim.properties.fontSize || 32) * 0.6}px`,
                                            color: logoAnim.properties.color || '#ffffff',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                        }}
                                    >
                                        {logoAnim.properties.subheadlineText}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </>
    )
}
