import { AlertTriangle, Shield, MessageSquare, Award, Calendar } from "lucide-react"

const features = [
  {
    icon: AlertTriangle,
    title: "AI Emergency Detection",
    description:
      "Our AI system automatically detects emergency-related posts and prioritizes them for faster community response.",
  },
  {
    icon: Shield,
    title: "Community Moderation",
    description: "Trusted community members help verify emergencies and maintain the integrity of information shared.",
  },
  {
    icon: MessageSquare,
    title: "Report System",
    description: "Easy-to-use reporting tools for community members to alert others about emergencies in real-time.",
  },
  {
    icon: Award,
    title: "Trust Scores & Verified Users",
    description: "Know which information sources are reliable with our trust scoring system and verified user badges.",
  },
  {
    icon: Calendar,
    title: "Event Calendar",
    description: "Stay informed about upcoming drills, training sessions, and community emergency preparedness events.",
  },
]

export default function FeatureHighlight() {
  return (
    <section id="features" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Platform Features</h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform combines technology and community to create a safer barangay for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm md:text-base">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
