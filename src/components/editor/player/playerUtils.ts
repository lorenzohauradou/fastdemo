import { VideoClip } from '@/lib/store'

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
 * Crea le clip video dal progetto (supporta multi-clip)
 */
export const createVideoClips = (
    currentProject: { 
        clips?: VideoClip[]; 
        duration?: number; 
        videoFile?: File | string; 
        name?: string;
        originalDuration?: number;
        videoTrimming?: { start?: number; end?: number };
    } | null,
    hasMainVideo: boolean,
    videoSrc: string,
    videoThumbnails: { [key: string]: string }
): VideoClip[] => {
    if (!currentProject) return []

    // Se il progetto ha clips definite, usale
    if (currentProject.clips && currentProject.clips.length > 0) {
        return currentProject.clips.map((clip: VideoClip) => ({
            ...clip,
            thumbnail: videoThumbnails[clip.id] || clip.thumbnail
        }))
    }

    // Fallback per compatibilità: crea una clip dal video principale
    if (!hasMainVideo || !videoSrc) return []

    return [{
        id: 'main-video',
        name: 'Main Video',
        startTime: 0,
        endTime: currentProject?.duration || 10,
        duration: currentProject?.duration || 10,
        videoUrl: videoSrc,
        originalDuration: currentProject?.originalDuration || currentProject?.duration || 10,
        animations: [],
        trimStart: currentProject?.videoTrimming?.start || 0,
        trimEnd: currentProject?.videoTrimming?.end || 0,
        thumbnail: videoThumbnails['main-video']
    }]
}

/**
 * Crea le clip audio dal progetto corrente
 */
export const createAudioClips = (
    currentProject: { musicSettings?: { track?: string; fileName?: string } } | null,
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
