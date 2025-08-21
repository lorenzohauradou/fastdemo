'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Type, Plus } from 'lucide-react'

const textTemplates = [
    {
        id: 'heading-blue',
        name: 'Heading',
        subtitle: 'Subheading',
        style: 'bg-blue-600 text-white',
        properties: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#2563eb'
        }
    },
    {
        id: 'heading-white',
        name: 'Heading',
        subtitle: 'Subheading',
        style: 'bg-white text-gray-900',
        properties: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '#111827',
            backgroundColor: '#ffffff'
        }
    },
    {
        id: 'heading-gradient-blue',
        name: 'Heading',
        subtitle: 'Subheading',
        style: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
        properties: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '#ffffff',
            background: 'linear-gradient(to right, #3b82f6, #06b6d4)'
        }
    },
    {
        id: 'heading-gradient-purple',
        name: 'Heading',
        subtitle: 'Subheading',
        style: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
        properties: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '#ffffff',
            background: 'linear-gradient(to right, #8b5cf6, #ec4899)'
        }
    },
    {
        id: 'heading-dark',
        name: 'Heading',
        subtitle: 'Subheading',
        style: 'bg-gray-900 text-white',
        properties: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#111827'
        }
    }
]

export function TextPanel() {
    const { currentTime, addAnimation } = useEditorStore()
    const [customText, setCustomText] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

    const handleTemplateSelect = (templateId: string) => {
        const template = textTemplates.find(t => t.id === templateId)
        if (!template) return

        setSelectedTemplate(templateId)

        const animation = {
            type: 'text' as const,
            startTime: currentTime,
            endTime: currentTime + 3,
            properties: {
                content: template.name,
                subtitle: template.subtitle,
                x: 100,
                y: 100,
                ...template.properties
            }
        }

        addAnimation(animation)
    }

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
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-2">Text</h2>
                <p className="text-sm text-gray-400">Add text overlays to your video</p>
            </div>

            {/* Custom Text Input */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Add Custom Text</h3>
                <div className="flex space-x-2">
                    <Input
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Enter your text..."
                        className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                    <Button
                        onClick={handleAddCustomText}
                        disabled={!customText.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Text Templates */}
            <div>
                <h3 className="text-sm font-medium text-white mb-3">Text Templates</h3>
                <div className="grid grid-cols-1 gap-3">
                    {textTemplates.map((template) => (
                        <Card
                            key={template.id}
                            className={`p-4 cursor-pointer transition-all hover:scale-105 ${selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                                } ${template.style}`}
                            onClick={() => handleTemplateSelect(template.id)}
                        >
                            <div className="text-center">
                                <h4 className="text-lg font-bold">{template.name}</h4>
                                <p className="text-sm opacity-80">{template.subtitle}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}