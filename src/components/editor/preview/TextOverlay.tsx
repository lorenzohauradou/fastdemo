'use client'

import { VideoClip, Animation } from '@/lib/store'

interface TextOverlayProps {
    activeClip: VideoClip | null
    clipTime: number
}

export function TextOverlay({ activeClip, clipTime }: TextOverlayProps) {
    if (!activeClip) return null

    // Filtra solo le animazioni di testo che NON sono nella transizione principale
    // (quelle con posizioni specifiche x,y invece della coreografia automatica)
    const overlayTextAnimations = activeClip.animations.filter(anim =>
        anim.type === 'text' &&
        clipTime >= anim.startTime &&
        clipTime <= anim.endTime &&
        (anim.properties.x !== undefined || anim.properties.y !== undefined) // Solo testi con posizione specifica
    )

    if (overlayTextAnimations.length === 0) return null

    return (
        <>
            {overlayTextAnimations.map((textAnim, index) => (
                <div
                    key={`text-overlay-${textAnim.id}-${index}`}
                    className="absolute pointer-events-none"
                    style={{
                        left: `${textAnim.properties.x || 100}px`,
                        top: `${textAnim.properties.y || 100}px`,
                        fontSize: `${textAnim.properties.fontSize || 24}px`,
                        fontWeight: textAnim.properties.fontWeight || 'normal',
                        color: textAnim.properties.color || '#ffffff',
                        backgroundColor: textAnim.properties.backgroundColor || 'transparent',
                        padding: textAnim.properties.padding || '0',
                        borderRadius: textAnim.properties.borderRadius || '0',
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                    }}
                >
                    {textAnim.properties.content}
                    {textAnim.properties.subtitle && (
                        <div className="text-sm opacity-80 mt-1">
                            {textAnim.properties.subtitle}
                        </div>
                    )}
                </div>
            ))}
        </>
    )
}
