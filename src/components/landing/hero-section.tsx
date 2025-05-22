import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="py-12 md:py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
            Empowering Barangays with Smarter Emergency Detection
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto md:mx-0">
            A community-driven platform that uses AI to detect emergencies, connect neighbors, and coordinate rapid
            responses when every minute counts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-4 justify-center md:justify-start">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a href="/auth/signup">Get Started</a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <a href="/auth/login">Log In</a>
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center mt-8 md:mt-0">
          <div className="relative w-full max-w-sm md:max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg blur opacity-25"></div>
            <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
              <img
                src="/placeholder.svg?height=400&width=400"
                alt="Barangay emergency response system"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
