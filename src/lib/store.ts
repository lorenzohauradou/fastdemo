import { create } from 'zustand'

export interface Animation {
  id: string
  type: 'zoom' | 'pan' | 'text' | 'voiceover' | 'background' | 'logo' | 'video' | 'audio' | 'clip'
  startTime: number  // Tempo relativo alla clip (0 = inizio clip)
  endTime: number    // Tempo relativo alla clip
  properties: Record<string, any>
  _renderBounds?: {
    startX: number
    y: number
    width: number
    height: number
    trackIndex?: number
  }
}

export interface VideoClip {
  id: string
  name: string
  startTime: number      // Tempo di inizio nella timeline globale
  endTime: number        // Tempo di fine nella timeline globale
  duration: number       // Durata della clip
  videoFile?: File
  videoUrl?: string
  originalDuration: number
  animations: Animation[] // Animazioni specifiche per questa clip
  trimStart: number
  trimEnd: number
  thumbnail?: string
  properties?: {
    name?: string
    originalDuration?: number
    trimStart?: number
    trimEnd?: number
    duration?: number
  }
}

export interface BackgroundSettings {
  type: 'none' | 'solid' | 'linear-gradient' | 'mesh-gradient' | 'image'
  // solid
  color?: string
  // linear-gradient
  gradientColors?: string[]
  gradientAngle?: number
  // mesh-gradient
  meshColors?: string[]
  meshSeed?: number
  // image
  imageUrl?: string
  // common
  opacity?: number
  blur?: number
}

export interface Project {
  id?: string
  name: string
  description?: string
  // Proprietà legacy per compatibilità
  videoFile?: File
  videoUrl?: string
  // Nuova struttura multi-clip
  clips: VideoClip[]     // Array di clip video
  activeClipId: string | null  // Clip attualmente attiva per editing
  duration: number       // Durata totale del progetto
  originalDuration?: number
  // animations: Animation[] // RIMOSSO - ora ogni clip ha le sue
  primaryColor?: string
  backgroundSettings?: BackgroundSettings
  deviceSettings?: Record<string, any>
  audioTrack?: string
  templateId?: string
  musicSettings?: {
    type: 'preset' | 'custom'
    track?: string
    volume: number
    fileName?: string
    track_path?: string | null
    trimStart?: number
    trimEnd?: number
    duration?: number
  }
  videoTrimming?: {
    start: number
    end: number
    duration: number
  }
  cameraSettings?: {
    type?: 'none' | 'continuous_glide' | 'skewed_glide' | 'orbit_glide'
    intensity?: number
    zoom_range?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'diagonal'
    angle?: number // Per skewed_glide
  }
  // Proprietà legacy per compatibilità con animazioni globali
  animations?: Animation[]
}

interface EditorState {
  // Progetto corrente
  currentProject: Project | null
  
  // Timeline
  currentTime: number      // Tempo globale del progetto
  isPlaying: boolean
  zoom: number
  
  // UI State
  selectedPanel: 'scene' | 'music' | 'animation' | 'text' | 'logos' | 'templates' | 'logoheadline' | 'background'
  selectedAnimation: Animation | null
  selectedClip: string | null
  
  // Actions
  setCurrentProject: (project: Project) => void
  updateProject: (updates: Partial<Project>) => void
  setCurrentTime: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  setZoom: (zoom: number) => void
  setSelectedPanel: (panel: 'scene' | 'music' | 'animation' | 'text' | 'logos' | 'templates' | 'logoheadline' | 'background') => void
  
  // Gestione clip
  addClip: (clip: Omit<VideoClip, 'id' | 'startTime' | 'endTime'>) => void
  updateClip: (clipId: string, updates: Partial<VideoClip>) => void
  removeClip: (clipId: string) => void
  setActiveClip: (clipId: string | null) => void
  getActiveClip: () => VideoClip | null
  
  // Gestione animazioni (ora per clip attiva)
  addAnimation: (animation: Omit<Animation, 'id'>) => void
  updateAnimation: (id: string, updates: Partial<Animation>) => void
  removeAnimation: (id: string) => void
  setSelectedAnimation: (animation: Animation | null) => void
  setSelectedClip: (clipId: string | null) => void
  
  // Utilità
  getCurrentClipTime: () => number  // Tempo relativo alla clip attiva
  getClipAtTime: (globalTime: number) => VideoClip | null
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  currentProject: null,
  currentTime: 0,
  isPlaying: false,
  zoom: 1,
  selectedPanel: 'scene',
  selectedAnimation: null,
  selectedClip: null,
  
