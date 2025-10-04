import { CheckCircle, Shield, Leaf, Utensils } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Blockchain Verified",
      description: "Our blockchain-based verification ensures complete transparency and immutable records",
    },
    {
      icon: CheckCircle,
      title: "AI Trust Scores",
      description: "Advanced AI algorithms verify and authenticate to give you complete confidence",
    },
    {
      icon: Leaf,
      title: "100% Organic",
      description: "Certified organic products with detailed chemical residue reports and certifications",
    },
    {
      icon: Utensils,
      title: "Farm to Table",
      description: "Complete supply chain transparency with real-time tracking from source to your door",
    },
  ]

  return (
    <section id="features" className="bg-muted px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Why Choose Trust Trace?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Revolutionary transparency in organic food with cutting-edge technology that ensures quality and trust
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-background">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
