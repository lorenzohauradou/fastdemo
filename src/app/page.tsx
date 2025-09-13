import { Hero } from "@/components/landing/Hero"
import { Header } from "@/components/landing/Header"
import { StickyCTA } from "@/components/ui/sticky-cta"
import { Footer } from "@/components/landing/Footer"
import { Pricing } from "@/components/landing/Pricing"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { FAQ } from "@/components/landing/Faq"
import { FeaturesBanner } from "@/components/landing/FeaturesBanner"
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
      <Header />
      <main className="overflow-x-hidden bg-black">
        <Hero />
        <FeaturesBanner />
        <FeaturesSection />
        <Pricing />
        <FAQ />
        <Footer />
      </main>
      <StickyCTA />
    </div>
  )
}