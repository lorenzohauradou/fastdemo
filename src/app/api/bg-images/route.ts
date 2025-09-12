import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        const response = await fetch(`${backendUrl}/api/bg-images`)
        
        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`)
        }
        
        const images = await response.json()
        return NextResponse.json(images)
        
    } catch (error) {
        console.error('Error fetching background images:', error)
        return NextResponse.json(
            { error: 'Failed to fetch background images' }, 
            { status: 500 }
        )
    }
}
