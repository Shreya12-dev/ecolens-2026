"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingDown, TrendingUp, AlertCircle, Zap, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function ForecastingCard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/population-forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ species: 'Royal Bengal Tiger' })
    })
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching forecast:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card className="bg-white card-hover border-zinc-100 col-span-full lg:col-span-1 overflow-hidden flex flex-col h-full rounded-3xl shadow-lg items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </Card>
    )
  }

  const chartData = data?.forecast || []
  const trend = data?.trend || 'stable'
  const isDeclining = trend === 'declining'
  const confidence = (data?.confidence || 0.85) * 100
  const riskScore = data?.risk_score || 0
  const category = data?.predicted_category || 'Stable'

  return (
    <Card className="bg-white card-hover border-zinc-100 col-span-full lg:col-span-1 overflow-hidden flex flex-col h-full rounded-3xl shadow-lg">
      <CardHeader className="pb-2 pt-6 px-6 flex-shrink-0">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-zinc-50 rounded-lg">
              <Zap className="w-5 h-5 text-zinc-900" />
            </div>
            <span className="font-bold text-zinc-900 leading-tight">Population Forecasts</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-2 flex-1 flex flex-col justify-between min-h-0 overflow-auto">
        <div className="space-y-6">
          <div>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest block mb-1">Featured Species</span>
            <span className="text-xl font-black text-zinc-900">Bengal Tiger</span>
          </div>

          {/* Alert Box */}
          <div className={`${isDeclining ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'} p-4 rounded-3xl border space-y-2 relative overflow-hidden`}>
            <div className="flex items-start gap-2">
              <div className={`p-1 bg-white rounded-full border ${isDeclining ? 'border-rose-200' : 'border-emerald-200'}`}>
                <AlertCircle className={`w-3 h-3 ${isDeclining ? 'text-rose-500' : 'text-emerald-500'}`} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-zinc-900 leading-tight">
                  {isDeclining ? `${(riskScore * 20).toFixed(0)}% decline expected` : 'Population stability predicted'}
                </p>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                  LSTM Model Confidence: {confidence.toFixed(1)}% ({category})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Teal Forecast Chart */}
        <div className="mt-8 w-full h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPopLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="predicted_population" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorPopLight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <Link href="/wildlife-forecasting" className="block w-full mt-6">
          <Button variant="outline" className="w-full bg-green-700 border-green-800 hover:bg-green-800 text-white font-bold text-xs rounded-2xl h-11">
            View Report
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
