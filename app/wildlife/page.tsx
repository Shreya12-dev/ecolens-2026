"use client"

import { useState } from "react"
import Header from "@/components/header"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Heart, MapPin, AlertCircle } from "lucide-react"

const species = [
  {
    id: 1,
    name: "Bengal Tiger",
    image: "/placeholder.svg?key=tiger",
    population: 2600,
    status: "Endangered",
    region: "India, Bangladesh",
    trend: -12,
    threat: "Habitat Loss",
    images: 3,
  },
  {
    id: 2,
    name: "African Elephant",
    image: "/placeholder.svg?key=elephant",
    population: 415000,
    status: "Vulnerable",
    region: "Central Africa",
    trend: -5,
    threat: "Poaching",
    images: 5,
  },
  {
    id: 3,
    name: "Amazon Jaguar",
    image: "/placeholder.svg?key=jaguar",
    population: 64000,
    status: "Near Threatened",
    region: "Amazon Basin",
    trend: -8,
    threat: "Deforestation",
    images: 4,
  },
  {
    id: 4,
    name: "Sumatran Orangutan",
    image: "/placeholder.svg?key=orangutan",
    population: 13846,
    status: "Critically Endangered",
    region: "Indonesia",
    trend: -15,
    threat: "Habitat Loss",
    images: 3,
  },
  {
    id: 5,
    name: "Giant Panda",
    image: "/placeholder.svg?key=panda",
    population: 1860,
    status: "Vulnerable",
    region: "China",
    trend: 3,
    threat: "Habitat Fragmentation",
    images: 4,
  },
  {
    id: 6,
    name: "Black Rhinoceros",
    image: "/placeholder.svg?key=rhino",
    population: 6487,
    status: "Critically Endangered",
    region: "East Africa",
    trend: -10,
    threat: "Poaching",
    images: 2,
  },
]

export default function WildlifePage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const statusColors = {
    "Critically Endangered": "bg-destructive/20 text-destructive",
    Endangered: "bg-accent/20 text-accent",
    Vulnerable: "bg-secondary/20 text-secondary",
    "Near Threatened": "bg-primary/20 text-primary",
  }

  const filteredSpecies = species.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === "all" || s.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Wildlife Gallery</h1>
          <p className="text-muted-foreground">
            Explore detected species and biodiversity hotspots across monitored regions
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search species..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "Critically Endangered", "Endangered", "Vulnerable", "Near Threatened"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {filter === "all" ? "All Species" : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Species Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecies.map((spec) => (
            <div key={spec.id} className="glassmorphism card-hover border border-primary/20 overflow-hidden rounded-lg">
              {/* Image */}
              <div className="relative h-48 bg-muted/20 overflow-hidden">
                <img src={spec.image || "/placeholder.svg"} alt={spec.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button className="p-2 bg-background/80 backdrop-blur rounded-lg hover:bg-background transition-colors">
                    <Heart className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <CardContent className="pt-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-foreground">{spec.name}</h3>
                  <div
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-2 ${statusColors[spec.status as keyof typeof statusColors]}`}
                  >
                    {spec.status}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted/20 p-2 rounded-lg">
                    <p className="text-xs text-muted-foreground">Population</p>
                    <p className="text-sm font-bold text-foreground">{spec.population.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/20 p-2 rounded-lg">
                    <p className="text-xs text-muted-foreground">Trend</p>
                    <p className={`text-sm font-bold ${spec.trend > 0 ? "text-primary" : "text-destructive"}`}>
                      {spec.trend > 0 ? "+" : ""}
                      {spec.trend}%
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{spec.region}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-3 h-3" />
                    <span>{spec.threat}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
                  View Profile & Images ({spec.images})
                </Button>
              </CardContent>
            </div>
          ))}
        </div>

        {filteredSpecies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No species found matching your filters</p>
          </div>
        )}
      </main>
    </div>
  )
}
