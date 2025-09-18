"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
    return (
        <footer className="relative text-white py-16">
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Image src="/favicon.ico" alt="ShowcaseReady" width={32} height={32} />
                            <span className="text-2xl font-bold text-white">
                                SnapScreen
                            </span>
                        </div>
                        <p className="text-gray-400 text-lg">
                            Showcase your products with ease
                        </p>
                    </div>

                    <div className="flex items-center gap-12">
                        <Link
                            href="#features"
                            className="text-gray-300 hover:text-white text-lg transition-colors duration-300"
                        >
                            Features
                        </Link>
                        <Link
                            href="#pricing"
                            className="text-gray-300 hover:text-white text-lg transition-colors duration-300"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="#faq"
                            className="text-gray-300 hover:text-white text-lg transition-colors duration-300"
                        >
                            FAQ
                        </Link>
                    </div>
                </div>

                <div className="border-t border-gray-800/50 mb-8"></div>
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <p className="text-gray-400 text-sm">
                            © 2025 SnapScreen, Inc. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link
                                href="https://linkedin.com"
                                className="text-gray-400 hover:text-white transition-colors duration-300"
                                aria-label="LinkedIn"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </Link>
                            <Link
                                href="https://twitter.com"
                                className="text-gray-400 hover:text-white transition-colors duration-300"
                                aria-label="Twitter"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <Link
                            href="/privacy"
                            className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
                        >
                            Terms and Conditions
                        </Link>
                        <Link
                            href="/content-license"
                            className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
                        >
                            Content License
                        </Link>
                        <Link
                            href="/refund"
                            className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
                        >
                            Refund Policy
                        </Link>
                        <Link
                            href="/cookies"
                            className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
                        >
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}