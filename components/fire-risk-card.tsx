"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Wind, Droplets, Thermometer, Loader2, Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function FireRiskCard() {
  const [data, setData] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Current environmental data for Sundarbans
    const forestParams = {
      lat: 22.0,
      lon: 89.0,
      tp: 0.0005,
      wind_speed: 12.5,
      temp: 32
    }

    Promise.all([
      fetch('/api/predict-fire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forestParams)
      }).then(res => res.json()),
      fetch('/api/predict-fire').then(res => res.json())
    ])
      .then(([prediction, reportData]) => {
        setData(prediction)
        setReport(reportData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Fire prediction error:', err)
        setError(err.message)
        setLoading(false)
        setData({
          risk_score: 62.5,
          status: "CAUTION",
          weather: { temp: 32, humidity: 65, wind: 12.5 },
          forecast: [
            { day: "Mon", risk: 45 }, { day: "Tue", risk: 55 },
            { day: "Wed", risk: 62 }, { day: "Thu", risk: 58 },
            { day: "Fri", risk: 70 }, { day: "Sat", risk: 75 },
            { day: "Sun", risk: 68 }
          ]
        })
      })
  }, [])

  if (loading) {
    return (
      <Card className="bg-white card-hover border-zinc-100 col-span-full lg:col-span-1 overflow-hidden flex flex-col h-full rounded-3xl shadow-lg items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </Card>
    )
  }

  const risk = data?.risk_score || 0
  const status = data?.status || "STABLE"
  const forecast = data?.forecast || []
  const weather = data?.weather || { temp: 32, humidity: 65, wind: 12.5 }

  const getStatusColor = () => {
    if (status === "CRITICAL") return "bg-rose-500 text-white"
    if (status === "CAUTION") return "bg-orange-500 text-white"
    return "bg-emerald-500 text-white"
  }

  return (
    <Card className="bg-white card-hover border-zinc-100 col-span-full lg:col-span-1 overflow-hidden flex flex-col h-full rounded-3xl shadow-lg">
      <CardHeader className="pb-2 pt-6 px-6 flex-shrink-0">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="font-bold text-zinc-900 leading-tight">Fire Risk Prediction</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-2 flex-1 flex flex-col items-center min-h-0 overflow-auto">
        {/* Circular Gauge */}
        <div className="relative w-32 h-32 mt-4 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#f4f4f5" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#f97316"
              strokeWidth="8"
              strokeDasharray={`${(risk / 100) * 283} 283`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-zinc-900">{Math.round(risk)}%</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-4">
          <span className={`px-4 py-1 text-xs font-bold rounded-full uppercase tracking-widest ${getStatusColor()}`}>
            {status}
          </span>
        </div>

        {/* Weather Parameters */}
        <div className="grid grid-cols-3 gap-4 w-full mt-8">
          <div className="flex flex-col items-center gap-1">
            <div className="p-2 bg-zinc-50 rounded-xl">
              <Thermometer className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Temp</span>
            <span className="text-xs font-black text-zinc-900">{weather.temp}°C</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="p-2 bg-zinc-50 rounded-xl">
              <Droplets className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Humidity</span>
            <span className="text-xs font-black text-zinc-900">{weather.humidity}%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="p-2 bg-zinc-50 rounded-xl">
              <Wind className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Wind</span>
            <span className="text-xs font-black text-zinc-900">{weather.wind} km/h</span>
          </div>
        </div>

        {/* 7-Day Chart */}
        <div className="mt-8 w-full h-20 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecast}>
              <Bar
                dataKey="risk"
                fill="#f97316"
                radius={[4, 4, 4, 4]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-2 w-full mt-6">
          <Link href="/fire-risk" className="block w-full">
            <Button className="w-full bg-green-700 hover:bg-green-800 text-white font-bold text-xs rounded-2xl h-11">
              Risk Analysis
            </Button>
          </Link>
          <Link href="/fire-monitoring" className="block w-full">
            <Button variant="outline" className="w-full bg-green-700 border-green-800 hover:bg-green-800 text-white font-bold text-xs rounded-2xl h-11">
              View Report
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
