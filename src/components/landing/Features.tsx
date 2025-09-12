"use client"

import { useState } from "react"
import Image from "next/image"

export function Features() {
    const [cursorPosition, setCursorPosition] = useState(50)

    const musicTracks = [
        { title: "The Intro We Have Been Waiting For", duration: "02:28", cover: "/images/landing/cover.png" },
        { title: "Night Melody", duration: "03:39", cover: "/images/landing/cover1.png" },
        { title: "Good God", duration: "01:40", cover: "/images/landing/cover2.png" },
    ]

    return (
        <section className="relative min-h-screen text-white overflow-hidden py-24">
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/5 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/3 right-1/5 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-6xl font-bold mb-6">
                        Everything you need{' '}
                        <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                            all-in-one
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
                    <div className="col-span-12 lg:col-span-6 row-span-2">
                        <div className="relative group h-96">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

                            <div className="relative h-full backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/20">
                                <div className="flex flex-col justify-between h-full">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                            Show off your app on the screen of a stunning 3D Scene
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-6xl font-bold text-white mb-4">3D Scene</h3>

                                        <div className="mt-8 flex justify-center">
                                            <div className="relative">
                                                <div className="w-110 h-80 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl">
                                                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-[2.5rem] flex items-center justify-center">
                                                        <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                                                    </div>
                                                </div>
                                                {/* <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black rounded-full"></div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-6">
                        <div className="relative group h-96">
                            <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

                            <div className="relative h-full backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/20">

                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4">
                        <div className="relative group h-80">
                            <div className="absolute inset-0 bg-yellow-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

                            <div className="relative h-full backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/20">
                                <div className="flex flex-col justify-between h-full">
                                    <div>
                                        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                            Export videos up to 4K resolution
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">4K</h3>
                                        <p className="text-xl text-gray-300">Ultra HD</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-8">
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
                                            {musicTracks.map((track, index) => (
                                                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors w-full h-[80px] overflow-hidden">
                                                    <div className="relative w-14 h-14 rounded overflow-hidden">
                                                        <Image
                                                            src={track.cover}
                                                            alt={track.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-xs font-medium truncate">{track.title}</p>
                                                        <p className="text-gray-400 text-xs">{track.duration}</p>
                                                    </div>
                                                    <div className="text-gray-400">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4">
                        <div className="relative group h-80">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

                            <div className="relative h-full backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/20">
                                <div className="flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex items-end justify-center gap-1 mb-8 h-20">
                                            {Array.from({ length: 20 }).map((_, index) => {
                                                const heights = [45, 60, 35, 70, 25, 55, 80, 40, 65, 30, 75, 50, 85, 35, 60, 45, 70, 40, 55, 65];
                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-gradient-to-t from-purple-500 to-purple-300 rounded-full animate-pulse"
                                                        style={{
                                                            width: '4px',
                                                            height: `${heights[index]}%`,
                                                            animationDelay: `${index * 0.1}s`
                                                        }}
                                                    ></div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-3xl font-bold text-white mb-1">AI</h3>
                                        <p className="text-xl text-gray-300">Voiceovers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
