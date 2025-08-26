import { create } from 'zustand'

export interface Animation {
  id: string
  type: 'zoom' | 'pan' | 'text' | 'voiceover' | 'background' | 'logo' | 'video' | 'audio' | 'clip'
  startTime: number
  endTime: number
  properties: Record<string, any>
  _renderBounds?: {
    startX: number
    y: number
    width: number
    height: number
    trackIndex?: number
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
  videoFile?: File
  videoUrl?: string
  duration: number
  originalDuration?: number
  animations: Animation[]
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
}

interface EditorState {
  // Progetto corrente
  currentProject: Project | null
  
  // Timeline
  currentTime: number
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
  addAnimation: (animation: Omit<Animation, 'id'>) => void
  updateAnimation: (id: string, updates: Partial<Animation>) => void
  removeAnimation: (id: string) => void
  setSelectedAnimation: (animation: Animation | null) => void
  setSelectedClip: (clipId: string | null) => void
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
  setCurrentProject: (project) => set({ currentProject: project }),
  
  updateProject: (updates) => set((state) => ({
    currentProject: state.currentProject ? { ...state.currentProject, ...updates } : null
  })),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedPanel: (panel) => set({ selectedPanel: panel }),
  
  addAnimation: (animation) => set((state) => {
    if (!state.currentProject) return state
    
    const newAnimation: Animation = {
      ...animation,
      id: `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    return {
      currentProject: {
        ...state.currentProject,
        animations: [...state.currentProject.animations, newAnimation]
      }
    }
  }),
  
  updateAnimation: (id, updates) => set((state) => {
    if (!state.currentProject) return state
    
    const updatedAnimations = state.currentProject.animations.map(anim => 
      anim.id === id ? { ...anim, ...updates } : anim
    )
    
    // Se l'animazione modificata è quella selezionata, aggiorna anche selectedAnimation
    const updatedSelectedAnimation = state.selectedAnimation?.id === id 
      ? { ...state.selectedAnimation, ...updates }
      : state.selectedAnimation
    
    return {
      currentProject: {
        ...state.currentProject,
        animations: updatedAnimations
      },
      selectedAnimation: updatedSelectedAnimation
    }
  }),
  
  removeAnimation: (id) => set((state) => {
    if (!state.currentProject) return state
    
    return {
      currentProject: {
        ...state.currentProject,
        animations: state.currentProject.animations.filter(anim => anim.id !== id)
      }
    }
  }),
  
  setSelectedAnimation: (animation) => set({ selectedAnimation: animation }),
  setSelectedClip: (clipId) => set({ selectedClip: clipId })
}))
