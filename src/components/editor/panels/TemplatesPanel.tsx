'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

const templates = [
    {
        id: 'chart-1',
        name: 'Chart Template',
        type: 'chart'
    },
    {
        id: 'chart-2',
        name: 'Chart Template',
        type: 'chart'
    }
]

const textTemplates = [
    { id: 'text-1', style: 'white', heading: 'Heading', subheading: 'Subheading' },
    { id: 'text-2', style: 'blue', heading: 'Heading', subheading: 'Subheading' },
    { id: 'text-3', style: 'blue', heading: 'Heading', subheading: 'Subheading' },
    { id: 'text-4', style: 'dark', heading: 'Heading', subheading: 'Subheading' }
]

const logoTemplates = [
    { id: 'logo-1', style: 'white', website: 'website.com' },
    { id: 'logo-2', style: 'dark', website: 'website.com' },
    { id: 'logo-3', style: 'blue', website: 'website.com' },
    { id: 'logo-4', style: 'blue', website: 'website.com' },
    { id: 'logo-5', style: 'gray', website: 'website.com' },
    { id: 'logo-6', style: 'gray', website: 'website.com' }
]

export function TemplatesPanel() {
    const { updateProject } = useEditorStore()
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId)
        updateProject({
            templateId: templateId
        })
    }

    const getTextStyle = (style: string) => {
        switch (style) {
            case 'white':
                return 'bg-background text-foreground'
            case 'blue':
                return 'bg-primary text-primary-foreground'
            case 'dark':
                return 'bg-muted text-foreground'
            default:
                return 'bg-background text-foreground'
        }
    }

    const getLogoStyle = (style: string) => {
        switch (style) {
            case 'white':
                return 'bg-background'
            case 'dark':
                return 'bg-muted'
            case 'blue':
                return 'bg-primary'
            case 'gray':
                return 'bg-muted'
            default:
                return 'bg-background'
        }
    }

    return (
        <div className="p-4 space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Templates</h2>

                <div className="grid grid-cols-2 gap-3">
                    {templates.map((template) => (
                        <Card
                            key={template.id}
                            className={`bg-muted border-border cursor-pointer transition-all hover:bg-muted/80 ${selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                                }`}
                            onClick={() => handleTemplateSelect(template.id)}
                        >
                            <div className="p-3">
                                <div className="aspect-video bg-background rounded mb-2 flex items-center justify-center">
                                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground text-center">{template.name}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Text</h3>

                <div className="grid grid-cols-2 gap-3">
                    {textTemplates.map((template) => (
                        <Card
                            key={template.id}
                            className={`${getTextStyle(template.style)} border-border cursor-pointer transition-all hover:opacity-80`}
                            onClick={() => handleTemplateSelect(template.id)}
                        >
                            <div className="p-3">
                                <div className="aspect-video rounded mb-2 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className={`font-semibold text-xs mb-1 ${template.style === 'white' ? 'text-primary' : 'text-current'
                                            }`}>
                                            {template.heading}
                                        </div>
                                        <div className={`text-xs ${template.style === 'white' ? 'text-muted-foreground' :
                                            template.style === 'blue' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                            }`}>
                                            {template.subheading}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Logos</h3>

                <div className="grid grid-cols-2 gap-3">
                    {logoTemplates.map((template) => (
                        <Card
                            key={template.id}
                            className={`${getLogoStyle(template.style)} border-border cursor-pointer transition-all hover:opacity-80`}
                            onClick={() => handleTemplateSelect(template.id)}
                        >
                            <div className="p-3">
                                <div className="aspect-video rounded mb-2 flex items-center justify-center">
                                    <div className="flex items-center">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center ${template.style === 'white' ? 'bg-background' :
                                            template.style === 'dark' ? 'bg-foreground' :
                                                'bg-foreground'
                                            }`}>
                                            <span className={`text-xs font-bold ${template.style === 'white' ? 'text-foreground' :
                                                template.style === 'dark' ? 'text-background' :
                                                    template.style === 'blue' ? 'text-primary' :
                                                        'text-background'
                                                }`}>
                                                X
                                            </span>
                                        </div>
                                        <span className={`ml-2 text-xs font-semibold ${template.style === 'white' ? 'text-background' :
                                            template.style === 'dark' ? 'text-foreground' :
                                                'text-foreground'
                                            }`}>
                                            Logo
                                        </span>
                                    </div>
                                </div>
                                <p className={`text-xs text-center ${template.style === 'white' ? 'text-muted-foreground' :
                                    template.style === 'dark' ? 'text-muted-foreground' :
                                        template.style === 'blue' ? 'text-primary-foreground/80' :
                                            'text-muted-foreground'
                                    }`}>
                                    {template.website}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}