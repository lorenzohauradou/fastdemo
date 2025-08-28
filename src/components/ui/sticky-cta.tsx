"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Link2 } from "lucide-react"

export function StickyCTA() {
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY
            const windowHeight = window.innerHeight

            const finalCTA = document.querySelector('#final-cta')
            const finalCTAPosition = finalCTA ? finalCTA.getBoundingClientRect().top + window.scrollY - windowHeight : Infinity

            if (scrollPosition > windowHeight * 0.8 &&
                scrollPosition < (finalCTAPosition || Infinity) &&
                !isDismissed) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isDismissed])

    if (isDismissed) return null

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}>
            <div className="px-4 py-6 pb-6">
                <div className="container mx-auto max-w-xl">
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex w-full items-center bg-transparent backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2.5">
                            <Link2 className="w-4 h-4 text-[#9ca3af] mr-2 flex-shrink-0" />
                            <span className="text-[#d1d5db] text-sm flex-1 whitespace-nowrap">Add your screen recording and ...</span>
                            <Button
                                className="ml-2 bg-white text-black hover:bg-gray-100 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                            >
                                Get Free Demo
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 