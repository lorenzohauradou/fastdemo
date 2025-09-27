import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 500MB' },
        { status: 400 }
      )
    }

    const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/webm']
    const isValidType = allowedTypes.some(type => file.type.startsWith(type))
    
    if (!isValidType) {
      return NextResponse.json(
        { error: 'Unsupported format. Use MP4, MOV, AVI or WebM' },
        { status: 400 }
      )
    }

    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Error during video upload:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error during video upload' },
      { status: 500 }
    )
  }
}