  // Actions
  setCurrentProject: (project) => {
    // Migrazione automatica da vecchia struttura a nuova
    if (project && !project.clips && (project.videoFile || project.videoUrl)) {
      const legacyClip: VideoClip = {
        id: 'main-video',
        name: project.name || 'Main Video',
        startTime: 0,
        endTime: project.duration,
        duration: project.duration,
        videoFile: project.videoFile,
        videoUrl: project.videoUrl,
        originalDuration: project.originalDuration || project.duration,
        animations: project.animations || [],
        trimStart: project.videoTrimming?.start || 0,
        trimEnd: project.videoTrimming?.end || 0
      }
      
      project = {
        ...project,
        clips: [legacyClip],
        activeClipId: 'main-video'
      }
    }
    
    // Verifica se il progetto è effettivamente cambiato prima di aggiornare
    const currentState = get()
    if (currentState.currentProject === project) return
    
    set({ currentProject: project })
  },
  
  updateProject: (updates) => set((state) => ({
    currentProject: state.currentProject ? { ...state.currentProject, ...updates } : null
  })),
  
  setCurrentTime: (time) => {
    const state = get()
    
    // Aggiorna il tempo solo se è effettivamente cambiato
    if (Math.abs(state.currentTime - time) < 0.01) return
    
    set({ currentTime: time })
    
    // Auto-switch della clip attiva basato sul tempo globale
    if (state.currentProject?.clips) {
      const clipAtTime = state.currentProject.clips.find(clip => 
        time >= clip.startTime && time < clip.endTime
      )
      
      if (clipAtTime && clipAtTime.id !== state.currentProject.activeClipId) {
        set({ 
          currentProject: { 
            ...state.currentProject, 
            activeClipId: clipAtTime.id 
          }
        })
      }
    }
  },
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedPanel: (panel) => set({ selectedPanel: panel }),
  
  // Gestione clip
  addClip: (clipData) => set((state) => {
    if (!state.currentProject) return state
    
    // Calcola la posizione della nuova clip: sempre alla fine delle clip esistenti
    const existingClips = state.currentProject.clips || []
    const lastClipEndTime = existingClips.length > 0 
      ? Math.max(...existingClips.map(clip => clip.endTime))
      : 0
    
    const newClip: VideoClip = {
      ...clipData,
      id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: lastClipEndTime, // Inizia dove finisce l'ultima clip
      endTime: lastClipEndTime + clipData.duration, // Fine = inizio + durata
      animations: []
    }
    
    const newTotalDuration = newClip.endTime
    
    return {
      currentProject: {
        ...state.currentProject,
        clips: [...existingClips, newClip],
        duration: newTotalDuration,
        activeClipId: newClip.id // Attiva automaticamente la nuova clip
      }
    }
  }),
  
  updateClip: (clipId, updates) => set((state) => {
    if (!state.currentProject) return state
    
    const clips = [...state.currentProject.clips]
    const clipIndex = clips.findIndex(clip => clip.id === clipId)
    
    if (clipIndex === -1) return state
    
    const originalClip = clips[clipIndex]
    
    // Aggiorna la clip specifica
    clips[clipIndex] = { ...originalClip, ...updates }
    
    // Ricalcola le posizioni SOLO se startTime, endTime o duration sono cambiati esplicitamente
    const shouldRecalculatePositions = 
      updates.startTime !== undefined || 
      updates.endTime !== undefined || 
      (updates.duration !== undefined && updates.duration !== originalClip.duration)
    
    if (shouldRecalculatePositions) {
      // Se è stata fornita una nuova duration, aggiorna endTime
      if (updates.duration !== undefined && updates.startTime === undefined && updates.endTime === undefined) {
        clips[clipIndex].endTime = clips[clipIndex].startTime + clips[clipIndex].duration
      }
      
      // Ricalcola le posizioni per mantenere le clip attaccate SOLO se necessario
      const needsRepositioning = clips.some((clip, index) => {
        if (index === 0) return false
        return Math.abs(clip.startTime - clips[index - 1].endTime) > 0.1
      })
      
      if (needsRepositioning) {
        for (let i = 1; i < clips.length; i++) {
          clips[i].startTime = clips[i - 1].endTime
          clips[i].endTime = clips[i].startTime + clips[i].duration
        }
      }
    }
    
    // Calcola la nuova durata totale
    const newTotalDuration = clips.length > 0 
      ? Math.max(...clips.map(clip => clip.endTime))
      : 0
    
    return {
      currentProject: {
        ...state.currentProject,
        clips,
        duration: newTotalDuration
      }
    }
  }),
  
