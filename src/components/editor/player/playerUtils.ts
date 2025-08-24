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

    // LOGICA CORRETTA: Includi sempre il video principale se esiste
    if (hasMainVideo && videoSrc) {
        console.log('🎬 createVideoClips: Aggiungendo video principale')
        
        // Calcola l'endTime del video principale
        let mainVideoEndTime = currentProject?.duration || 10
        
        // Se ci sono clip aggiuntive, il video principale finisce quando inizia la prima clip
        if (hasMultipleClips && clipAnimations.length > 0) {
            const sortedClipAnimations = clipAnimations.sort((a, b) => a.startTime - b.startTime)
            const firstAdditionalClip = sortedClipAnimations[0]
            mainVideoEndTime = firstAdditionalClip.startTime
            console.log('🎬 Video principale finisce a:', mainVideoEndTime, 'perché inizia la prima clip aggiuntiva')
        }
        
        clips.push({
            id: 'main-video',
            startTime: 0,
            endTime: mainVideoEndTime,
            properties: {
                name: 'Main Video',
                url: videoSrc,
                originalDuration: currentProject?.duration || 10,
                duration: mainVideoEndTime,
                trimStart: currentProject?.videoTrimming?.start || 0,
                trimEnd: currentProject?.videoTrimming?.end || 0
            },
            thumbnail: videoThumbnails['main-video']
        })
    }

    // Poi aggiungi le clip aggiuntive se esistono
    if (hasMultipleClips) {
        console.log('🎬 createVideoClips: Aggiungendo clip aggiuntive:', clipAnimations.length)
        
        // Ordina le clip per startTime (ordine temporale nella timeline)
        const sortedClipAnimations = clipAnimations.sort((a, b) => a.startTime - b.startTime)
        
        sortedClipAnimations.forEach((clip, index) => {
            const videoClip: VideoClip = {
                id: clip.id,
                startTime: clip.startTime,
                endTime: clip.endTime,
                properties: {
                    name: clip.properties?.name || `Clip ${index + 1}`,
                    url: clip.properties?.url,
                    originalDuration: clip.properties?.originalDuration || clip.properties?.duration || (clip.endTime - clip.startTime),
                    duration: clip.properties?.duration || (clip.endTime - clip.startTime),
                    trimStart: clip.properties?.trimStart || 0,
                    trimEnd: clip.properties?.trimEnd || 0,
                    index: index,
                    file: clip.properties?.file
                },
                thumbnail: videoThumbnails[clip.id]
            }
            
            console.log(`🎬 Clip aggiuntiva ${index + 1}:`, {
                id: videoClip.id,
                startTime: videoClip.startTime,
                endTime: videoClip.endTime,
                duration: videoClip.endTime - videoClip.startTime,
                url: videoClip.properties.url?.substring(0, 50) + '...'
            })
            
            clips.push(videoClip)
        })
    }

    console.log('🎬 createVideoClips: Risultato finale:', clips.length, 'clip create')
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
