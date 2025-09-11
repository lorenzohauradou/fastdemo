'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Loader2, Plus, AudioLines, X } from 'lucide-react'
import { useApi } from '@/lib/api'

const speakers = [
    {
        id: 'adam',
        name: 'Adam',
        tags: ['Deep', 'Narrator', 'Professional'],
        image: '/images/speakers/adam.png'
    },
    {
        id: 'alice',
        name: 'Alice',
        tags: ['Clear', 'Friendly', 'Energetic'],
        image: '/images/speakers/alice.png'
    },
    {
        id: 'brian',
        name: 'Brian',
        tags: ['Calm', 'Warm', 'Trustworthy'],
        image: '/images/speakers/brian.png'
    },
    {
        id: 'charlie',
        name: 'Charlie',
        tags: ['Dynamic', 'Confident', 'Modern'],
        image: '/images/speakers/charlie.png'
    },
    {
        id: 'dorothy',
        name: 'Dorothy',
        tags: ['Pleasant', 'Clear', 'Engaging'],
        image: '/images/speakers/dorothy.png'
    },
    {
        id: 'elli',
        name: 'Elli',
        tags: ['Youthful', 'Bright', 'Cheerful'],
        image: '/images/speakers/elli.png'
    },
    {
        id: 'fin',
        name: 'Fin',
        tags: ['Smooth', 'Professional', 'Articulate'],
        image: '/images/speakers/fin.png'
    },
    {
        id: 'freya',
        name: 'Freya',
        tags: ['Sophisticated', 'Elegant', 'Refined'],
        image: '/images/speakers/freya.png'
    },
    {
        id: 'george',
        name: 'George',
        tags: ['Authoritative', 'Strong', 'Commanding'],
        image: '/images/speakers/george.png'
    },
    {
        id: 'grace',
        name: 'Grace',
        tags: ['Gentle', 'Soothing', 'Melodic'],
        image: '/images/speakers/grace.png'
    }
]

