"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
    return (
        <footer className="border-t border-zinc-700 bg-primary border-2 rounded-3xl max-w-6xl mx-auto mb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-8 lg:py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-16">
                        <div className="lg:col-span-4">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Image src="/favicon.ico" alt="ShowcaseReady" width={32} height={32} />
                                    <span className="text-xl font-semibold text-white bg-clip-text ">
                                        ShowcaseReady
                                    </span>
                                </div>
                                <p className="text-white text-sm leading-relaxed">
                                    Product videos made super quick
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-3">Product</h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <Link href="#features" className="text-zinc-500 hover:text-zinc-600 text-sm transition-colors">
                                                Features
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#demo" className="text-zinc-500 hover:text-zinc-600 text-sm transition-colors">
                                                Demo
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#pricing" className="text-zinc-500 hover:text-zinc-600 text-sm transition-colors">
                                                Pricing
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-3">Company</h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <Link href="/about" className="text-zinc-500 hover:text-zinc-600 text-sm transition-colors">
                                                About
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/contact" className="text-zinc-500 hover:text-zinc-600 text-sm transition-colors">
                                                Contact
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/careers" className="text-zinc-500 hover:text-zinc-600 text-sm transition-colors">
                                                Careers
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                <div className="hidden md:block">
                                    <h3 className="text-sm font-semibold text-white mb-3">Resources</h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <Link href="/blog" className="text-zinc-500 hover:text-zinc-600 text-sm transition-colors">
                                                Blog
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/docs" className="text-zinc-500 hover:text-zinc-600 text-sm transition-colors">
                                                Documentation
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/guides" className="text-zinc-500 hover:text-zinc-600 text-sm transition-colors">
                                                Guides
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-white">
                                © 2025 ShowcaseReady. All rights reserved.
                            </div>
                            <div className="flex items-center gap-6">
                                <Link href="/terms" className="text-sm text-zinc-500 hover:text-zinc-600 transition-colors">
                                    Terms of Service
                                </Link>
                                <Link href="/privacy" className="text-sm text-zinc-500 hover:text-zinc-600 transition-colors">
                                    Privacy Policy
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}