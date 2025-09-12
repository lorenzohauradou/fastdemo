"use client"

import Image from "next/image"

export function FeaturesSection() {
    const mainFeatures = [
        {
            id: 1,
            title: "Auto scale up/down upon element interaction",
            subtitle: "We track cursor actions and apply zoom in/out to make the video more interactive",
            videoPlaceholder: "video-1.mp4"
        },
        {
            id: 2,
            title: "Camera capture",
            subtitle: "Record your webcam alongside your screen — great for product demos and walkthroughs.",
            videoPlaceholder: "video-2.mp4"
        },
        {
            id: 3,
            title: "Convenient video editor",
            subtitle: "Manage zoom effects and many more video properties.",
            videoPlaceholder: "video-3.mp4"
        }
    ]

    return (
        <section className="relative bg-black text-white py-32">
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="relative group h-80">
                        <div className="absolute inset-0 bg-yellow-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

                        <div className="relative h-full backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/20">
                            <div className="flex flex-col justify-between h-full">
                                <div>
                                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                        Export videos up to 4K resolution with crystal clear quality
                                    </p>
                                </div>

                                <div className="text-center">
                                    <h3 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">4K</h3>
                                    <p className="text-xl text-gray-300">Ultra HD Export</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group h-80">
                        <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

                        <div className="relative h-full backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/20">
                            <div className="grid grid-cols-2 gap-8 h-full">
                                <div className="flex flex-col justify-center text-center">
                                    <h3 className="text-6xl font-bold text-white mb-2">Music</h3>
                                    <p className="text-2xl text-gray-300">library</p>
                                </div>

                                <div className="flex flex-col justify-center">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors w-full h-[60px] overflow-hidden">
                                            <div className="relative w-10 h-10 rounded overflow-hidden bg-transparent flex items-center justify-center">
                                                <Image src="/images/landing/cover.png" alt="The Intro We Have Been Waiting For" width={40} height={40} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-medium truncate">The Intro We Have Been Waiting For</p>
                                                <p className="text-gray-400 text-xs">02:28</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors w-full h-[60px] overflow-hidden">
                                            <div className="relative w-10 h-10 rounded overflow-hidden bg-transparent flex items-center justify-center">
                                                <Image src="/images/landing/cover1.png" alt="Night Melody" width={40} height={40} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-medium truncate">Night Melody</p>
                                                <p className="text-gray-400 text-xs">03:39</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors w-full h-[60px] overflow-hidden">
                                            <div className="relative w-10 h-10 rounded overflow-hidden bg-transparent flex items-center justify-center">
                                                <Image src="/images/landing/cover2.png" alt="Good God" width={40} height={40} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-medium truncate">Good God</p>
                                                <p className="text-gray-400 text-xs">01:40</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group h-80">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

                        <div className="relative h-full backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/20 overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 mb-10">
                                <div className="flex items-end gap-1 h-32">
                                    {Array.from({ length: 40 }).map((_, index) => {
                                        const heights = [20, 35, 15, 45, 12, 30, 50, 25, 40, 18, 42, 28, 55, 22, 38, 26, 48, 20, 32, 45, 25, 35, 15, 40, 18, 30, 50, 22, 38, 28, 45, 20, 35, 25, 42, 18, 48, 30, 35, 40];
                                        return (
                                            <div
                                                key={index}
                                                className="bg-gradient-to-t from-purple-400 to-purple-200 rounded-full animate-pulse"
                                                style={{
                                                    width: '2px',
                                                    height: `${heights[index]}%`,
                                                    animationDelay: `${index * 0.05}s`,
                                                    animationDuration: '2s'
                                                }}
                                            ></div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex justify-center mb-8">
                                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/30 bg-white/5 backdrop-blur-sm">
                                        <Image
                                            src="/images/speakers/dorothy.png"
                                            alt="Dorothy AI Voice"
                                            width={96}
                                            height={96}
                                            className="object-cover"
                                        />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h3 className="text-3xl font-bold text-white mb-1">AI Voiceovers</h3>
                                    <p className="text-xl text-gray-300">Professional narration</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                <div className="space-y-32 mt-32">
                    {mainFeatures.map((feature, index) => (
                        <div key={feature.id} className="relative group">
                            <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl"></div>

                            <div className="relative backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-12 md:p-16">
                                <div className={`grid grid-cols-1 lg:grid-cols-5 gap-16 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                                    <div className={`lg:col-span-3 ${index % 2 === 1 ? 'lg:col-start-3' : ''}`}>
                                        <div className="relative">
                                            <div className="relative bg-transparentrounded-3xl p-4 shadow-2xl">
                                                <div className="aspect-video bg-transparent rounded-2xl flex items-center justify-center relative overflow-hidden">
                                                    <div className="text-center">
                                                        <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-white/40 text-sm font-medium">{feature.videoPlaceholder}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`lg:col-span-2 space-y-6 ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                                        <h3 className="text-4xl md:text-5xl font-bold leading-tight">
                                            {feature.title}
                                        </h3>
                                        <p className="text-xl text-gray-400 leading-relaxed">
                                            {feature.subtitle}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}