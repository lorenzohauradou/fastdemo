import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        
        try {
            const backendResponse = await fetch(`${backendUrl}/api/projects`)
            
            if (backendResponse.ok) {
                const data = await backendResponse.json()
                return NextResponse.json(data)
            } else {
                return NextResponse.json({
                    projects: [],
                    message: 'Failed to fetch projects',
                })
            }
        } catch (backendError) {
            return NextResponse.json({
                projects: [],
                message: 'Failed to fetch projects',
            })
        }
    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const projectData = await request.json()
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        
        try {
            const backendResponse = await fetch(`${backendUrl}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData)
            })
            
            if (backendResponse.ok) {
                const data = await backendResponse.json()
                return NextResponse.json(data)
            } else {
                const errorData = await backendResponse.json()
                return NextResponse.json(
                    { error: errorData.error || 'Error creating project' },
                    { status: backendResponse.status }
                )
            }
        } catch (backendError) {
            return NextResponse.json({
                success: false,
                message: 'Backend not available',
            })
        }
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
