"use client"

export function FeaturesBanner() {
    const features = [
        "Dynamic Zoom",
        "Glide Animation",
        "Music",
        "Webcam Recorder",
        "Zoom Effect",
        "3D Scene",
        "Add Background",
        "Text Animations",
        "AI Voiceover",
        "Screen Recorder"
    ]

    return (
        <section className="py-16 bg-black text-white">
            <div className="text-center mb-12">
                <h2 className="text-4xl text-white mb-2">
                    Discover all the features
                </h2>
                <p className="text-gray-500 text-sm font-light tracking-wide">
                    Showcase your product with ease
                </p>
            </div>
            <div className="relative overflow-x-hidden">
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent z-10"></div>
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent z-10"></div>

                <div className="flex whitespace-nowrap animate-scroll-left">
                    {[...features, ...features, ...features].map((feature, index) => (
                        <div
                            key={index}
                            className="inline-flex items-center mx-12"
                        >
                            <span className="text-gray-400 text-lg font-light">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
} 