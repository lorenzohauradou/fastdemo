/**
 * API client
 * Gestisce tutte le chiamate alle API routes di Next.js
 */

export interface UploadResponse {
    success: boolean
    message: string
    filename: string
    size: number
    content_type: string
    backend_response?: any
    note?: string
}

export interface AudioUploadResponse {
    message: string
    filename: string
    originalName: string
    size: number
    contentType: string
    audioUrl: string
}

export interface RenderRequest {
    name: string
    duration: number
    animations: any[]
    backgroundSettings?: any
    musicSettings?: any
}

export interface RenderResponse {
    task_id: string
    status: string
    message: string
    // Mantieni compatibilità con il vecchio formato per ora
    render_job?: {
        id: string
        project_name: string
        status: string
        progress: number
        animations_count: number
        duration: number
        estimated_time: number
        created_at: string
        output_path?: string
        file_size?: number
    }
    result?: any
    download_url?: string
    error?: string
    note?: string
}

export interface RenderStatusResponse {
    task_id: string
    status: string
    message: string
    progress?: number
    output_filename?: string
    download_url?: string
    error?: string
    // Compatibilità con il vecchio formato
    job_id?: string
    estimated_remaining?: number
    output_url?: string
    note?: string
}

export interface ProjectsResponse {
    projects: Array<{
        id: string
        name: string
        created_at: string
        status: string
    }>
    note?: string
}

class ApiClient {
    private baseUrl: string

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000'
    }

    /**
     * Upload di un file video
     */
    async uploadVideo(file: File): Promise<UploadResponse> {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Errore durante l\'upload')
        }

        return response.json()
    }

    /**
     * Upload di un file audio
     */
    async uploadAudio(file: File): Promise<AudioUploadResponse> {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${this.baseUrl}/api/upload/audio`, {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Errore durante l\'upload dell\'audio')
        }

        const result = await response.json()
        
        // Adatta la risposta del backend FastAPI al formato atteso dal frontend
        return {
            message: result.message,
            filename: result.filename,
            originalName: file.name,
            size: file.size,
            contentType: file.type,
            audioUrl: URL.createObjectURL(file) // Crea blob URL per preview locale
        }
    }

    /**
     * Avvia il rendering di un video
     */
    async startRender(renderData: RenderRequest, useRemotion: boolean = false): Promise<RenderResponse> {
        const endpoint = useRemotion ? '/api/render/remotion' : '/api/render'
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(renderData)
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Errore durante il rendering')
        }

        return response.json()
    }

    /**
     * Controlla lo stato di un job di rendering
     */
    async getRenderStatus(jobId: string): Promise<RenderStatusResponse> {
        const response = await fetch(`/api/render/${jobId}`)

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Errore nel controllo stato')
        }

        return response.json()
    }

    /**
     * Download di un video renderizzato
     */
    async downloadVideo(jobId: string): Promise<Response> {
        const response = await fetch(`/api/download/${jobId}`)

        if (!response.ok) {
            throw new Error('Errore nel download del video')
        }

        return response
    }

    /**
     * Ottieni tutti i progetti
     */
    async getProjects(): Promise<ProjectsResponse> {
        const response = await fetch('/api/projects')

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Errore nel recupero progetti')
        }

        return response.json()
    }

    /**
     * Crea un nuovo progetto
     */
    async createProject(projectData: any): Promise<any> {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Errore nella creazione progetto')
        }

        return response.json()
    }
}

export const apiClient = new ApiClient()

export function useApi() {
    return apiClient
}
