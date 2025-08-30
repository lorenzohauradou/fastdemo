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
            question: "Does ShowcaseReady work on Windows?",
            answer: "Yes, ShowcaseReady works perfectly on Windows, macOS, and Linux. Our web-based platform is compatible with all modern browsers, so you can create professional screen recordings from any operating system."
        },
        {
            question: "Can I bring my own videos and images?",
            answer: "Absolutely! You can upload your own videos, images, and audio files to enhance your screen recordings. We support all major formats including MP4, MOV, PNG, JPG, and MP3. Simply drag and drop your files into the editor."
        },
        {
            question: "Can I combine multiple recordings?",
            answer: "Yes, you can easily combine multiple screen recordings into a single video. Our timeline editor allows you to arrange, trim, and merge different recordings seamlessly. Perfect for creating comprehensive tutorials or presentations."
        },
        {
            question: "Security and privacy?",
            answer: "Your privacy and security are our top priorities. All uploads are encrypted in transit and at rest. We never store your content permanently without your permission, and you can delete your projects at any time. We're GDPR compliant and follow industry-standard security practices."
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
