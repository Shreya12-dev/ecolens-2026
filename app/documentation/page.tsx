"use client"
import Header from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Book, Code, Zap, Shield, Users, GitBranch, ExternalLink } from "lucide-react"

const sections = [
  {
    title: "Getting Started",
    icon: Book,
    items: [
      { name: "Platform Overview", desc: "Understand EcoLens capabilities and features" },
      { name: "User Dashboard Guide", desc: "Navigate the main dashboard and key features" },
      { name: "Regional Setup", desc: "Configure monitoring regions and parameters" },
    ],
  },
  {
    title: "API Documentation",
    icon: Code,
    items: [
      { name: "REST API Reference", desc: "Complete API endpoints and authentication" },
      { name: "Data Models", desc: "Schema definitions and data structures" },
      { name: "Integration Guide", desc: "Third-party integrations and webhooks" },
    ],
  },
  {
    title: "AI & ML",
    icon: Zap,
    items: [
      { name: "Model Architecture", desc: "YOLOv8 object detection and TensorFlow pipelines" },
      { name: "Training Data", desc: "Dataset sources and preparation guidelines" },
      { name: "Model Performance", desc: "Accuracy metrics and benchmarks" },
    ],
  },
  {
    title: "Security & Privacy",
    icon: Shield,
    items: [
      { name: "Data Protection", desc: "GDPR compliance and data encryption standards" },
      { name: "Access Control", desc: "Role-based access and permissions management" },
      { name: "Audit Logs", desc: "Security auditing and compliance reporting" },
    ],
  },
  {
    title: "Team & Support",
    icon: Users,
    items: [
      { name: "Team Management", desc: "Invite collaborators and manage permissions" },
      { name: "Support Channels", desc: "Contact support and report issues" },
      { name: "Community Forum", desc: "Connect with other EcoLens users" },
    ],
  },
  {
    title: "Version Control",
    icon: GitBranch,
    items: [
      { name: "Release Notes", desc: "Latest updates and feature releases" },
      { name: "Migration Guides", desc: "Upgrade guides for version transitions" },
      { name: "Changelog", desc: "Complete history of changes" },
    ],
  },
]

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Documentation</h1>
          <p className="text-muted-foreground text-lg">Complete guides and API reference for EcoLens</p>
        </div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.title} className="glassmorphism border-primary/20 card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.name} className="group cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 glassmorphism border border-primary/20 rounded-lg p-8 card-hover">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">Need Help?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Visit our support center or get in touch with the EcoLens team
              directly.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button className="gap-2">
                Open Support Portal
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="outline">Contact Sales</Button>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glassmorphism border-secondary/20">
            <CardHeader>
              <CardTitle className="text-lg">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">ML/AI</p>
                <p className="text-sm text-muted-foreground">YOLOv8, TensorFlow, PyTorch</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Satellite Data</p>
                <p className="text-sm text-muted-foreground">NASA MODIS, ESA Sentinel, Google Earth Engine</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Backend</p>
                <p className="text-sm text-muted-foreground">Node.js, Python, PostgreSQL</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Frontend</p>
                <p className="text-sm text-muted-foreground">React, Next.js, Tailwind CSS</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-accent/20">
            <CardHeader>
              <CardTitle className="text-lg">Partnerships</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-foreground text-sm">WWF</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">World Wildlife Fund</p>
                  <p className="text-xs text-muted-foreground">Conservation partner</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-foreground text-sm">NASA</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">NASA</p>
                  <p className="text-xs text-muted-foreground">Satellite data provider</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-foreground text-sm">GEE</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Google Earth Engine</p>
                  <p className="text-xs text-muted-foreground">Geospatial analysis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
