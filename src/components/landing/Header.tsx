"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion } from "framer-motion"

export function Header() {
    const isMobile = useIsMobile()
    return (
        <motion.header
            className="fixed bg-transparent backdrop-blur-sm top-0 w-full z-50"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <motion.div
                        className="w-12 h-12 md:w-15 md:h-15 flex items-center justify-center overflow-hidden"
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Image
                            src="/favicon.ico"
                            alt="SnapScreen Logo"
                            width={64}
                            height={64}
                            className="object-contain w-full h-full"
                        />
                    </motion.div>
                    <motion.span
                        className="ml-4 text-2xl font-bold text-white min-w-[200px]"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Snap Screen
                    </motion.span>
                </Link>
                <motion.nav
                    className="hidden lg:flex space-x-8 justify-start items-left w-full ml-16"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                        <Link
                            href="#features"
                            className="text-gray-300 hover:text-white transition-colors font-xl"
                        >
                            Features
                        </Link>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                        <Link
                            href="#pricing"
                            className="text-gray-300 hover:text-white transition-colors font-xl"
                        >
                            Pricing
                        </Link>
                    </motion.div>

                    <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Link
                            href="/faq"
                            className="text-gray-300 hover:text-white transition-colors font-xl"
                        >
                            FAQ
                        </Link>
                    </motion.div>
                </motion.nav>
                <motion.div
                    className="flex items-center space-x-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <Button
                                className={`bg-white pr-6 md:mr-0 text-black hover:bg-gray-100 text-sm font-medium px-4 py-2 rounded-full transition-all ${isMobile ? 'w-full' : ''}`}
                                asChild
                            >
                                <Link href="/login">
                                    {isMobile ? 'Free Demo' : 'Get Free Demo'}
                                </Link>
                            </Button>
                        </motion.div>
                    </>
                </motion.div>
            </div>
        </motion.header>
    )
}
