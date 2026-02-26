"use client"

import { useState } from "react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Layers, MapPin } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const regionalData = [
  { region: "Amazon Basin", co2: 2400, deforestation: 245, species: 18 },
  { region: "Southeast Asia", co2: 2210, deforestation: 198, species: 14 },
  { region: "Central Africa", co2: 1890, deforestation: 156, species: 11 },
  { region: "Siberian Taiga", co2: 1750, deforestation: 142, species: 8 },
  { region: "Atlantic Forest", co2: 945, deforestation: 87, species: 6 },
]

const monthlyEmissions = [
  { month: "Jan", actual: 1200, baseline: 1100 },
  { month: "Feb", actual: 1350, baseline: 1150 },
  { month: "Mar", actual: 1800, baseline: 1200 },
  { month: "Apr", actual: 2100, baseline: 1250 },
  { month: "May", actual: 2450, baseline: 1300 },
  { month: "Jun", actual: 2847, baseline: 1350 },
]

export default function CarbonImpactPage() {
  const [sliderValue, setSliderValue] = useState(50)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Carbon Impact Analysis</h1>
          <p className="text-muted-foreground">Satellite-based deforestation tracking and CO₂ emissions monitoring</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total CO₂ Emissions (This Month)",
              value: "2,847 tons",
              change: "+15%",
              color: "text-destructive",
            },
            { label: "Total Deforestation", value: "124 hectares", change: "-2%", color: "text-accent" },
            { label: "Species Affected", value: "18 species", change: "+3", color: "text-secondary" },
            { label: "Carbon Sequestration Loss", value: "456 tons/day", change: "+8%", color: "text-primary" },
          ].map((stat, i) => (
            <div key={i} className="glassmorphism p-4 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <div className="flex items-baseline justify-between">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Before/After Slider */}
        <div className="glassmorphism border border-secondary/20 rounded-lg p-6 mb-8 card-hover">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Satellite Imagery Comparison
          </h2>
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg h-64 bg-muted/20">
              <div className="absolute inset-0 flex">
                {/* Before */}
                <div className="flex-1 overflow-hidden">
                  <img src="/forest-healthy.jpg" alt="Before" className="w-full h-full object-cover" />
                </div>
                {/* After */}
                <div className="flex-1 overflow-hidden">
                  <img src="/deforestation-cleared.jpg" alt="After" className="w-full h-full object-cover" />
                </div>
              </div>
              {/* Slider Handle */}
              <div
                className="absolute inset-y-0 w-1 bg-primary cursor-col-resize flex items-center justify-center"
                style={{ left: `${sliderValue}%` }}
              >
                <div className="w-8 h-8 bg-primary rounded-full shadow-lg flex items-center justify-center -ml-4">
                  <div className="w-0.5 h-4 bg-foreground" />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number.parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2020 (Baseline)</span>
              <span>2024 (Current)</span>
            </div>
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Emissions by Region */}
          <div className="glassmorphism border border-accent/20 rounded-lg p-6 card-hover">
            <h2 className="text-lg font-bold text-foreground mb-4">CO₂ Emissions by Region</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="region" stroke="rgba(255,255,255,0.3)" style={{ fontSize: "12px" }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(20,20,20,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <Bar dataKey="co2" fill="#F4A261" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="glassmorphism border border-primary/20 rounded-lg p-6 card-hover">
            <h2 className="text-lg font-bold text-foreground mb-4">Emission Trends vs Baseline</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyEmissions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(20,20,20,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#F4A261" name="Actual Emissions" />
                  <Line type="monotone" dataKey="baseline" stroke="#2D6A4F" strokeDasharray="5 5" name="Baseline" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Regional Details Table */}
        <div className="glassmorphism border border-secondary/20 rounded-lg p-6 card-hover">
          <h2 className="text-lg font-bold text-foreground mb-4">Regional Impact Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Region</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">CO₂ Emissions</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Deforestation</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Species Affected</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {regionalData.map((region, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4 text-sm text-foreground font-medium flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {region.region}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-accent">{region.co2} tons</td>
                    <td className="py-3 px-4 text-sm text-destructive">{region.deforestation} ha</td>
                    <td className="py-3 px-4 text-sm text-secondary">{region.species} species</td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        Analyze
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
