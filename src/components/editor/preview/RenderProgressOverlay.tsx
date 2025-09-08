'use client'

import { useEditorStore } from '@/lib/store'

export function RenderProgressOverlay() {
    const { isRendering, renderProgress } = useEditorStore()

    if (!isRendering) return null

    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            <div
                className="absolute inset-0 bg-black/40 transition-all duration-300"
                style={{
                    clipPath: `polygon(${renderProgress}% 0%, 100% 0%, 100% 100%, ${renderProgress}% 100%)`
                }}
            />

            <div
                className="absolute top-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg transition-all duration-300 ease-out"
                style={{
                    width: `${renderProgress}%`,
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                }}
            />

            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                Rendering {Math.round(renderProgress)}%
            </div>
        </div>
    )
}
