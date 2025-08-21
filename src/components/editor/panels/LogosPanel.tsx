'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Upload, X, Globe } from 'lucide-react'

const logoTemplates = [
    {
        id: 'logo-white-circle',
        name: 'Logo',
        website: 'website.com',
        style: 'bg-white text-black',
        icon: 'circle'
    },
    {
        id: 'logo-black-circle',
        name: 'Logo',
        website: 'website.com',
        style: 'bg-black text-white',
        icon: 'circle'
    },
    {
        id: 'logo-blue-circle',
        name: 'Logo',
        website: 'website.com',
        style: 'bg-blue-600 text-white',
        icon: 'circle'
    },
    {
        id: 'logo-blue-square',
        name: 'Logo',
        website: 'website.com',
        style: 'bg-blue-600 text-white',
        icon: 'square'
    },
    {
        id: 'logo-white-square',
        name: 'Logo',
        website: 'website.com',
        style: 'bg-white text-black',
        icon: 'square'
    },
    {
        id: 'logo-black-square',
        name: 'Logo',
        website: 'website.com',
        style: 'bg-black text-white',
        icon: 'square'
    }
]

export function LogosPanel() {
    const { currentTime, addAnimation } = useEditorStore()
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
    const [logoText, setLogoText] = useState('Logo')
    const [websiteText, setWebsiteText] = useState('website.com')

    const handleTemplateSelect = (templateId: string) => {
        const template = logoTemplates.find(t => t.id === templateId)
        if (!template) return

        setSelectedTemplate(templateId)

        const animation = {
            type: 'text' as const,
            startTime: currentTime,
            endTime: currentTime + 5,
            properties: {
                content: logoText,
                subtitle: websiteText,
                x: 50,
                y: 50,
                fontSize: 20,
                fontWeight: 'bold',
                logoStyle: template.style,
                logoIcon: template.icon,
                type: 'logo'
            }
        }

        addAnimation(animation)
    }

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-2">Logos</h2>
                <p className="text-sm text-gray-400">Add your brand logo to the video</p>
            </div>

            {/* Custom Logo Upload */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Upload Custom Logo</h3>
                <label className="block w-full">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        className="w-full border-gray-600 hover:bg-gray-700"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo Image
                    </Button>
                </label>
            </div>

            {/* Logo Text Customization */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Logo Text</h3>
                <div className="space-y-2">
                    <Input
                        value={logoText}
                        onChange={(e) => setLogoText(e.target.value)}
                        placeholder="Logo text..."
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                    <Input
                        value={websiteText}
                        onChange={(e) => setWebsiteText(e.target.value)}
                        placeholder="Website URL..."
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Logo Templates */}
            <div>
                <h3 className="text-sm font-medium text-white mb-3">Logo Templates</h3>
                <div className="grid grid-cols-2 gap-3">
                    {logoTemplates.map((template) => (
                        <Card
                            key={template.id}
                            className={`p-3 cursor-pointer transition-all hover:scale-105 ${selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                                }`}
                            onClick={() => handleTemplateSelect(template.id)}
                        >
                            <div className={`p-3 rounded-lg ${template.style} text-center`}>
                                <div className="flex items-center justify-center mb-2">
                                    {template.icon === 'circle' ? (
                                        <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                                            <X className="h-3 w-3" />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded border-2 border-current flex items-center justify-center">
                                            <X className="h-3 w-3" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm font-bold">{logoText}</div>
                                <div className="text-xs opacity-80 flex items-center justify-center mt-1">
                                    <Globe className="h-3 w-3 mr-1" />
                                    {websiteText}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
