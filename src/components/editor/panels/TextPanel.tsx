'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'

export function TextPanel() {
    const { currentTime, addAnimation } = useEditorStore()
    const [customText, setCustomText] = useState('')

    const handleAddCustomText = () => {
        if (!customText.trim()) return

        const animation = {
            type: 'text' as const,
            startTime: currentTime,
            endTime: currentTime + 3,
            properties: {
                content: customText,
                x: 100,
                y: 100,
                fontSize: 24,
                fontWeight: 'normal',
                color: '#ffffff'
            }
        }

        addAnimation(animation)
        setCustomText('')
    }

    return (
        <div className="p-4 space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white mb-2">Text</h2>
                <p className="text-sm text-primary-400">Add text overlays to your video</p>
            </div>
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Add Custom Text</h3>
                <div className="flex space-x-2">
                    <Input
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Enter your text..."
                        className="flex-1 bg-zinc-800 border-zinc-600 text-white placeholder-zinc-400"
                    />
                    <Button
                        onClick={handleAddCustomText}
                        disabled={!customText.trim()}
                        className="bg-zinc-800 hover:bg-zinc600"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}