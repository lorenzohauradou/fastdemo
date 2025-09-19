"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const isMobile = useIsMobile()
    return (
        <header className="fixed bg-transparent backdrop-blur-sm top-0 w-full z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <div className="w-20 h-20 rounded-lg flex items-center justify-center overflow-hidden">
                        <Image
                            src="/favicon.ico"
                            alt="SnapScreen Logo"
                            width={64}
                            height={64}
                            className="object-contain w-full h-full"
                        />
                    </div>
                    <span className="text-2xl font-bold text-white min-w-[200px]">
                        Snap Screen
                    </span>
                </Link>
                <nav className="hidden lg:flex space-x-8 justify-start items-left w-full ml-16">
                    <Link
                        href="#features"
                        className="text-gray-300 hover:text-white transition-colors font-xl"
                    >
                        Features
                    </Link>


                    <Link
                        href="#pricing"
                        className="text-gray-300 hover:text-white transition-colors font-xl"
                    >
                        Pricing
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/faq"
                            className="text-gray-300 hover:text-white transition-colors font-xl"
                        >
                            FAQ
                        </Link>
                    </div>
                </nav>
                <div className="flex items-center space-x-4" >
                    <>
                        <Button
                            className={`bg-white text-black hover:bg-gray-100 text-sm font-medium px-4 py-2 rounded-full transition-all ${isMobile ? 'w-full' : ''}`}
                            asChild
                        >
                            <Link href="/login">
                                {isMobile ? 'Free Demo' : 'Get Free Demo'}
                            </Link>
                        </Button>
                    </>
                </div>
            </div>
        </header>
    )
}
