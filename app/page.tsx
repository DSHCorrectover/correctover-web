"use client"

import { useState } from "react"

export default function LandingPage() {
  const [serverUrl, setServerUrl] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("standard")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch("http://localhost:4000/api/audit/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverUrl,
          plan: selectedPlan,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert(`Audit submitted! ID: ${data.auditId}`)
        window.location.href = `/dashboard/audit/${data.auditId}`
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error(error)
      alert("Failed to submit audit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">Correctover</div>
          <div className="space-x-6">
            <a href="#features" className="hover:text-blue-400">Features</a>
            <a href="#pricing" className="hover:text-blue-400">Pricing</a>
            <a href="/auth/signin" className="hover:text-blue-400">Sign In</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          MCP Server Security Audit Platform
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Comprehensive 7-dimension CCS audit powered by AI agents. 
          Identify vulnerabilities, optimize performance, and ensure compliance.
        </p>
        
        {/* Quick Audit Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-12">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="url"
              placeholder="Enter your MCP server URL..."
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              required
              className="flex-1 px-6 py-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Start Audit"}
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Free trial available • Results in 5-10 minutes
          </p>
        </form>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">7-Dimension CCS Audit Framework</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Structure",
              description: "Tool structure integrity, organization, and maintainability assessment",
              icon: "🏗️",
            },
            {
              title: "Schema",
              description: "Data schema validation and IETF standards compliance",
              icon: "📋",
            },
            {
              title: "Latency",
              description: "Performance metrics and response time analysis",
              icon: "⚡",
            },
            {
              title: "Cost",
              description: "Cost efficiency evaluation and optimization recommendations",
              icon: "💰",
            },
            {
              title: "Identity",
              description: "Authentication mechanisms and identity management review",
              icon: "🔐",
            },
            {
              title: "Integrity",
              description: "Data integrity validation and consistency checks",
              icon: "✓",
            },
            {
              title: "Security",
              description: "Comprehensive security posture and vulnerability assessment",
              icon: "🛡️",
            },
          ].map((feature, index) => (
            <div key={index} className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">Pricing Plans</h2>
        <p className="text-center text-gray-400 mb-12">Choose the plan that fits your needs</p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Founding Plan */}
          <div className="p-8 bg-gray-800 rounded-lg border border-gray-700 hover:border-yellow-500 transition-all">
            <div className="text-yellow-400 text-sm font-semibold mb-2">EARLY ADOPTER</div>
            <h3 className="text-2xl font-bold mb-4">Founding Member</h3>
            <div className="text-4xl font-bold mb-2">¥35,000</div>
            <p className="text-gray-400 mb-6">One-time audit</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Complete 7-dimension CCS audit</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Detailed PDF report with findings</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Priority support (48h response)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Lifetime 20% discount on future audits</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Featured in MCP Atlas Census</span>
              </li>
            </ul>
            
            <button
              onClick={() => setSelectedPlan("founding")}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                selectedPlan === "founding"
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Select Plan
            </button>
          </div>

          {/* Standard Plan */}
          <div className="p-8 bg-gray-800 rounded-lg border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                MOST POPULAR
              </span>
            </div>
            
            <h3 className="text-2xl font-bold mb-4">Standard</h3>
            <div className="text-4xl font-bold mb-2">¥50,000</div>
            <p className="text-gray-400 mb-6">One-time audit</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Complete 7-dimension CCS audit</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Detailed PDF report with findings</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Standard support (72h response)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Remediation recommendations</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>API access for integration</span>
              </li>
            </ul>
            
            <button
              onClick={() => setSelectedPlan("standard")}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                selectedPlan === "standard"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Select Plan
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="p-8 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-all">
            <div className="text-purple-400 text-sm font-semibold mb-2">ENTERPRISE</div>
            <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
            <div className="text-4xl font-bold mb-2">¥100,000</div>
            <p className="text-gray-400 mb-6">Per year subscription</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Unlimited audits (up to 12/year)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Comprehensive reports + executive summary</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Premium support (24h response)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Custom integration support</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Quarterly re-audits included</span>
              </li>
            </ul>
            
            <button
              onClick={() => setSelectedPlan("enterprise")}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                selectedPlan === "enterprise"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Contact Sales
            </button>
          </div>
        </div>

        {/* API Subscription */}
        <div className="mt-12 p-8 bg-gray-800 rounded-lg border border-gray-700 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-center">API Subscription</h3>
          <p className="text-center text-gray-400 mb-6">
            Integrate CCS audit capabilities into your own platform
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold mb-2">¥199/mo</div>
              <p className="text-sm text-gray-400">Starter</p>
              <p className="text-xs text-gray-500 mt-2">100 audits/month</p>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold mb-2">¥499/mo</div>
              <p className="text-sm text-gray-400">Professional</p>
              <p className="text-xs text-gray-500 mt-2">500 audits/month</p>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold mb-2">¥799/mo</div>
              <p className="text-sm text-gray-400">Business</p>
              <p className="text-xs text-gray-500 mt-2">Unlimited audits</p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="container mx-auto px-6 py-12 text-center">
        <h3 className="text-2xl font-bold mb-6">Accepted Payment Methods</h3>
        <div className="flex justify-center items-center gap-8 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            <span>Credit Card (Stripe)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💴</span>
            <span>Alipay</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <span>USDC (Base Chain)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏦</span>
            <span>Wire Transfer</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400">
              © 2026 Correctover. All rights reserved.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="mailto:wangguigui@correctover.com" className="text-gray-400 hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
