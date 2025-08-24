export interface VideoClip {
    id: string
    startTime: number
    endTime: number
    properties: {
        name?: string
        url?: string
        originalDuration?: number
        duration?: number
        trimStart?: number
        trimEnd?: number
        index?: number
        file?: File
    }
    thumbnail?: string
}

export interface AudioClip {
    id: string
    startTime: number
    endTime: number
    properties: {
        name?: string
        url?: string
        originalDuration?: number
        duration?: number
        trimStart?: number
        trimEnd?: number
        fileName?: string
    }
}

/**
 * Genera thumbnail da un video
 */
export const generateVideoThumbnail = async (
    videoUrl: string, 
    clipId: string,
    onThumbnailGenerated: (clipId: string, thumbnail: string) => void
): Promise<void> => {
    return new Promise((resolve) => {
        const video = document.createElement('video')
        video.crossOrigin = 'anonymous'
        video.src = videoUrl
        video.muted = true

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        video.addEventListener('loadedmetadata', () => {
            canvas.width = 64
            canvas.height = 40
            video.currentTime = Math.min(1, video.duration / 4) // Prendi frame al 25% del video
        })

        video.addEventListener('seeked', () => {
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
                onThumbnailGenerated(clipId, thumbnail)
                resolve()
            }
        })

        video.addEventListener('error', () => {
            console.error('Errore nel caricamento del video per thumbnail:', videoUrl)
            resolve() // Risolvi anche in caso di errore
        })
    })
}

/**
 * Crea le clip video dal progetto corrente
 */
export const createVideoClips = (
    currentProject: any,
    clipAnimations: any[],
    hasMainVideo: boolean,
    hasMultipleClips: boolean,
    videoSrc: string,
    videoThumbnails: { [key: string]: string }
): VideoClip[] => {
    const clips: VideoClip[] = []
    let currentStartTime = 0

    // Ordina sempre le clip per timestamp di creazione per mantenere l'ordine
    const sortedClipAnimations = clipAnimations.sort((a, b) => {
        const getTimestamp = (id: string) => {
            const match = id.match(/anim_(\d+)_/)
            return match ? parseInt(match[1]) : 0
        }

        const timestampA = getTimestamp(a.id)
        const timestampB = getTimestamp(b.id)

        if (timestampA && timestampB) {
            return timestampA - timestampB
        }

        return a.startTime - b.startTime
    })

    // Se c'è un video principale E delle clip, crea una clip principale dalle animazioni o dal progetto
    if (hasMainVideo && hasMultipleClips) {
        // Cerca se esiste già un'animazione per il video principale
        let mainVideoClip = sortedClipAnimations.find(clip => clip.id === 'main-video' || clip.properties?.isMainVideo)
        
        if (!mainVideoClip) {
            // Se non esiste, crea una clip principale dalle impostazioni del progetto
            const mainVideoDuration = currentProject?.videoTrimming?.duration || currentProject?.duration || 10
            mainVideoClip = {
                id: 'main-video',
                type: 'clip',
                startTime: 0,
                endTime: mainVideoDuration,
                properties: {
                    name: 'Main Video',
                    url: videoSrc,
                    originalDuration: currentProject?.duration || 10,
                    duration: mainVideoDuration,
                    trimStart: currentProject?.videoTrimming?.start || 0,
                    trimEnd: currentProject?.videoTrimming?.end || 0,
                    isMainVideo: true
                }
            }
        }

        // Aggiungi la clip principale
        clips.push({
            ...mainVideoClip,
            startTime: 0,
            endTime: mainVideoClip.endTime,
            properties: {
                ...mainVideoClip.properties,
                originalDuration: mainVideoClip.properties?.originalDuration || (currentProject?.duration || 10),
                isMainVideo: true
            },
            thumbnail: videoThumbnails['main-video']
        })
        currentStartTime = mainVideoClip.endTime

        // Poi aggiungi le altre clip (escludi la main-video se era già nelle animazioni)
        const otherClips = sortedClipAnimations.filter(clip => 
            clip.id !== 'main-video' && !clip.properties?.isMainVideo
        )
        
        otherClips.forEach((clip, index) => {
            const clipDuration = clip.properties?.duration || (clip.endTime - clip.startTime)

            clips.push({
                ...clip,
                startTime: currentStartTime,
                endTime: currentStartTime + clipDuration,
                properties: {
                    ...clip.properties,
                    originalDuration: clip.properties?.originalDuration || clipDuration,
                    duration: clipDuration,
                    index: index + 1
                },
                thumbnail: videoThumbnails[clip.id]
            })
            currentStartTime += clipDuration
        })

            } else if (hasMultipleClips) {
            // Solo clip multiple: usa ESATTAMENTE i valori salvati nelle animazioni
            sortedClipAnimations.forEach((clip, index) => {
                clips.push({
                    ...clip,
                    // USA ESATTAMENTE startTime e endTime dall'animazione salvata
                    startTime: clip.startTime,
                    endTime: clip.endTime,
                    properties: {
                        ...clip.properties,
                        // Assicurati che originalDuration sia sempre definita
                        originalDuration: clip.properties?.originalDuration || (clip.endTime - clip.startTime),
                        // Usa la durata dalle proprietà se disponibile, altrimenti calcola
                        duration: clip.properties?.duration || (clip.endTime - clip.startTime),
                        index: index
                    },
                    thumbnail: videoThumbnails[clip.id]
                })
            })

    } else if (hasMainVideo) {
        // Solo video principale: una sola clip che rappresenta tutto il video
        clips.push({
            id: 'main-video',
            startTime: 0,
            endTime: currentProject?.duration || 10,
            properties: {
                name: 'Main Video',
                url: videoSrc,
                originalDuration: currentProject?.duration || 10,
                trimStart: currentProject?.videoTrimming?.start || 0,
                trimEnd: currentProject?.videoTrimming?.end || 0
            },
            thumbnail: videoThumbnails['main-video']
        })
    }

    return clips
}

/**
 * Crea le clip audio dal progetto corrente
 */
export const createAudioClips = (
    currentProject: any,
    audioSrc: string,
    totalVideoDuration: number
): AudioClip[] => {
    const audioClips: AudioClip[] = []

    if (audioSrc) {
        audioClips.push({
            id: 'main-audio',
            startTime: 0,
            endTime: totalVideoDuration,
            properties: {
                name: currentProject?.musicSettings?.fileName || 'Audio Track',
                url: audioSrc,
                originalDuration: totalVideoDuration,
                trimStart: 0,
                trimEnd: 0
            }
        })
    }

    return audioClips
}

/**
 * Calcola i pixels per secondo per la timeline - VALORE FISSO
 */
export const calculatePixelsPerSecond = (
    timelineWidth: number,
    duration: number
): number => {
    return 3
}
