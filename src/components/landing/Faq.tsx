"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

interface FAQItem {
    question: string
    answer: string
}

export function FAQ() {
    const [openItems, setOpenItems] = useState<number[]>([])

    const faqItems: FAQItem[] = [
        {
            question: "How is Snap Screen different from Loom?",
            answer: "Loom is a fantastic tool for quick, internal communication. Snap Screen is designed for a different job: creating polished, professional video assets for your marketing. While Loom gives you a raw recording, we provide the tools to transform it into a compelling product demo with custom backgrounds, device frames, animated text, background music, and natural-sounding AI voiceovers—all without needing a separate video editor."
        },
        {
            question: "Do I need any video editing experience?",
            answer: "Absolutely not. Snap Screen is built specifically for founders, marketers, and solopreneurs, not professional video editors. Our interface is intuitive and streamlined, allowing you to add professional touches like smooth zoom animations and text overlays in just a few clicks. The goal is to get you a stunning result in minutes, not hours."
        },
        {
            question: "How do the AI Voiceovers work?",
            answer: "It's simple! Just type or paste your script, choose from a library of high-quality, natural-sounding AI voices, and generate the narration for your video. It's the perfect way to get a clear, professional voiceover without the hassle of recording and editing your own voice, especially if you're not a native English speaker."
        },
        {
            question: "What resolution can I export my videos in?",
            answer: "Quality is key for a professional demo. All videos, including those made on the Free plan, can be exported in 4K, 1080p, and 720p."
        }
    ]

    const toggleItem = (index: number) => {
        setOpenItems(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    return (
        <section className="relative min-h-screen text-white overflow-hidden py-24">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-6xl font-bold text-white">FAQ</h2>
                </div>
                <div className="max-w-4xl mx-auto">
                    {faqItems.map((item, index) => (
                        <div key={index} className="group">
                            <button
                                onClick={() => toggleItem(index)}
                                className="w-full flex items-center justify-between py-8 text-left transition-all duration-300 hover:text-gray-300"
                            >
                                <h3 className="text-xl font-medium text-white pr-8">
                                    {item.question}
                                </h3>

                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300">
                                    {openItems.includes(index) ? (
                                        <Minus className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${openItems.includes(index)
                                    ? 'max-h-96 opacity-100 pb-8'
                                    : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="pr-12">
                                    <p className="text-gray-400 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>

                            {index < faqItems.length - 1 && (
                                <div className="border-b border-gray-800/50"></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="h-20"></div>
            </div>
        </section>
    )
}
