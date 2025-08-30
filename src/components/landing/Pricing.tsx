"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Pricing() {
    const [isYearly, setIsYearly] = useState(true)

    const plans = [
        {
            name: "Free",
            label: "Free",
            price: "Free",
            subtitle: "all videos are watermarked",
            features: [
                "All features available",
                "Unlimited exports",
                "1k sample AI voiceover characters"
            ],
            buttonText: "Get Started"
        },
        {
            name: "Pro",
            label: "Pro",
            price: isYearly ? "$9" : "$19",
            subtitle: isYearly ? "per month, billed yearly" : "per month, billed monthly",
            features: [
                "No watermarks",
                "Unlimited exports",
                "One authorized user",
                "10k AI voiceover characters / mo"
            ],
            buttonText: "Get Started"
        },
        {
            name: "Enterprise",
            label: "Enterprise",
            price: "Contact us",
            subtitle: "for teams & agencies",
            features: [
                "Multi-user licenses",
                "API access",
                "Custom integrations"
            ],
            buttonText: "Contact us"
        }
    ]

    return (
        <section className="relative min-h-screen text-white overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 container mx-auto px-6 py-24">
                <div className="text-center mb-12">
                    <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text ">
                        Pricing
                    </h2>
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        Start using ShowcaseReady for free—no credit card required.
                    </p>
                    <div className="flex items-center justify-center gap-6 mb-16">
                        <span className={`text-lg font-medium transition-colors ${!isYearly ? 'text-white' : 'text-gray-500'}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative inline-flex h-7 w-12 items-center rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-transparent hover:bg-gray-700/50"
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg transition-transform duration-300 ${isYearly ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className={`text-lg font-medium transition-colors ${isYearly ? 'text-white' : 'text-gray-500'}`}>
                            Yearly{' '}
                            <Badge className="ml-2 bg-purple-600/20 hover:bg-purple-600/30 text-gray-300 border-purple-500/50 hover:border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] backdrop-blur-sm">
                                Save 50%
                            </Badge>
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className="relative group"
                        >
                            <div className="absolute inset-0 rounded-2xl transition-all duration-500 bg-white/5 blur-xl group-hover:blur-2xl"></div>

                            <div className="relative backdrop-blur-xl bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-2xl p-8 transition-all duration-500 group-hover:bg-white/[0.04]">

                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-400 mb-4">{plan.label}</h3>
                                    <div className="mb-2">
                                        <span className="text-5xl font-bold text-white">{plan.price}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{plan.subtitle}</p>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600/20 hover:bg-purple-600/30 text-gray-300 border-purple-500/50 hover:border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] backdrop-blur-sm flex items-center justify-center mt-0.5">
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 ${plan.name === "Pro"
                                        ? "bg-purple-600/20 hover:bg-purple-600/30 text-white border-purple-500/50 hover:border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] backdrop-blur-sm"
                                        : "bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm"
                                        }`}
                                >
                                    {plan.buttonText}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
