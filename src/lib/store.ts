import { create } from 'zustand'

export interface Animation {
  id: string
  type: 'zoom' | 'pan' | 'text' | 'background' | 'logo' | 'video' | 'audio'
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

export interface Project {
  id?: string
  name: string
  description?: string
  videoFile?: File
  videoUrl?: string
  duration: number
  animations: Animation[]
  backgroundSettings?: Record<string, any>
  audioTrack?: string
  templateId?: string
  musicSettings?: {
    type: 'preset' | 'custom'
    track?: string
    volume: number
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
  selectedPanel: 'music' | 'animation' | 'text' | 'logos' | 'templates' | 'logoheadline' | 'background'
  selectedAnimation: Animation | null
  
  // Actions
  setCurrentProject: (project: Project) => void
  updateProject: (updates: Partial<Project>) => void
  setCurrentTime: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  setZoom: (zoom: number) => void
  setSelectedPanel: (panel: 'music' | 'animation' | 'text' | 'logos' | 'templates' | 'logoheadline' | 'background') => void
  addAnimation: (animation: Omit<Animation, 'id'>) => void
  updateAnimation: (id: string, updates: Partial<Animation>) => void
  removeAnimation: (id: string) => void
  setSelectedAnimation: (animation: Animation | null) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  currentProject: null,
  currentTime: 0,
  isPlaying: false,
  zoom: 1,
  selectedPanel: 'music',
  selectedAnimation: null,
  
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
    
    return {
      currentProject: {
        ...state.currentProject,
        animations: state.currentProject.animations.map(anim => 
          anim.id === id ? { ...anim, ...updates } : anim
        )
      }
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
  
  setSelectedAnimation: (animation) => set({ selectedAnimation: animation })
}))
