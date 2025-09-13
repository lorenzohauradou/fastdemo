import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params
        const filePath = path.join('/')
        const backendMusicPath = join(process.cwd(), '..', 'backend', 'assets', 'music', filePath)


        const fileBuffer = await readFile(backendMusicPath)
        
        const getContentType = (filename: string) => {
            const ext = filename.toLowerCase().split('.').pop()
            switch (ext) {
                case 'mp3': return 'audio/mpeg'
                case 'wav': return 'audio/wav'
                case 'ogg': return 'audio/ogg'
                case 'm4a': return 'audio/mp4'
                default: return 'audio/mpeg'
            }
        }

        const contentType = getContentType(filePath)

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            }
        })

    } catch {
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        )
    }
}