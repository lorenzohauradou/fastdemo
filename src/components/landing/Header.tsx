"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, User, LogOut, ChevronDown } from "lucide-react"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const getUserInitials = (name?: string | null, email?: string | null) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
        if (email) {
            return email.slice(0, 2).toUpperCase()
        }
        return "U"
    }

    return (
        <header className="fixed bg-transparent backdrop-blur-sm top-0 w-full z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                        <Image
                            src="/favicon.ico"
                            alt="ShowcaseReady Logo"
                            width={32}
                            height={32}
                            className="object-contain w-full h-full"
                        />
                    </div>
                    <span className="text-xl font-bold text-white">
                        ShowcaseReady
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
                <div className="flex items-center space-x-4">
                    <>
                        <Button
                            className="bg-white text-black hover:bg-gray-100 text-sm font-medium px-4 py-2 rounded-full transition-all"
                            asChild
                        >
                            <Link href="/login">
                                Get Free Demo
                            </Link>
                        </Button>
                    </>
                    <Button variant="ghost" size="icon" className="lg:hidden text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>
            </div>
            {isMenuOpen && (
                <div className="lg:hidden bg-black border-b border-gray-800">
                    <nav className="container mx-auto px-4 py-4 space-y-4">
                        <a href="#features" className="block text-gray-300 hover:text-white transition-colors text-sm">
                            Features
                        </a>
                        <a href="#showcase" className="block text-gray-300 hover:text-white transition-colors text-sm">
                            Solutions
                        </a>
                        <Link href="/blog" className="block text-gray-300 hover:text-white transition-colors text-sm">
                            Resources
                        </Link>
                        <a href="#pricing" className="block text-gray-300 hover:text-white transition-colors text-sm">
                            Pricing
                        </a>
                        <Link href="/dashboard/ai-image-studio" className="block text-gray-300 hover:text-white transition-colors text-sm">
                            FastAdsSearch
                        </Link>

                        {/* {session ? ( */}
                        <>
                            <Link href="/dashboard" className="block text-gray-300 hover:text-white transition-colors text-sm">
                                Dashboard
                            </Link>
                            <button
                                //onClick={handleSignOut}
                                className="block text-red-400 hover:text-red-300 transition-colors text-sm w-full text-left"
                            >
                                Logout
                            </button>
                        </>
                        {/* ) : ( */}
                        <>
                            <Link href="/login" className="block text-gray-300 hover:text-white transition-colors text-sm">
                                Sign in
                            </Link>
                            <Link href="/login" className="block text-white bg-gray-800 hover:bg-gray-700 transition-colors text-sm py-2 px-4 rounded">
                                Sign up - <span className="hidden md:block">It's</span> FREE
                            </Link>
                        </>
                        {/* )} */}
                    </nav>
                </div>
            )}
        </header>
    )
}