  removeClip: (clipId) => set((state) => {
    if (!state.currentProject) return state
    
    let clips = state.currentProject.clips.filter(clip => clip.id !== clipId)
    
    // Ricalcola le posizioni per mantenere le clip attaccate
    for (let i = 0; i < clips.length; i++) {
      if (i === 0) {
        clips[i].startTime = 0
        clips[i].endTime = clips[i].duration
      } else {
        clips[i].startTime = clips[i - 1].endTime
        clips[i].endTime = clips[i].startTime + clips[i].duration
      }
    }
    
    const newActiveClipId = state.currentProject.activeClipId === clipId 
      ? (clips[0]?.id || null) 
      : state.currentProject.activeClipId
    
    // Calcola la nuova durata totale
    const newTotalDuration = clips.length > 0 
      ? Math.max(...clips.map(clip => clip.endTime))
      : 0
    
    return {
      currentProject: {
        ...state.currentProject,
        clips,
        activeClipId: newActiveClipId,
        duration: newTotalDuration
      }
    }
  }),
  
  setActiveClip: (clipId) => set((state) => {
    if (!state.currentProject) return state
    
    return {
      currentProject: {
        ...state.currentProject,
        activeClipId: clipId
      }
    }
  }),
  
  getActiveClip: () => {
    const state = get()
    if (!state.currentProject?.activeClipId) return null
    
    return state.currentProject.clips.find(clip => 
      clip.id === state.currentProject!.activeClipId
    ) || null
  },
  
  // Gestione animazioni (ora per clip attiva)
  addAnimation: (animation) => set((state) => {
    if (!state.currentProject?.activeClipId) return state
    
    const newAnimation: Animation = {
      ...animation,
      id: `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    const updatedClips = state.currentProject.clips.map(clip => 
      clip.id === state.currentProject!.activeClipId 
        ? { ...clip, animations: [...clip.animations, newAnimation] }
        : clip
    )
    
    return {
      currentProject: {
        ...state.currentProject,
        clips: updatedClips
      }
    }
  }),
  
  updateAnimation: (id, updates) => set((state) => {
    if (!state.currentProject?.activeClipId) return state
    
    const updatedClips = state.currentProject.clips.map(clip => {
      if (clip.id === state.currentProject!.activeClipId) {
        const updatedAnimations = clip.animations.map(anim => 
          anim.id === id ? { ...anim, ...updates } : anim
        )
        return { ...clip, animations: updatedAnimations }
      }
      return clip
    })
    
    // Se l'animazione modificata è quella selezionata, aggiorna anche selectedAnimation
    const updatedSelectedAnimation = state.selectedAnimation?.id === id 
      ? { ...state.selectedAnimation, ...updates }
      : state.selectedAnimation
    
    return {
      currentProject: {
        ...state.currentProject,
        clips: updatedClips
      },
      selectedAnimation: updatedSelectedAnimation
    }
  }),
  
  removeAnimation: (id) => set((state) => {
    if (!state.currentProject?.activeClipId) return state
    
    const updatedClips = state.currentProject.clips.map(clip => {
      if (clip.id === state.currentProject!.activeClipId) {
        return {
          ...clip,
          animations: clip.animations.filter(anim => anim.id !== id)
        }
      }
      return clip
    })
    
    return {
      currentProject: {
        ...state.currentProject,
        clips: updatedClips
      }
    }
  }),
  
  setSelectedAnimation: (animation) => set({ selectedAnimation: animation }),
  setSelectedClip: (clipId) => set({ selectedClip: clipId }),
  
  // Utilità
  getCurrentClipTime: () => {
    const state = get()
    const activeClip = state.getActiveClip()
    if (!activeClip) return 0
    
    // Tempo relativo alla clip = tempo globale - startTime della clip
    return Math.max(0, state.currentTime - activeClip.startTime)
  },
  
  getClipAtTime: (globalTime) => {
    const state = get()
    if (!state.currentProject?.clips) return null
    
    return state.currentProject.clips.find(clip => 
      globalTime >= clip.startTime && globalTime < clip.endTime
    ) || null
  }
}))
