'use client'

import { VideoClip, Animation } from '@/lib/store'

interface TextOverlayProps {
    activeClip: VideoClip | null
    clipTime: number
}

export function TextOverlay({ activeClip, clipTime }: TextOverlayProps) {
    if (!activeClip) return null

    const textAnimations = activeClip.animations.filter(anim =>
        anim.type === 'text' &&
        clipTime >= anim.startTime &&
        clipTime <= anim.endTime
    )

    if (textAnimations.length === 0) return null

    return (
        <>
            {textAnimations.map((textAnim, index) => (
                <div
                    key={`text-${textAnim.id}-${index}`}
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
