"use client"

import { useState } from "react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Flame, Cloud } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const historicalData = [
  { month: "Jan", incidents: 2, area: 45 },
  { month: "Feb", incidents: 3, area: 62 },
  { month: "Mar", incidents: 5, area: 128 },
  { month: "Apr", incidents: 8, area: 245 },
  { month: "May", incidents: 12, area: 456 },
  { month: "Jun", incidents: 18, area: 1023 },
]

const riskZones = [
  { region: "Western Ghats", risk: 85, incidents: 12, status: "HIGH" },
  { region: "Siberian Taiga", risk: 72, incidents: 8, status: "HIGH" },
  { region: "Amazon Basin", risk: 62, incidents: 6, status: "CAUTION" },
  { region: "Australian Outback", risk: 48, incidents: 4, status: "CAUTION" },
  { region: "Mediterranean", risk: 35, incidents: 2, status: "SAFE" },
]

export default function FireRiskPage() {
  const [selectedZone, setSelectedZone] = useState(0)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Fire Risk Assessment</h1>
          <p className="text-muted-foreground">
            Real-time fire risk prediction and monitoring across monitored regions
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Fire Zones", value: "24", color: "text-destructive" },
            { label: "High Risk Areas", value: "8", color: "text-accent" },
            { label: "Incidents This Month", value: "47", color: "text-secondary" },
            { label: "Area Affected (km²)", value: "2,847", color: "text-primary" },
          ].map((metric, i) => (
            <div key={i} className="glassmorphism p-4 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Historical Trends */}
          <div className="lg:col-span-2 glassmorphism border border-accent/20 rounded-lg p-6 card-hover">
            <h2 className="text-lg font-bold text-foreground mb-4">Historical Trends</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F4A261" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F4A261" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(20,20,20,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="incidents"
                    stroke="#F4A261"
                    fillOpacity={1}
                    fill="url(#colorIncidents)"
                    name="Fire Incidents"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Assessment Legend */}
          <div className="glassmorphism border border-primary/20 rounded-lg p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Risk Levels</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-destructive/20 rounded-lg border border-destructive/30">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="font-semibold text-destructive">HIGH RISK</span>
                </div>
                <span className="text-xs">75-100%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg border border-accent/30">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-accent">CAUTION</span>
                </div>
                <span className="text-xs">50-75%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/20 rounded-lg border border-primary/30">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary">SAFE</span>
                </div>
                <span className="text-xs">0-50%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Zones Table */}
        <div className="glassmorphism border border-accent/20 rounded-lg p-6 card-hover">
          <h2 className="text-lg font-bold text-foreground mb-4">Regional Risk Assessment</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Region</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Risk Level</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Incidents</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {riskZones.map((zone, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4 text-sm text-foreground font-medium">{zone.region}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              zone.risk > 70 ? "bg-destructive" : zone.risk > 50 ? "bg-accent" : "bg-primary"
                            }`}
                            style={{ width: `${zone.risk}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-foreground">{zone.risk}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{zone.incidents} incidents</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          zone.status === "HIGH"
                            ? "bg-destructive/20 text-destructive"
                            : zone.status === "CAUTION"
                              ? "bg-accent/20 text-accent"
                              : "bg-primary/20 text-primary"
                        }`}
                      >
                        {zone.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
