'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { MediaSection } from './scene/MediaSection'
import { PrimaryColorSection } from './scene/PrimaryColorSection'
import { BackgroundSection } from './scene/BackgroundSection'
import { DeviceSection } from './scene/DeviceSection'
import { ColorPickerModal } from './scene/ColorPickerModal'
import { BackgroundEditor } from './scene/BackgroundEditor'

export function ScenePanel() {
    const { currentProject, updateProject } = useEditorStore()
    const [showBackgroundEdit, setShowBackgroundEdit] = useState(false)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [selectedDevice, setSelectedDevice] = useState<string>(
        currentProject?.deviceSettings?.type || 'rectangle'
    )
    const [borderRadius, setBorderRadius] = useState([0])

    // Funzione per aggiornare le impostazioni del device
    const updateDeviceSettings = (deviceSettings: Record<string, any>) => {
        updateProject({
            deviceSettings: {
                ...currentProject?.deviceSettings,
                ...deviceSettings
            }
        })
    }

    // Funzione per gestire il cambio di border radius
    const handleBorderRadiusChange = (value: number[]) => {
        setBorderRadius(value)
        updateDeviceSettings({
            type: selectedDevice,
            borderRadius: value[0]
        })
    }

    // Gestisce la selezione del device
    const handleDeviceSelect = (deviceId: string) => {
        setSelectedDevice(deviceId)
        updateDeviceSettings({
            type: deviceId,
            borderRadius: deviceId === 'rectangle' ? borderRadius[0] : 0
        })
    }

    // Gestisce la selezione del colore primario
    const handlePrimaryColorSelect = (color: string) => {
        updateProject({ primaryColor: color })
    }

    // Gestisce il click del custom color
    const handleCustomColorClick = () => {
        setShowColorPicker(true)
    }

    // Gestisce la selezione del colore dal picker
    const handleColorPickerSelect = (color: string) => {
        updateProject({ primaryColor: color })
    }

    // Gestisce l'apertura dell'editor background
    const handleBackgroundEditOpen = () => {
        setShowBackgroundEdit(true)
    }

    // Gestisce la chiusura dell'editor background
    const handleBackgroundEditClose = () => {
        setShowBackgroundEdit(false)
    }

    if (showBackgroundEdit) {
        return (
            <BackgroundEditor
                currentProject={currentProject}
                onBack={handleBackgroundEditClose}
                onUpdateProject={updateProject}
            />
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Scene</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <MediaSection currentProject={currentProject} />

                <PrimaryColorSection
                    currentProject={currentProject}
                    onColorSelect={handlePrimaryColorSelect}
                    onCustomColorClick={handleCustomColorClick}
                />

                <BackgroundSection
                    currentProject={currentProject}
                    onEditClick={handleBackgroundEditOpen}
                />

                <DeviceSection
                    currentProject={currentProject}
                    selectedDevice={selectedDevice}
                    borderRadius={borderRadius}
                    onDeviceSelect={handleDeviceSelect}
                    onBorderRadiusChange={handleBorderRadiusChange}
                />
            </div>

            <ColorPickerModal
                isOpen={showColorPicker}
                onClose={() => setShowColorPicker(false)}
                onColorSelect={handleColorPickerSelect}
            />
        </div>
    )
}
