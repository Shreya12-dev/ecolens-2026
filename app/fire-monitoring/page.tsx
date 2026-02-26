"use client"

import { useState, useEffect } from 'react'
import { ArrowLeft, Flame, AlertTriangle, MapPin, TrendingUp, ThermometerSun, Droplets, Wind } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function FireMonitoringPage() {
    const [reportData, setReportData] = useState<any>(null)
    const [selectedRegion, setSelectedRegion] = useState<string>("Sundarbans")
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchReport = async (manual = false) => {
        if (manual) setIsRefreshing(true)
        else setLoading(true)

        try {
            // Add cache busting and a minimum delay for UX
            const [response] = await Promise.all([
                fetch(`/api/predict-fire?t=${new Date().getTime()}`, { method: 'GET' }),
                manual ? new Promise(resolve => setTimeout(resolve, 800)) : Promise.resolve()
            ])
            const data = await response.json()
            setReportData(data)
        } catch (error) {
            console.error('Error fetching fire report:', error)
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchReport()
    }, [])

    const currentRegionData = reportData?.regional_analysis?.find((r: any) => r.region_name === selectedRegion) || null

    // Transform monthly forecast for charts
    const forecastChartData = currentRegionData?.monthly_forecast?.map((item: any) => ({
        month: item.month,
        risk: item.risk_score,
        temp: item.weather?.temp || 0,
        rain: item.weather?.rain || 0,
        insight: item.insight
    })) || []

    const seasonalityInsight = currentRegionData?.monthly_forecast?.find((f: any) => f.risk_score === Math.max(...currentRegionData.monthly_forecast.map((x: any) => x.risk_score)))

    // Helper to get risk level color
    const getRiskColor = (risk: number) => {
        if (risk >= 75) return 'text-red-600'
        if (risk >= 50) return 'text-amber-600'
        return 'text-teal-700'
    }

    const getRiskBg = (risk: number) => {
        if (risk >= 75) return 'bg-red-50 border-red-200'
        if (risk >= 50) return 'bg-amber-50 border-amber-200'
        return 'bg-teal-50 border-teal-200'
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Professional Header */}
            <div className="relative bg-white border-b border-slate-200 sticky top-0 z-50 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]">
                    <img src="/forest-healthy.jpg" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative max-w-7xl mx-auto px-6 py-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="outline" size="icon" className="rounded-lg hover:bg-slate-50 border-slate-300">
                                    <ArrowLeft className="h-4 w-4 text-slate-700" />
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-teal-600 rounded-md">
                                        <Flame className="h-4 w-4 text-white" />
                                    </div>
                                    <h1 className="text-xl font-semibold text-slate-900">Fire Risk Assessment</h1>
                                </div>
                                <p className="text-sm text-slate-600 mt-0.5">Regional analysis powered by XGBoost predictive model</p>
                            </div>
                        </div>

                        <Button
                            onClick={() => fetchReport(true)}
                            disabled={isRefreshing}
                            className="bg-teal-700 hover:bg-teal-800 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                        >
                            {isRefreshing ? 'Updating...' : 'Run Updated Risk Assessment'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {loading && !reportData ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-3">
                        <div className="w-12 h-12 border-3 border-slate-200 border-t-teal-700 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-600">Loading assessment data...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Region Context Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-slate-600" />
                                <span className="font-semibold text-slate-900 text-lg">{selectedRegion}</span>
                                <span className={`px-3 py-1 rounded-md text-xs font-medium border ${
                                    currentRegionData?.status === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' : 
                                    currentRegionData?.status === 'CAUTION' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-teal-50 text-teal-700 border-teal-200'
                                }`}>
                                    {currentRegionData?.status || 'STABLE'}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Data Source:</span>
                                    <span className={`font-medium px-2.5 py-1 rounded-md ${
                                        currentRegionData?.current_weather?.data_source === 'LIVE_API' 
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}>
                                        {currentRegionData?.current_weather?.data_source === 'LIVE_API' ? 'Live API' : 'Estimated'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Updated:</span>
                                    <span className="font-medium text-slate-700">
                                        {reportData?.generated_at ? new Date(reportData.generated_at).toLocaleString('en-US', { 
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                        }) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Primary Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* PRIMARY: Fire Risk Index */}
                            <Card className={`p-6 border shadow-sm ${getRiskBg(currentRegionData?.current_risk_index || 0)}`}>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-slate-600" />
                                        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Fire Risk Index</p>
                                    </div>
                                    <div className={`text-4xl font-semibold ${getRiskColor(currentRegionData?.current_risk_index || 0)}`}>
                                        {currentRegionData?.current_risk_index?.toFixed(1) || '0.0'}
                                    </div>
                                    <p className="text-xs text-slate-500">Scale: 0-100</p>
                                </div>
                            </Card>

                            {/* SECONDARY: Temperature */}
                            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <ThermometerSun className="h-4 w-4 text-slate-600" />
                                        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Temperature</p>
                                    </div>
                                    <div className="text-3xl font-semibold text-slate-900">
                                        {currentRegionData?.current_weather?.temp?.toFixed(1) || '0.0'}°C
                                    </div>
                                </div>
                            </Card>

                            {/* SECONDARY: Humidity */}
                            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Droplets className="h-4 w-4 text-slate-600" />
                                        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Humidity</p>
                                    </div>
                                    <div className="text-3xl font-semibold text-slate-900">
                                        {currentRegionData?.current_weather?.humidity?.toFixed(0) || '0'}%
                                    </div>
                                </div>
                            </Card>

                            {/* SECONDARY: Wind Speed */}
                            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Wind className="h-4 w-4 text-slate-600" />
                                        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Wind Speed</p>
                                    </div>
                                    <div className="text-3xl font-semibold text-slate-900">
                                        {currentRegionData?.current_weather?.wind_speed?.toFixed(1) || '0.0'} m/s
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Analysis Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Charts */}
                            <div className="lg:col-span-2 space-y-6">
                                <Tabs defaultValue="forecast" className="space-y-4">
                                    <TabsList className="bg-white border border-slate-200 p-1 h-auto">
                                        <TabsTrigger 
                                            value="forecast" 
                                            className="px-4 py-2 data-[state=active]:bg-teal-700 data-[state=active]:text-white text-sm font-medium"
                                        >
                                            Seasonal Risk
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="weather" 
                                            className="px-4 py-2 data-[state=active]:bg-teal-700 data-[state=active]:text-white text-sm font-medium"
                                        >
                                            Weather Patterns
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="forecast">
                                        <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                                            <div className="mb-4">
                                                <h3 className="text-base font-semibold text-slate-900 mb-1">12-Month Fire Risk Projection</h3>
                                                <p className="text-xs text-slate-500">Model predictions based on historical trends and current conditions</p>
                                            </div>
                                            <div className="h-[320px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={forecastChartData}>
                                                        <defs>
                                                            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.2} />
                                                                <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                        <XAxis 
                                                            dataKey="month" 
                                                            stroke="#64748b" 
                                                            fontSize={12} 
                                                            axisLine={{ stroke: '#cbd5e1' }}
                                                            tickLine={false}
                                                            dy={8}
                                                        />
                                                        <YAxis 
                                                            stroke="#64748b" 
                                                            fontSize={12} 
                                                            axisLine={{ stroke: '#cbd5e1' }}
                                                            tickLine={false}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{ 
                                                                backgroundColor: '#fff', 
                                                                border: '1px solid #cbd5e1', 
                                                                borderRadius: '8px', 
                                                                fontSize: '12px',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                            }}
                                                        />
                                                        <Area 
                                                            type="monotone" 
                                                            dataKey="risk" 
                                                            name="Risk Index" 
                                                            stroke="#0f766e" 
                                                            strokeWidth={2.5} 
                                                            fillOpacity={1} 
                                                            fill="url(#riskGradient)" 
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="weather">
                                        <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-base font-semibold text-slate-900 mb-1">Weather Conditions Forecast</h3>
                                                    <p className="text-xs text-slate-500">Temperature and rainfall patterns over 12 months</p>
                                                </div>
                                                <div className="flex gap-4 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-0.5 bg-orange-500" />
                                                        <span className="text-slate-600">Temp (°C)</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-0.5 bg-blue-500" />
                                                        <span className="text-slate-600">Rain (mm)</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-[320px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={forecastChartData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                        <XAxis 
                                                            dataKey="month" 
                                                            stroke="#64748b" 
                                                            fontSize={12} 
                                                            axisLine={{ stroke: '#cbd5e1' }}
                                                            tickLine={false}
                                                            dy={8}
                                                        />
                                                        <YAxis 
                                                            yAxisId="left" 
                                                            stroke="#64748b" 
                                                            fontSize={12} 
                                                            axisLine={{ stroke: '#cbd5e1' }}
                                                            tickLine={false}
                                                        />
                                                        <YAxis 
                                                            yAxisId="right" 
                                                            orientation="right" 
                                                            stroke="#64748b" 
                                                            fontSize={12} 
                                                            axisLine={{ stroke: '#cbd5e1' }}
                                                            tickLine={false}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{ 
                                                                backgroundColor: '#fff', 
                                                                border: '1px solid #cbd5e1', 
                                                                borderRadius: '8px', 
                                                                fontSize: '12px',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                            }}
                                                        />
                                                        <Line 
                                                            yAxisId="left" 
                                                            type="monotone" 
                                                            dataKey="temp" 
                                                            name="Temperature" 
                                                            stroke="#f97316" 
                                                            strokeWidth={2.5} 
                                                            dot={{ r: 3, fill: '#f97316' }} 
                                                        />
                                                        <Line 
                                                            yAxisId="right" 
                                                            type="monotone" 
                                                            dataKey="rain" 
                                                            name="Rainfall" 
                                                            stroke="#3b82f6" 
                                                            strokeWidth={2.5} 
                                                            dot={{ r: 3, fill: '#3b82f6' }} 
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card>
                                    </TabsContent>
                                </Tabs>

                                {/* Additional Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                                        <h4 className="text-sm font-semibold text-slate-900 mb-5 border-b border-slate-100 pb-3">
                                            Historical Fire Density by Region
                                        </h4>
                                        <div className="space-y-3">
                                            {reportData?.regional_analysis?.map((region: any) => (
                                                <div key={region.region_name} className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-700">{region.region_name}</span>
                                                    <div className="flex items-center gap-3 flex-1 justify-end">
                                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-teal-600" 
                                                                style={{ width: `${(region.historical_fire_density / 100) * 100}%` }} 
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-600 min-w-[35px]">
                                                            {region.historical_fire_density}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>

                                    <Card className="p-6 bg-slate-900 border border-slate-800 shadow-sm text-white">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-amber-600/20 rounded-md">
                                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                                </div>
                                                <h4 className="text-base font-semibold">Seasonal Analysis</h4>
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed">
                                                Historical fire activity indicates elevated risk during the <span className="text-amber-400 font-medium">{seasonalityInsight?.month}</span> transition period, with projected risk index reaching <span className="text-amber-400 font-medium">{seasonalityInsight?.risk_score}%</span>. Atmospheric conditions suggest heightened monitoring requirements for this timeframe.
                                            </p>
                                            <div className="pt-2">
                                                <div className="text-xs text-slate-400 font-medium mb-3">Model Interpretation</div>
                                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-sm text-slate-200 leading-relaxed">
                                                    {currentRegionData?.monthly_forecast[0].insight}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            {/* Sidebar Stats */}
                            <div className="space-y-6">
                                <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                                        Regional Risk Profiles
                                    </h4>
                                    <div className="space-y-3">
                                        {reportData?.regional_analysis?.map((region: any) => (
                                            <button
                                                key={region.region_name}
                                                onClick={() => setSelectedRegion(region.region_name)}
                                                className={`w-full text-left p-3 rounded-lg transition-all border ${
                                                    selectedRegion === region.region_name 
                                                        ? 'bg-teal-700 text-white border-teal-700 shadow-sm' 
                                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm">{region.region_name}</span>
                                                    <span className={`text-xs font-semibold ${
                                                        selectedRegion === region.region_name 
                                                            ? 'text-amber-300' 
                                                            : 'text-teal-700'
                                                    }`}>
                                                        {region.current_risk_index}%
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </Card>

                                <Card className="p-6 bg-teal-700 border-none shadow-sm text-white">
                                    <h4 className="text-xs text-teal-100 font-semibold uppercase tracking-wide mb-5">
                                        Atmospheric Conditions
                                    </h4>
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/10 rounded-md">
                                                <Wind className="h-5 w-5 text-teal-50" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-teal-100 font-medium mb-0.5">Wind Speed</p>
                                                <p className="text-lg font-semibold">{currentRegionData?.current_weather?.wind_speed} m/s</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/10 rounded-md">
                                                <Droplets className="h-5 w-5 text-teal-50" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-teal-100 font-medium mb-0.5">Humidity</p>
                                                <p className="text-lg font-semibold">{currentRegionData?.current_weather?.humidity}%</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-teal-200/70 pt-2">
                                            Data optimized for tropical forest canopies
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