export function VoiceoverPanel() {
    const {
        currentProject,
        updateProject,
        addAnimation,
        getCurrentClipTime,
        getActiveClip,
        selectedAnimation,
        setSelectedAnimation,
        removeAnimation
    } = useEditorStore()
    // Verifica se c'è un voiceover selezionato dalla timeline
    const selectedVoiceoverAnimation = selectedAnimation?.type === 'voiceover' ? selectedAnimation : null

    const [text, setText] = useState(
        selectedVoiceoverAnimation?.properties.text ||
        currentProject?.voiceoverSettings?.text ||
        ''
    )
    const [selectedSpeaker, setSelectedSpeaker] = useState(
        selectedVoiceoverAnimation?.properties.speaker?.id ||
        currentProject?.voiceoverSettings?.speaker?.id ||
        speakers[0].id
    )
    const [isGenerating, setIsGenerating] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const previewAudioRef = useRef<HTMLAudioElement | null>(null)
    const api = useApi()

    // Cleanup audio quando il componente si smonta
    useEffect(() => {
        return () => {
            if (previewAudioRef.current) {
                previewAudioRef.current.pause()
                previewAudioRef.current = null
            }
        }
    }, [])

    // Aggiorna il testo quando cambia la selezione del voiceover
    useEffect(() => {
        if (selectedVoiceoverAnimation) {
            setText(selectedVoiceoverAnimation.properties.text || '')
            setSelectedSpeaker(selectedVoiceoverAnimation.properties.speaker?.id || speakers[0].id)
        } else {
            setText(currentProject?.voiceoverSettings?.text || '')
            setSelectedSpeaker(currentProject?.voiceoverSettings?.speaker?.id || speakers[0].id)
        }
    }, [selectedVoiceoverAnimation, currentProject?.voiceoverSettings])

    const handleTextChange = (value: string) => {
        setText(value)
        const speaker = speakers.find(s => s.id === selectedSpeaker) || speakers[0]

        // Se c'è un voiceover selezionato dalla timeline, aggiorna quello specifico
        if (selectedVoiceoverAnimation) {
            const { updateAnimation } = useEditorStore.getState()
            updateAnimation(selectedVoiceoverAnimation.id, {
                properties: {
                    ...selectedVoiceoverAnimation.properties,
                    text: value,
                    speaker
                }
            })
        }
        updateProject({
            voiceoverSettings: {
                text: value,
                speaker,
                audioUrl: currentProject?.voiceoverSettings?.audioUrl,
                audioFilename: currentProject?.voiceoverSettings?.audioFilename,
                isGenerating: false
            }
        })
    }

    const handleSpeakerChange = (speakerId: string) => {
        setSelectedSpeaker(speakerId)
        const speaker = speakers.find(s => s.id === speakerId) || speakers[0]

        // Se c'è un voiceover selezionato dalla timeline, aggiorna quello specifico
        if (selectedVoiceoverAnimation) {
            const { updateAnimation } = useEditorStore.getState()
            updateAnimation(selectedVoiceoverAnimation.id, {
                properties: {
                    ...selectedVoiceoverAnimation.properties,
                    text,
                    speaker
                }
            })
        }
        updateProject({
            voiceoverSettings: {
                text,
                speaker,
                audioUrl: currentProject?.voiceoverSettings?.audioUrl,
                audioFilename: currentProject?.voiceoverSettings?.audioFilename,
                isGenerating: false
            }
        })
    }

    const handleGenerateVoiceover = async () => {
        if (!text.trim()) {
            alert('Enter text to generate the voiceover')
            return
        }

        setIsGenerating(true)
        const speaker = speakers.find(s => s.id === selectedSpeaker) || speakers[0]
        updateProject({
            voiceoverSettings: {
                text,
                speaker,
                isGenerating: true
            }
        })

        try {
            const response = await api.generateVoiceover({
                text,
                speaker_id: selectedSpeaker
            })

            // Costruisci l'URL per l'anteprima
            const previewUrl = `/api/download/audio/${response.filename}`
            setPreviewUrl(previewUrl)

            updateProject({
                voiceoverSettings: {
                    text,
                    speaker,
                    audioUrl: previewUrl,
                    audioFilename: response.filename,
                    isGenerating: false
                }
            })
        } catch (error) {
            console.error('Errore generazione voiceover:', error)
            alert('Error generating voiceover')

            updateProject({
                voiceoverSettings: {
                    text,
                    speaker,
                    isGenerating: false
                }
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const handlePlayPreview = () => {
        const audioUrl = previewUrl || currentProject?.voiceoverSettings?.audioUrl
        if (!audioUrl) return

        // Ferma l'audio precedente se esiste
        if (previewAudioRef.current) {
            previewAudioRef.current.pause()
            previewAudioRef.current = null
        }

        // Crea nuovo audio e riproduci
        const audio = new Audio(audioUrl)
        previewAudioRef.current = audio
        audio.play().catch(console.warn)

        // Auto-cleanup quando finisce
        audio.onended = () => {
            previewAudioRef.current = null
        }
    }

    const handleAddToTimeline = () => {
        if (!currentProject?.voiceoverSettings?.audioFilename || !text.trim()) {
            alert('Generate a voiceover first to add it to the timeline')
            return
        }

        const activeClip = getActiveClip()
        if (!activeClip) {
            alert('No active clip found. Please select a clip first.')
            return
        }

        // Usa il tempo relativo alla clip attiva
        const clipTime = getCurrentClipTime()
        const startTime = Math.max(0, Math.min(clipTime, activeClip.duration - 1))
        // Durata fissa di 0.5 secondi (l'utente può sempre ridimensionare)
        const endTime = Math.min(startTime + 0.5, activeClip.duration)

        addAnimation({
            type: 'voiceover',
            startTime,
            endTime, // Durata fissa della maniglia (solo indicativa)
            properties: {
                text: text,
                speaker: currentProject.voiceoverSettings.speaker,
                audioFilename: currentProject.voiceoverSettings.audioFilename,
                audioUrl: currentProject.voiceoverSettings.audioUrl,
                // La durata reale sarà determinata dal file audio nel backend
                actualStartTime: startTime, // Tempo di inizio reale nel video
                isIndicatorOnly: true // Flag per indicare che endTime è solo indicativo
            }
        })
    }

    const handleDeleteVoiceover = (voiceoverId: string, e: React.MouseEvent) => {
        e.stopPropagation() // Previene il click sulla card
        removeAnimation(voiceoverId)
        if (selectedAnimation?.id === voiceoverId) {
            setSelectedAnimation(null)
        }
    }

    const selectedSpeakerData = speakers.find(s => s.id === selectedSpeaker) || speakers[0]

    // Ottieni i voiceover della clip attiva
    const activeClip = getActiveClip()
    const voiceoverAnimations = activeClip?.animations.filter(anim => anim.type === 'voiceover') || []

    return (
        <div className="p-4 space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-white">AI Voiceover</h2>
                <p className="text-sm text-zinc-400 mt-1">Generate professional voiceover for your video</p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-white">Script</label>
                <div className="relative">
                    <Textarea
                        value={text}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder="Enter your voiceover script here..."
                        className="min-h-[120px] bg-zinc-800 border-zinc-600 text-white placeholder-zinc-400 resize-none"
                        disabled={isGenerating}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-zinc-500">
                        {text.length} characters
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-medium text-white">Speaker</label>
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 w-full flex flex-col items-center">
                    <Select value={selectedSpeaker} onValueChange={handleSpeakerChange} disabled={isGenerating}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white h-12 text-base">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-zinc-700">
                                    <Image
                                        src={selectedSpeakerData.image}
                                        alt={selectedSpeakerData.name}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="font-medium">{selectedSpeakerData.name}</span>
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-600">
                            {speakers.map((speaker) => (
                                <SelectItem
                                    key={speaker.id}
                                    value={speaker.id}
                                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                                >
                                    <div className="flex items-center gap-3 py-1">
                                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-zinc-700">
                                            <Image
                                                src={speaker.image}
                                                alt={speaker.name}
                                                width={32}
                                                height={32}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-base">{speaker.name}</span>
                                            <span className="text-xs text-zinc-400">
                                                {speaker.tags.join(' • ')}
                                            </span>
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex flex-wrap gap-2 mt-3 justify-center">
                        {selectedSpeakerData.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 text-xs bg-zinc-700/50 text-zinc-300 rounded border border-zinc-600/50"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <Button
                onClick={handleGenerateVoiceover}
                disabled={!text.trim() || isGenerating}
                className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-white border-purple-500/50 hover:border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] backdrop-blur-sm transition-all duration-300"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <AudioLines className="mr-2 h-4 w-4" />
                        Generate Voiceover
                    </>
                )}
            </Button>

            {(previewUrl || currentProject?.voiceoverSettings?.audioUrl) && (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Generated Audio</label>
                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-5 border border-gray-700/50 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-white">
                                    {selectedSpeakerData.name} - Voiceover
                                </h4>
                                <p className="text-xs text-gray-400">
                                    {text.length} characters • {selectedSpeakerData.tags[0]}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePlayPreview}
                                    className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-200"
                                >
                                    <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleAddToTimeline}
                                    className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-200"
                                    title="Add to Timeline"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-px max-w-full overflow-hidden">
                            {Array.from({ length: 60 }, (_, i) => (
                                <div
                                    key={i}
                                    className="w-0.5 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full flex-shrink-0 opacity-80"
                                    style={{
                                        height: `${Math.sin(i * 0.15) * 8 + Math.sin(i * 0.08) * 6 + 12}px`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {voiceoverAnimations.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white">Voiceover Elements</h3>
                    <div className="space-y-2">
                        {voiceoverAnimations.map((voiceoverAnim) => (
                            <div
                                key={voiceoverAnim.id}
                                className={`p-3 bg-zinc-800 rounded-lg border cursor-pointer transition-colors group ${selectedAnimation?.id === voiceoverAnim.id
                                    ? 'border-purple-500 bg-purple-500/10'
                                    : 'border-zinc-700 hover:border-zinc-600'
                                    }`}
                                onClick={() => setSelectedAnimation(voiceoverAnim)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-zinc-700">
                                            {voiceoverAnim.properties.speaker?.id && (
                                                <Image
                                                    src={speakers.find(s => s.id === voiceoverAnim.properties.speaker.id)?.image || '/images/speakers/adam.png'}
                                                    alt={voiceoverAnim.properties.speaker.name || 'Speaker'}
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">
                                                {voiceoverAnim.properties.text || 'Untitled Voiceover'}
                                            </p>
                                            <p className="text-gray-400 text-xs">
                                                {voiceoverAnim.properties.speaker?.name || 'Unknown'} • {voiceoverAnim.properties.text?.length || 0} chars
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {voiceoverAnim.properties.audioUrl && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    const audio = new Audio(voiceoverAnim.properties.audioUrl)
                                                    audio.play().catch(console.warn)
                                                }}
                                                className="p-1 hover:bg-purple-600/20 rounded transition-all"
                                                title="Play voiceover"
                                            >
                                                <Play className="h-3 w-3 text-purple-400" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleDeleteVoiceover(voiceoverAnim.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
                                            title="Delete voiceover"
                                        >
                                            <X className="h-3 w-3 text-gray-400 hover:text-white" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
