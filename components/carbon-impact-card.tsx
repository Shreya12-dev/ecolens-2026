"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, Wind, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function CarbonImpactCard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/carbon-emissions')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching pollution data:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card className="bg-white card-hover border-zinc-100 col-span-full lg:col-span-1 overflow-hidden flex flex-col h-full rounded-3xl shadow-lg items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </Card>
    )
  }

  // Use AQI for the primary metric
  const aqiValue = data?.aqi?.value || 0
  const aqiLevel = data?.aqi?.level || 'Moderate'

  // Use PM2.5 for specific pollutant metric
  const pmValue = (data?.pollutants?.pm25 || 0).toFixed(1)

  const monthlyData = [
    { month: "Jan", aqi: 45 },
    { month: "Feb", aqi: 52 },
    { month: "Mar", aqi: 68 },
    { month: "Apr", aqi: 85 },
    { month: "May", aqi: 72 },
    { month: "Jun", aqi: aqiValue },
  ]

  return (
    <Card className="bg-white card-hover border-zinc-100 col-span-full lg:col-span-1 overflow-hidden flex flex-col h-full rounded-3xl shadow-lg">
      <CardHeader className="pb-2 pt-6 px-6 flex-shrink-0">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Wind className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="font-bold text-zinc-900 leading-tight">Pollution Impact Tracker</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-2 flex-1 flex flex-col justify-between min-h-0 overflow-auto">
        <div className="space-y-6">
          {/* AQI Index */}
          <div>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1 block">Current AQI Index</span>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-zinc-900">{aqiValue}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${aqiValue > 100 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {aqiLevel}
                </span>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
            </div>
          </div>

          {/* PM2.5 Concentration */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-zinc-500 font-medium">PM2.5 Concentration</span>
            <span className="text-lg font-black text-rose-500">{pmValue} µg/m³</span>
          </div>

          {/* Location Map/Image */}
          <div className="h-28 w-full rounded-2xl overflow-hidden border border-zinc-100 shadow-inner">
            <img src="/satellite-deforestation-area.jpg" alt="Pollution heatmap" className="w-full h-full object-cover" />
          </div>

          {/* Impact Status */}
          <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-600">Health Recommendation</span>
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase">Good to go</span>
          </div>
        </div>

        {/* AQI History Chart */}
        <div className="mt-6 w-full h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorAqiLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="aqi" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAqiLight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <Link href="/pollution-tracker" className="block w-full mt-6">
          <Button variant="outline" className="w-full bg-green-700 border-green-800 hover:bg-green-800 text-white font-bold text-xs rounded-2xl h-11">
            View Report
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
