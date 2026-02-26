"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingDown, TrendingUp, Minus, Eye, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

export default function WildlifeCard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/biodiversity')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch biodiversity data')
        return res.json()
      })
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching biodiversity data:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card className="glassmorphism card-hover border-primary/20 col-span-full lg:col-span-1 h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Species Detection & Biodiversity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center flex-1">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading biodiversity data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="glassmorphism card-hover border-primary/20 col-span-full lg:col-span-1 h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Species Detection & Biodiversity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center flex-1">
          <p className="text-sm text-muted-foreground">Failed to load biodiversity data</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate population trend from declining vs increasing species
  const decliningCount = data.insights?.declining_count || 0
  const increasingCount = data.insights?.increasing_count || 0
  const totalCount = data.insights?.total_species || data.summary?.total_species || 1
  const trendPercentage = -1 // Fixed at -1% as per design

  // Use calculated metrics from API
  const totalSpecies = data.summary?.total_species || 0
  const endangeredCount = data.summary?.endangered_species || 0
  const endangeredRatio = data.summary?.endangered_ratio || 0
  const biodiversityIndex = data.summary?.biodiversity_index || 0

  console.log('[WILDLIFE CARD] API Response:', {
    totalSpecies,
    endangeredCount,
    endangeredRatio,
    biodiversityIndex,
    timestamp: data.summary?.timestamp
  })

  // Generate trend data for the chart (last 6 months)
  const trendData = [
    { month: 'JAN', value: 85 },
    { month: 'FEB', value: 88 },
    { month: 'MAR', value: 92 },
    { month: 'APR', value: 90 },
    { month: 'MAY', value: 87 },
    { month: 'JUN', value: 84 }
  ]

  const getTrendIcon = () => {
    if (trendPercentage > 5) return <TrendingUp className="w-4 h-4" />
    if (trendPercentage < -5) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = () => {
    if (trendPercentage > 5) return "text-green-500"
    if (trendPercentage < -5) return "text-destructive"
    return "text-yellow-500"
  }

  return (
    <Card className="bg-white card-hover border-zinc-100 col-span-full lg:col-span-1 overflow-hidden flex flex-col h-full rounded-3xl shadow-lg">
      <CardHeader className="pb-1 pt-5 px-6 flex-shrink-0">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Eye className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-zinc-900 leading-tight">Species Detection &</span>
              <span className="font-bold text-zinc-900 leading-tight">Biodiversity</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-4 pt-1 flex-1 flex flex-col min-h-0 overflow-auto">
        {/* Main Metrics */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-end">
            <span className="text-sm text-zinc-500 font-medium">Total Species Detected</span>
            <span className="text-4xl font-black text-zinc-900 leading-none">{data.summary.total_species}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-500 font-medium">Endangered Species</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-rose-600">
                {endangeredCount}
              </span>
              <Badge className="px-2 py-0.5 text-xs bg-rose-50 text-rose-600 border border-rose-200 rounded font-semibold hover:bg-rose-50">
                Critical
              </Badge>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-500 font-medium">Population Trend</span>
            <div className="flex items-center gap-1 text-rose-500 font-bold text-lg">
              <TrendingDown className="w-5 h-5" />
              <span>-1%</span>
            </div>
          </div>
        </div>

        {/* Area Chart with Month Labels */}
        <div className="mt-2.5 mb-2">
          <ResponsiveContainer width="100%" height={90}>
            <AreaChart data={trendData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
                dy={5}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#colorValue)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Biodiversity Index */}
        <div className="space-y-1.5 mt-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-500 font-medium">Biodiversity Index</span>
            <span className="text-lg font-black text-emerald-600">
              {biodiversityIndex.toFixed(0)}/100
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              style={{ width: `${Math.min(biodiversityIndex, 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold hover:bg-emerald-50">
              Excellent
            </Badge>
            <span className="text-xs text-zinc-500 font-medium">
              {endangeredRatio.toFixed(1)}% endangered
            </span>
          </div>
        </div>

        <Link href="/biodiversity/report" className="block w-full mt-3">
          <Button className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold text-sm rounded-lg h-9 shadow-sm">
            View Full Report
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
