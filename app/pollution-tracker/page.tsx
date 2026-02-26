"use client"

import { useState, useEffect } from 'react'
import { ArrowLeft, Wind, AlertTriangle, Activity, MapPin, RefreshCw, Layers, Building2, TreePine, Map, Cloud, CloudSun, Thermometer, Droplets, Gauge } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CATEGORIES = {
    states: [
        'West Bengal', 'Delhi', 'Maharashtra', 'Karnataka',
        'Tamil Nadu', 'Uttar Pradesh', 'Rajasthan', 'Gujarat'
    ],
    cities: [
        'Kolkata', 'New Delhi', 'Mumbai', 'Bengaluru',
        'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad',
        'Jaipur', 'Lucknow', 'Durgapur', 'Siliguri'
    ],
    forests: [
        'Sundarbans', 'Western Ghats', 'Himalayas', 'Corbett',
        'Kaziranga', 'Gir Forest', 'Kanha', 'Bandipur'
    ]
}

export default function PollutionTrackerPage() {
    const [selectedLocation, setSelectedLocation] = useState('Sundarbans')
    const [activeTab, setActiveTab] = useState('forests')
    const [aqiData, setAqiData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [sliderValue, setSliderValue] = useState(50)

    const fetchAQI = async (location: string) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/pollution-tracker?location=${encodeURIComponent(location)}`)
            const data = await response.json()
            setAqiData(data)
        } catch (error) {
            console.error('Error fetching AQI:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAQI(selectedLocation)
    }, [selectedLocation])

    const getImpactColor = (category: string) => {
        switch (category) {
            case 'states': return 'from-blue-500/20'
            case 'cities': return 'from-orange-500/20'
            case 'forests': return 'from-emerald-500/20'
            default: return 'from-primary/20'
        }
    }

    const getImpactIcon = (category: string) => {
        switch (category) {
            case 'states': return <Map className="h-6 w-6 text-blue-500" />
            case 'cities': return <Building2 className="h-6 w-6 text-orange-500" />
            case 'forests': return <TreePine className="h-6 w-6 text-emerald-500" />
            default: return <MapPin className="h-6 w-6 text-primary" />
        }
    }

    if (loading && !aqiData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Analyzing atmospheric data for {selectedLocation}...</p>
                </div>
            </div>
        )
    }

    const data = aqiData?.data
    const pollutants = data ? [
        { name: 'PM2.5', value: data.pollutants.pm25, unit: 'μg/m³', color: 'text-red-400', max: 100 },
        { name: 'PM10', value: data.pollutants.pm10, unit: 'μg/m³', color: 'text-orange-400', max: 150 },
        { name: 'NO₂', value: data.pollutants.no2, unit: 'ppb', color: 'text-blue-400', max: 50 },
        { name: 'SO₂', value: data.pollutants.so2, unit: 'ppb', color: 'text-purple-400', max: 50 },
        { name: 'O₃', value: data.pollutants.o3, unit: 'ppb', color: 'text-teal-400', max: 100 },
        { name: 'CO', value: data.pollutants.co, unit: 'ppm', color: 'text-yellow-400', max: 10 }
    ] : []

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="relative border-b border-slate-200 bg-slate-50 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]">
                    <img src="/forest-healthy.jpg" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3 text-slate-900">
                                    <div className="p-1.5 bg-teal-700 rounded-md">
                                        <Wind className="h-5 w-5 text-white" />
                                    </div>
                                    Air Quality Monitoring System
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">
                                    Environmental health assessment and atmospheric analysis
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchAQI(selectedLocation)}
                                className="text-xs h-9 border-slate-300"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh Data
                            </Button>
                            {aqiData?.cached && (
                                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border border-teal-200 text-xs">
                                    Cached
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="mt-8">
                        <Tabs defaultValue="forests" onValueChange={setActiveTab} className="w-full">
                            <TabsList className="bg-white border border-slate-200 p-1 h-auto">
                                <TabsTrigger value="states" className="px-6 py-2 data-[state=active]:bg-teal-700 data-[state=active]:text-white text-sm font-medium">
                                    <Map className="w-4 h-4 mr-2" /> States
                                </TabsTrigger>
                                <TabsTrigger value="cities" className="px-6 py-2 data-[state=active]:bg-teal-700 data-[state=active]:text-white text-sm font-medium">
                                    <Building2 className="w-4 h-4 mr-2" /> Cities
                                </TabsTrigger>
                                <TabsTrigger value="forests" className="px-6 py-2 data-[state=active]:bg-teal-700 data-[state=active]:text-white text-sm font-medium">
                                    <TreePine className="w-4 h-4 mr-2" /> Forests
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-6 flex flex-wrap gap-2">
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES[activeTab as keyof typeof CATEGORIES].map((loc) => (
                                        <Button
                                            key={loc}
                                            variant={selectedLocation === loc ? 'default' : 'outline'}
                                            className={`rounded-lg ${selectedLocation === loc
                                                ? 'bg-teal-700 hover:bg-teal-800 text-white'
                                                : 'bg-white border-slate-300 hover:bg-slate-50'
                                                }`}
                                            onClick={() => setSelectedLocation(loc)}
                                        >
                                            {loc}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                {!data ? (
                    <Card className="p-12 text-center glassmorphism border-white/10">
                        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Atmospheric Data Unavailable</h2>
                        <p className="text-zinc-400 mb-6">Unable to establish connection with environmental sensors in {selectedLocation}.</p>
                        <Button onClick={() => fetchAQI(selectedLocation)} className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                            Attempt Reconnection
                        </Button>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                            {/* AQI Master Display */}
                            <div className="lg:col-span-1">
                                <Card className="p-8 h-full bg-white border border-slate-200 shadow-sm">
                                    <div className="flex flex-col h-full items-center justify-center text-center">
                                        <div className="text-slate-500 text-xs font-medium mb-6 flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {selectedLocation}
                                        </div>

                                        <div
                                            className="w-40 h-40 rounded-full flex items-center justify-center border-2 relative mb-6"
                                            style={{
                                                borderColor: data.aqi_color
                                            }}
                                        >
                                            <div className="text-center">
                                                <div className="text-5xl font-semibold" style={{ color: data.aqi_color }}>
                                                    {data.aqi_value}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">AQI</div>
                                            </div>
                                        </div>

                                        <h2 className="text-xl font-semibold mb-3 text-slate-900">{data.aqi_category}</h2>
                                        <p className="text-sm text-slate-600 leading-relaxed max-w-xs">{data.health_impact}</p>

                                        <div className="mt-8 pt-6 border-t border-slate-200 w-full flex flex-col gap-2.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">Status</span>
                                                <span className="text-teal-700 font-medium">Normal</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">Station ID</span>
                                                <span className="text-slate-700 font-mono">#AQI-{Math.floor(Math.random() * 9000) + 1000}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Pollutants Breakdown */}
                            <div className="lg:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                    {pollutants.map((pollutant, idx) => (
                                        <div key={pollutant.name}>
                                            <Card className="p-5 bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-md bg-slate-50">
                                                            <Activity className="h-4 w-4 text-slate-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-slate-900">{pollutant.name}</h3>
                                                            <p className="text-xs text-slate-500">Concentration</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-lg font-semibold text-slate-900">{pollutant.value.toFixed(1)}</span>
                                                        <span className="text-xs ml-1 text-slate-500">{pollutant.unit}</span>
                                                    </div>
                                                </div>
                                                <Progress value={(pollutant.value / pollutant.max) * 100} className="h-1.5 bg-slate-100" />
                                                <div className="mt-3 flex justify-between text-xs text-slate-500">
                                                    <span>0</span>
                                                    <span>Limit: {pollutant.max}</span>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Impact Analysis Panels */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            {/* Environmental Impact Analysis */}
                            <div>
                                <Card className="p-8 h-full bg-white border border-slate-200 shadow-sm flex flex-col">
                                    <h3 className="text-base font-semibold mb-8 flex items-center gap-3 text-slate-900">
                                        <AlertTriangle className="h-5 w-5 text-slate-600" />
                                        Environmental Impact Assessment
                                    </h3>

                                    <div className="space-y-6 flex-1">
                                        {[
                                            { label: 'Vegetation Condition Index', value: data.environmental_impact.vegetation_health, icon: '🌿', getColor: (val: number) => val > 70 ? 'bg-red-600' : val > 50 ? 'bg-amber-500' : 'bg-teal-600', getStatus: (val: number) => val > 70 ? 'High' : val > 50 ? 'Elevated' : 'Low' },
                                            { label: 'Faunal Air Quality Exposure', value: data.environmental_impact.wildlife_stress === 'Low' ? 20 : data.environmental_impact.wildlife_stress === 'Moderate' ? 50 : data.environmental_impact.wildlife_stress === 'High' ? 80 : 100, icon: '🐅', getColor: (val: number) => val > 70 ? 'bg-red-600' : val > 50 ? 'bg-amber-500' : 'bg-teal-600', getStatus: (val: number) => val > 70 ? 'High' : val > 50 ? 'Moderate' : 'Low' },
                                            { label: 'Fire Susceptibility Indicator', value: data.environmental_impact.forest_fire_risk === 'Low' ? 15 : data.environmental_impact.forest_fire_risk === 'Medium' ? 45 : data.environmental_impact.forest_fire_risk === 'High' ? 75 : 95, icon: '🔥', getColor: (val: number) => val > 70 ? 'bg-red-600' : val > 50 ? 'bg-amber-500' : 'bg-teal-600', getStatus: (val: number) => val > 70 ? 'High' : val > 50 ? 'Elevated' : 'Low' },
                                            { label: 'Hydrological Stress Index', value: data.environmental_impact.water_quality_impact === 'Minimal' ? 10 : data.environmental_impact.water_quality_impact === 'Moderate' ? 40 : data.environmental_impact.water_quality_impact === 'Significant' ? 70 : 90, icon: '🐬', getColor: (val: number) => val > 70 ? 'bg-red-600' : val > 50 ? 'bg-amber-500' : 'bg-teal-600', getStatus: (val: number) => val > 70 ? 'High' : val > 50 ? 'Moderate' : 'Low' }
                                        ].map((stat, i) => (
                                            <div key={i} className="space-y-2.5">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="flex items-center gap-2 text-slate-700">
                                                        <span className="opacity-60 text-base">{stat.icon}</span>
                                                        <span className="font-medium">{stat.label}</span>
                                                    </span>
                                                    <span className="text-slate-900 font-medium">
                                                        Index: {(stat.value / 100).toFixed(2)} ({stat.getStatus(stat.value)})
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${stat.getColor(stat.value)} transition-all duration-500`}
                                                        style={{ width: `${stat.value}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>

                            {/* Satellite Impact Tracker */}
                            <div>
                                <Card className="p-8 h-full bg-white border border-slate-200 shadow-sm flex flex-col">
                                    <h2 className="text-base font-semibold mb-2 flex items-center gap-3 text-slate-900">
                                        <Layers className="w-5 h-5 text-slate-600" />
                                        Remote Sensing Analysis
                                    </h2>
                                    <p className="text-xs text-slate-500 mb-6">Temporal land cover comparison</p>

                                    <div className="relative flex-1 overflow-hidden rounded-lg bg-slate-900 border border-slate-300 max-h-[400px]">
                                        <div className="absolute inset-0 flex">
                                            <div className="flex-1 overflow-hidden">
                                                <img src="/forest-healthy.jpg" alt="Baseline" className="w-full h-full object-cover opacity-70" />
                                                <div className="absolute top-3 left-3 bg-teal-50 px-3 py-1.5 rounded-md text-xs font-medium text-teal-800 border border-teal-200">
                                                    Reference Period (2020)
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <img src="/deforestation-cleared.jpg" alt="Current" className="w-full h-full object-cover" />
                                                <div className="absolute top-3 right-3 bg-slate-50 px-3 py-1.5 rounded-md text-xs font-medium text-slate-800 border border-slate-300">
                                                    Current Observation
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className="absolute inset-y-0 w-0.5 bg-white cursor-col-resize flex items-center justify-center z-10"
                                            style={{ left: `${sliderValue}%` }}
                                        >
                                            <div className="w-7 h-7 bg-white border border-slate-300 rounded-full shadow-lg flex items-center justify-center -ml-3.5">
                                                <Activity className="h-3.5 w-3.5 text-slate-600" />
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={sliderValue}
                                            onChange={(e) => setSliderValue(Number.parseInt(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-20"
                                        />
                                    </div>
                                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-start gap-3">
                                            <Activity className="h-4 w-4 text-slate-600 mt-0.5" />
                                            <p className="text-xs text-slate-700 leading-relaxed">
                                                Remote sensing analysis indicates a 12% increase in built-up area since 2020 baseline.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Weather & Meteorological Report */}
                        <div className="mb-12">
                            <Card className="p-8 bg-white border border-slate-200 shadow-sm">
                                <h3 className="text-base font-semibold mb-8 flex items-center gap-3 text-slate-900">
                                    <CloudSun className="h-5 w-5 text-slate-600" />
                                    Meteorological Conditions
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    {[
                                        { label: 'Temperature', value: data.weather?.temp ? `${Number(data.weather.temp).toFixed(1)}°C` : 'N/A', icon: <Thermometer className="w-5 h-5 text-slate-600" /> },
                                        { label: 'Humidity', value: data.weather?.humidity ? `${Number(data.weather.humidity).toFixed(1)}%` : 'N/A', icon: <Droplets className="w-5 h-5 text-slate-600" /> },
                                        { label: 'Wind Speed', value: data.weather?.wind ? `${Number(data.weather.wind).toFixed(2)} m/s` : 'N/A', icon: <Wind className="w-5 h-5 text-slate-600" /> },
                                        { label: 'Pressure', value: data.weather?.pressure ? `${Number(data.weather.pressure).toFixed(0)} hPa` : 'N/A', icon: <Gauge className="w-5 h-5 text-slate-600" /> }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left">
                                            <div className="mb-3 p-2 rounded-md bg-slate-50">
                                                {stat.icon}
                                            </div>
                                            <div className="text-xs text-slate-500 mb-1.5">{stat.label}</div>
                                            <div className="text-xl font-semibold text-slate-900">{stat.value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                                    <div className="mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Meteorological parameters are updated from regional monitoring stations. Weather data is incorporated into environmental impact models for comprehensive atmospheric assessment.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
