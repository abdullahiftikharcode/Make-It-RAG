import { HeroSection } from "@/components/hero-section"
import { FeatureSection } from "@/components/feature-section"
import { PricingSection } from "@/components/pricing-section"
import { TestimonialSection } from "@/components/testimonial-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeatureSection />
        <TestimonialSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

