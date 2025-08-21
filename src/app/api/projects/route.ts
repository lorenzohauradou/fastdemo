import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        
        try {
            // Prova a ottenere i progetti dal backend
            const backendResponse = await fetch(`${backendUrl}/api/projects`)
            
            if (backendResponse.ok) {
                const result = await backendResponse.json()
                return NextResponse.json(result)
            } else {
                throw new Error('Backend not available')
            }
        } catch (backendError) {
            console.warn('Backend not available for projects:', backendError)
            
            // Fallback: progetti demo
            const demoProjects = [
                {
                    id: 'demo_1',
                    name: 'Demo Project 1',
                    created_at: '2024-01-01T00:00:00Z',
                    status: 'draft'
                },
                {
                    id: 'demo_2', 
                    name: 'Demo Project 2',
                    created_at: '2024-01-02T00:00:00Z',
                    status: 'completed'
                }
            ]
            
            return NextResponse.json({
                projects: demoProjects,
                note: 'Progetti demo - backend non disponibile'
            })
        }

    } catch (error) {
        console.error('Errore nel recupero progetti:', error)
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const projectData = await request.json()
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        
        try {
            // Prova a creare il progetto nel backend
            const backendResponse = await fetch(`${backendUrl}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData)
            })
            
            if (backendResponse.ok) {
                const result = await backendResponse.json()
                return NextResponse.json(result)
            } else {
                throw new Error('Backend not available')
            }
        } catch (backendError) {
            console.warn('Backend not available for project creation:', backendError)
            
            // Fallback: simula la creazione
            const simulatedProject = {
                ...projectData,
                id: `demo_${Date.now()}`,
                created_at: new Date().toISOString(),
                status: 'draft'
            }
            
            return NextResponse.json({
                message: 'Progetto creato (modalità demo)',
                project: simulatedProject,
                note: 'Backend non disponibile'
            })
        }

    } catch (error) {
        console.error('Errore nella creazione progetto:', error)
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        )
    }
}
