"use client"

import { useIsMobile } from "@/hooks/use-mobile"

export function Video() {
    const isMobile = useIsMobile()

    return (
        <section className="min-w-full">
            <div className="w px-2 sm:px-4 lg:px-8">
                <div className="relative max-w-6xl lg:max-w-7xl mx-auto p-2 sm:p-4 lg:p-6">
                    <div className="bg-gray-900 rounded-2xl lg:rounded-3xl relative overflow-hidden">
                        <div className="bg-gray-800 rounded-xl lg:rounded-2xl relative aspect-[16/9] sm:aspect-video overflow-hidden">
                            {isMobile ? (
                                <video
                                    className="w-full h-full rounded-xl lg:rounded-2xl"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                >
                                    <source src="/videos/hero/showcaseready.mp4" type="video/mp4" />
                                </video>
                            ) : (
                                <video
                                    className="w-full h-full object-cover rounded-xl lg:rounded-2xl"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                >
                                    <source src="/videos/hero/showcaseready.mp4" type="video/mp4" />
                                </video>
                            )}
                        </div>
                    </div>

                    {/* <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">

                        <div className="bg-zinc-900/80 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-xl flex items-center gap-2 opacity-80">
                            <span>This video was entirely created using ShowcaseReady</span>
                            <span>↓</span>
                        </div>

                    </div> */}
                </div>
            </div>
        </section>
    )
}