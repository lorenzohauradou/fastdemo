import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const renderData = await request.json()
        
        // Validazione
        if (!renderData.name) {
            return NextResponse.json(
                { error: 'Project name required' },
                { status: 400 }
            )
        }

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
        
        try {
            const backendResponse = await fetch(`${backendUrl}/api/render/remotion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(renderData)
            })

            if (backendResponse.ok) {
                const result = await backendResponse.json()
                return NextResponse.json(result)
            } else {
                const errorText = await backendResponse.text()
                throw new Error(`Backend error: ${errorText}`)
            }
        } catch (backendError) {
            console.warn('Backend not available:', backendError)
            return NextResponse.json({
                message: 'Rendering not available',
            })
        }

    } catch (error) {
        console.error('Error during rendering:', error)
        return NextResponse.json(
            { error: 'Internal server error during rendering' },
            { status: 500 }
        )
    }
}
