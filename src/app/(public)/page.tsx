import React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Shield, Users, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"

type FeatureCardProps = {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-slate-700 p-6 rounded-xl shadow-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-300">{description}</p>
    </div>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">RefugeeReview</h1>
          <p className="text-xl sm:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto">
            Empowering adjudicators with intelligent questioning for fair refugee assessments
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-lg py-6 px-8 rounded-full">
            <Link href="/login">
              Get Started <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-blue-500" />}
              title="AI-Powered Questions"
              description="Generate tailored, context-aware questions to guide your interviews effectively."
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-green-500" />}
              title="Fair Assessment"
              description="Ensure consistency and fairness in the refugee adjudication process."
            />
            <FeatureCard
              icon={<Globe className="w-12 h-12 text-purple-500" />}
              title="Global Insights"
              description="Access up-to-date information on global conflicts and refugee situations."
            />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">See RefugeeLine in Action</h2>
          <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/placeholder.svg?height=720&width=1280"
              alt="RefugeeLine Demo"
              width={1280}
              height={720}
              className="object-cover"
            />
          </div>
          <div className="mt-8 text-center">
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 text-lg py-4 px-8 rounded-full">
              <Link href="#watch-demo">Watch Full Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-2xl sm:text-3xl font-light italic mb-8">
            "RefugeeLine has revolutionized our adjudication process. It provides insightful questions that help us make
            fair and informed decisions."
          </blockquote>
          <p className="text-lg font-semibold">- Sarah Johnson, Senior Refugee Adjudicator</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Transform Your Adjudication Process?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Join RefugeeLine today and access a powerful tool designed to support fair and efficient refugee
            assessments.
          </p>
          <Button asChild className="bg-white text-blue-600 hover:bg-slate-100 text-lg py-6 px-8 rounded-full">
            <Link href="/signup">
              Sign Up Now <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
