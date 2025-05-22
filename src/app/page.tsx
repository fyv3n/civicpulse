"use client"

import { Button } from "@/components/ui/button"
import HeroSection from "@/components/landing/hero-section"
// import FeatureHighlight from "@/components/landing/feature-highlight"
// import HowItWorks from "@/components/landing/how-it-works"
// import Footer from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-red-600"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          <span className="text-xl font-bold">CivicPulse</span>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700"
            id="mobile-menu-button"
            onClick={() => {
              const menu = document.getElementById("mobile-menu")
              if (menu) {
                menu.classList.toggle("hidden")
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium hover:text-red-600 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium hover:text-red-600 transition-colors">
            How It Works
          </a>
          <a href="#contact" className="text-sm font-medium hover:text-red-600 transition-colors">
            Contact
          </a>
        </nav>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href="/feed">Log In</a>
          </Button>
          <Button asChild>
            <a href="/signup">Sign Up</a>
          </Button>
        </div>
      </header>

      {/* Mobile menu */}
      <div id="mobile-menu" className="hidden md:hidden container mx-auto px-4 py-4 bg-white border-b border-gray-200">
        <nav className="flex flex-col space-y-4">
          <a href="#features" className="text-sm font-medium hover:text-red-600 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium hover:text-red-600 transition-colors">
            How It Works
          </a>
          <a href="#contact" className="text-sm font-medium hover:text-red-600 transition-colors">
            Contact
          </a>
          <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
            <Button variant="outline" asChild className="w-full">
              <a href="/feed">Log In</a>
            </Button>
            <Button asChild className="w-full">
              <a href="/signup">Sign Up</a>
            </Button>
          </div>
        </nav>
      </div>

      <main className="flex-1">
        <HeroSection />
        {/* <FeatureHighlight />
        <HowItWorks /> */}
      </main>

      {/* <Footer /> */}
    </div>
  )
}
