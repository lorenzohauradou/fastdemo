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
 * Crea solo la clip del video principale
 */
export const createVideoClips = (
    currentProject: any,
    hasMainVideo: boolean,
    videoSrc: string,
    videoThumbnails: { [key: string]: string }
): VideoClip[] => {
    if (!hasMainVideo || !videoSrc) return []

    return [{
        id: 'main-video',
        startTime: 0,
        endTime: currentProject?.duration || 10,
        properties: {
            name: 'Main Video',
            url: videoSrc,
            originalDuration: currentProject?.originalDuration || currentProject?.duration || 10,
            duration: currentProject?.duration || 10,
            trimStart: currentProject?.videoTrimming?.start || 0,
            trimEnd: currentProject?.videoTrimming?.end || 0
        },
        thumbnail: videoThumbnails['main-video']
    }]
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
