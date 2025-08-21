'use client'

import { useEditorStore } from '@/lib/store'
import { MusicPanel } from '@/components/editor/panels/MusicPanel'
import { AnimationPanel } from '@/components/editor/panels/AnimationPanel'
import { TextPanel } from '@/components/editor/panels/TextPanel'
import { LogosPanel } from '@/components/editor/panels/LogosPanel'
import { TemplatesPanel } from '@/components/editor/panels/TemplatesPanel'
import { LogoHeadlinePanel } from '@/components/editor/panels/LogoHeadlinePanel'
import { BackgroundPanel } from '@/components/editor/panels/BackgroundPanel'
import { Button } from '@/components/ui/button'
import { Music, Zap, Type, Image, Layout, FileText, Palette } from 'lucide-react'

const panels = [
    { id: 'templates' as const, label: 'Templates', icon: Layout },
    { id: 'text' as const, label: 'Text', icon: Type },
    { id: 'animation' as const, label: 'Animation', icon: Zap },
    { id: 'music' as const, label: 'Music', icon: Music },
    { id: 'logos' as const, label: 'Logos', icon: Image },
]

export function Sidebar() {
    const { selectedPanel, setSelectedPanel } = useEditorStore()

    const renderPanelContent = () => {
        switch (selectedPanel) {
            case 'music':
                return <MusicPanel />
            case 'animation':
                return <AnimationPanel />
            case 'text':
                return <TextPanel />
            case 'logos':
                return <LogosPanel />
            case 'logoheadline':
                return <LogoHeadlinePanel />
            case 'background':
                return <BackgroundPanel />
            case 'templates':
                return <TemplatesPanel />
            default:
                return <MusicPanel />
        }
    }

    return (
        <div className="flex h-full">
            {/* Vertical Navigation */}
            <div className="w-16 bg-background border-r border-border flex flex-col">
                {panels.map((panel) => {
                    const Icon = panel.icon
                    return (
                        <Button
                            key={panel.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPanel(panel.id)}
                            className={`w-full h-16 rounded-none border-0 flex flex-col items-center justify-center gap-1 ${selectedPanel === panel.id
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{panel.label}</span>
                        </Button>
                    )
                })}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto bg-card">
                {renderPanelContent()}
            </div>
        </div>
    )
}
