"use client"

import { useState } from "react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Lightbulb, Download, Share2, TrendingUp, AlertCircle, CheckCircle, BarChart3 } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from "recharts"

const insights = [
  {
    id: 1,
    title: "Habitat Loss Accelerating in Amazon Basin",
    type: "Alert",
    priority: "Critical",
    description:
      "Deforestation rates have increased 23% quarter-over-quarter, directly correlating with 67% of observed wildlife population decline.",
    recommendation:
      "Increase protected region enforcement in Critical Zones A and B. Recommend immediate conservation intervention.",
    impact: "High",
    regions: ["Amazon Basin", "Central Africa"],
    confidence: 94,
  },
  {
    id: 2,
    title: "Fire Season Intensifying Earlier Than Expected",
    type: "Forecast",
    priority: "High",
    description:
      "ML models predict 2-week early onset of peak fire season due to elevated temperatures and reduced humidity.",
    recommendation:
      "Mobilize rapid response teams now. Pre-position resources in Western Ghats and Siberian Taiga zones.",
    impact: "High",
    regions: ["Western Ghats", "Siberian Taiga"],
    confidence: 88,
  },
  {
    id: 3,
    title: "Species Recovery Success: Giant Panda Population Stabilizing",
    type: "Success",
    priority: "Positive",
    description:
      "Protected habitat preservation efforts showing measurable results with 3% population growth after 5 years of decline.",
    recommendation:
      "Scale successful breeding and reintroduction programs to other endangered species (Bengal Tigers, Sumatran Orangutans).",
    impact: "Medium",
    regions: ["China"],
    confidence: 92,
  },
  {
    id: 4,
    title: "Carbon Sequestration Decline Tracking Deforestation",
    type: "Trend",
    priority: "High",
    description:
      "Every 1% deforestation increase correlates with 0.8% carbon sequestration loss. Current trajectory unsustainable.",
    recommendation:
      "Implement comprehensive reforestation initiatives in degraded zones. Target 500k hectares within 24 months.",
    impact: "Critical",
    regions: ["All Monitored Regions"],
    confidence: 97,
  },
]

const correlationData = [
  { deforestation: 5, population: 98 },
  { deforestation: 8, population: 94 },
  { deforestation: 12, population: 89 },
  { deforestation: 18, population: 81 },
  { deforestation: 25, population: 72 },
  { deforestation: 35, population: 58 },
  { deforestation: 48, population: 42 },
]

export default function InsightsPage() {
  const [selectedType, setSelectedType] = useState("all")

  const filteredInsights = selectedType === "all" ? insights : insights.filter((i) => i.type === selectedType)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">AI-Powered Insights</h1>
          <p className="text-muted-foreground">
            Machine learning-generated recommendations for policymakers and conservation organizations
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {["all", "Alert", "Forecast", "Trend", "Success"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {type === "all" ? "All Insights" : type}
            </button>
          ))}
        </div>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {filteredInsights.map((insight) => {
            const iconColor = {
              Alert: "text-destructive",
              Forecast: "text-sky",
              Success: "text-primary",
              Trend: "text-secondary",
            }
            const bgColor = {
              Alert: "border-destructive/20 bg-destructive/5",
              Forecast: "border-sky/20 bg-sky/5",
              Success: "border-primary/20 bg-primary/5",
              Trend: "border-secondary/20 bg-secondary/5",
            }
            const priorityColor = {
              Critical: "bg-destructive/20 text-destructive",
              High: "bg-accent/20 text-accent",
              Medium: "bg-secondary/20 text-secondary",
              Positive: "bg-primary/20 text-primary",
            }

            return (
              <div
                key={insight.id}
                className={`glassmorphism card-hover border rounded-lg p-6 ${bgColor[insight.type as keyof typeof bgColor]}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${bgColor[insight.type as keyof typeof bgColor]}`}>
                      {insight.type === "Alert" && (
                        <AlertCircle className={`w-5 h-5 ${iconColor[insight.type as keyof typeof iconColor]}`} />
                      )}
                      {insight.type === "Success" && (
                        <CheckCircle className={`w-5 h-5 ${iconColor[insight.type as keyof typeof iconColor]}`} />
                      )}
                      {insight.type === "Forecast" && (
                        <TrendingUp className={`w-5 h-5 ${iconColor[insight.type as keyof typeof iconColor]}`} />
                      )}
                      {insight.type === "Trend" && (
                        <BarChart3 className={`w-5 h-5 ${iconColor[insight.type as keyof typeof iconColor]}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ml-4 ${priorityColor[insight.priority as keyof typeof priorityColor]}`}
                  >
                    {insight.priority}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-background/50 rounded-lg p-4 mb-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1 font-semibold">AI Recommendation:</p>
                  <p className="text-sm text-foreground">{insight.recommendation}</p>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 items-center mb-4">
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${insight.confidence}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{insight.confidence}%</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {insight.regions.map((region) => (
                      <span key={region} className="px-2 py-1 text-xs bg-muted/30 text-muted-foreground rounded">
                        {region}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs gap-1 bg-transparent">
                    <Download className="w-3 h-3" />
                    Export Report
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs gap-1 bg-transparent">
                    <Share2 className="w-3 h-3" />
                    Share
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Correlation Analysis */}
        <div className="glassmorphism border border-primary/20 rounded-lg p-6 card-hover">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Deforestation vs Wildlife Population Correlation
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Strong negative correlation (R² = 0.98) showing deforestation impact on population survival rates across all
            monitored regions.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" dataKey="deforestation" name="Deforestation %" stroke="rgba(255,255,255,0.3)" />
                <YAxis type="number" dataKey="population" name="Population Index" stroke="rgba(255,255,255,0.3)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(20,20,20,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
                  cursor={{ fill: "rgba(255,255,255,0.1)" }}
                />
                <Scatter name="Region Data" data={correlationData} fill="#F4A261" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  )
}
