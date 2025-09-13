import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'

        const backendResponse = await fetch(`${backendUrl}/api/render/status/${jobId}`)
        
        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: 'Task not found or backend error' },
                { status: backendResponse.status }
            )
        }
        
        const result = await backendResponse.json()
        return NextResponse.json(result)

    } catch (error) {
        console.error('Error checking status:', error)
        return NextResponse.json(
            { error: 'Connection error to backend' },
            { status: 500 }
        )
    }
}
