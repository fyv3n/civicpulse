export default function HowItWorks() {
    const steps = [
      {
        number: "01",
        title: "Create a Post",
        description: "Share information about emergencies or potential hazards in your barangay.",
      },
      {
        number: "02",
        title: "AI Detects Emergency",
        description: "Our AI system automatically identifies emergency-related content and flags it for priority.",
      },
      {
        number: "03",
        title: "Moderators Review",
        description: "Trusted community moderators verify the information to prevent false alarms.",
      },
      {
        number: "04",
        title: "Community Gets Notified",
        description: "Verified emergency alerts are sent to community members based on location and severity.",
      },
    ]
  
    return (
      <section id="how-it-works" className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes emergency reporting and response simple and effective.
            </p>
          </div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-lg p-6 shadow-sm h-full">
                  <div className="text-3xl font-bold text-red-600 mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="#D1D5DB"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                {/* Mobile arrow indicator */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center lg:hidden my-4">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="rotate-90"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="#D1D5DB"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  