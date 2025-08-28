"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link2, Brain } from "lucide-react"
// import { useSession } from "next-auth/react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { Video } from "./Video"

export function Hero() {
    // const { data: session } = useSession()
    const isMobile = useIsMobile()
    return (
        <section className="relative min-h-screen bg-black overflow-hidden">
            <div className="absolute inset-0 bg-black"></div>
            <div className="relative z-10 container mx-auto px-4 pt-36 pb-16">
                <div className="text-center md:mb-12">
                    <Badge
                        variant="secondary"
                        className="mb-4 md:mb-6 bg-zinc-800/60 text-white border-gray-700/50 backdrop-blur-sm hover:bg-zinc-700/60 transition-colors px-3 md:px-4 py-1.5 md:py-2 rounded-full"
                    >
                        <span className="text-xs md:text-sm">#1 SaaS Demo Generator</span>
                    </Badge>

                    <h1 className="text-3xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6 leading-[1.05] text-white max-w-6xl mx-auto">
                        <span className="block mb-1">
                            Turn Screen Recordings into Stunning Demos

                        </span>
                    </h1>
                    <p className="text-sm md:text-lg text-[#d1d5db] mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
                        Add fluid 3D animations, smooth zooms, and dynamic backgrounds to your SaaS showcase in minutes
                    </p>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-3 mb-8 md:mb-12 px-4">
                        <div className="w-full md:w-[400px] flex items-center bg-zinc-800/60 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2.5 md:px-4 md:py-2.5">
                            <Link2 className="w-4 h-4 text-[#9ca3af] mr-2 flex-shrink-0" />
                            <span className="text-[#bbbcbe] text-sm flex-1">{isMobile ? "Add your screen recording" : "Add your screen recording"}</span>
                            <Button
                                className="ml-2 bg-white text-black hover:bg-gray-100 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                            >
                                Upload
                            </Button>
                        </div>

                        <span className="text-[#9ca3af] font-medium text-sm hidden md:block">or</span>

                        <Button
                            className="w-full h-[60px] md:w-auto bg-transparent text-white hover:bg-white/10 px-4 py-2.5 rounded-full text-sm font-medium transition-all border border-[#404040]"
                            asChild
                        >
                            <Link href={"/login"}>
                                Record your screen
                            </Link>
                        </Button>
                    </div>
                </div>
                <Video />
            </div>
        </section>
    )
}