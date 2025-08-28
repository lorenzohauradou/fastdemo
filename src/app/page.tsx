import { Hero } from "@/components/landing/Hero"
import { LandingPage } from "@/components/landing/LandingPage"
import { Header } from "@/components/landing/Header"
import { StickyCTA } from "@/components/ui/sticky-cta"
import { Footer } from "@/components/landing/Footer"
import { Pricing } from "@/components/landing/Pricing"
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
      <Header />
      <main className="overflow-x-hidden bg-black">
        <Hero />
        <Pricing />
        <Footer />
        <LandingPage />
      </main>
      <StickyCTA />
    </div>
  )
}