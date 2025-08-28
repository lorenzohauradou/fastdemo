"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Pricing() {
    const [isYearly, setIsYearly] = useState(false)

    const plans = [
        {
            name: "Starter",
            price: "Free",
            features: [
                "All features available",
                "Unlimited exports",
                "1k sample AI voiceover characters"
            ],
            warning: "First project free, then watermarked",
            buttonText: "Get Started",
            buttonVariant: "outline" as const,
            popular: false
        },
        {
            name: "Pro",
            price: isYearly ? "$9" : "$19",
            priceSubtext: isYearly ? "per month, billed yearly" : "per month, billed monthly",
            description: "/mo",
            features: [
                "No watermarks",
                "Unlimited exports",
                "One authorized user",
                "10k AI voiceover characters / mo"
            ],
            buttonText: "Get Started",
            buttonVariant: "default" as const,
            popular: true
        },
        {
            name: "Enterprise",
            price: "Contact us",
            description: "for teams & agencies",
            features: [
                "Multi-user licenses",
                "Cloud collaboration",
                "Custom integrations"
            ],
            buttonText: "Contact us",
            buttonVariant: "outline" as const,
            popular: false
        }
    ]

    return (
        <section className="py-24 bg-black text-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-bold mb-6">Pricing</h2>
                    <p className="text-xl text-gray-400 mb-12">
                        Start using ShowcaseReady for free—no sign up required.
                    </p>

                    <div className="flex items-center justify-center gap-4 mb-12">
                        <span className={`text-lg ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className={`text-lg ${isYearly ? 'text-white' : 'text-gray-400'}`}>
                            Yearly{' '}
                            <Badge variant="secondary" className="ml-2 bg-purple-600 text-white">
                                Save 33%
                            </Badge>
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <Card
                            key={plan.name}
                            className={`relative p-8 bg-transparent backdrop-blur-sm border-purple-300'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <Badge className="bg-purple-600 text-white px-4 py-1">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-400 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    {plan.description && (
                                        <span className="text-gray-400">{plan.description}</span>
                                    )}
                                </div>
                                {plan.priceSubtext && (
                                    <p className="text-sm text-gray-400 mt-2">{plan.priceSubtext}</p>
                                )}
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-start gap-3">
                                        <svg
                                            className="w-5 h-5 text-white mt-0.5 flex-shrink-0"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {plan.warning && (
                                <div className="flex items-start gap-2 mb-6 p-3 bg-orange-900/20 border border-orange-800 rounded">
                                    <svg
                                        className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="text-sm text-orange-300">{plan.warning}</span>
                                </div>
                            )}

                            <Button
                                variant={plan.buttonVariant}
                                className={`w-full ${plan.popular
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600'
                                    }`}
                            >
                                {plan.buttonText}
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
