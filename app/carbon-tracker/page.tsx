"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Wind, AlertTriangle, Activity, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export default function CarbonTrackerPage() {
    const [aqiData, setAqiData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/carbon-emissions?lat=22.0&lon=89.0')
            .then(res => res.json())
            .then(data => {
                setAqiData(data)
                setLoading(false)
            })
            .catch(err => console.error(err))
    }, [])

    if (loading || !aqiData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading air quality data...</p>
                </div>
            </div>
        )
    }

    const getAQIColor = (level: string) => {
        const colors: Record<string, string> = {
            'Good': 'bg-green-500',
            'Moderate': 'bg-yellow-500',
            'Unhealthy for Sensitive Groups': 'bg-orange-500',
            'Unhealthy': 'bg-red-500',
            'Very Unhealthy': 'bg-purple-500',
            'Hazardous': 'bg-maroon-700'
        }
        return colors[level] || 'bg-gray-500'
    }

    const pollutants = [
        { name: 'PM2.5', value: aqiData.pollutants.pm25, unit: 'μg/m³', color: 'text-red-500', max: 100 },
        { name: 'PM10', value: aqiData.pollutants.pm10, unit: 'μg/m³', color: 'text-orange-500', max: 150 },
        { name: 'CO', value: aqiData.pollutants.co, unit: 'ppm', color: 'text-yellow-500', max: 10 },
        { name: 'NO₂', value: aqiData.pollutants.no2, unit: 'ppb', color: 'text-blue-500', max: 50 },
        { name: 'SO₂', value: aqiData.pollutants.so2, unit: 'ppb', color: 'text-purple-500', max: 50 },
        { name: 'O₃', value: aqiData.pollutants.o3, unit: 'ppb', color: 'text-teal-500', max: 100 }
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="relative border-b border-border bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05]">
                    <img src="/forest-healthy.jpg" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Wind className="h-8 w-8 text-cyan-500" />
                                Carbon Emissions & Air Quality
                            </h1>
                            <p className="text-muted-foreground">Real-time Environmental Monitoring via OpenAQI</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Main AQI Display */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8"
                >
                    <Card className={`p-8 border-4 ${getAQIColor(aqiData.aqi.level).replace('bg-', 'border-')}/30`}>
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-2">{aqiData.location.city}</div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 100 }}
                                className={`inline-flex items-center justify-center w-48 h-48 rounded-full ${getAQIColor(aqiData.aqi.level)} mb-4`}
                            >
                                <div className="text-center">
                                    <div className="text-6xl font-bold text-white">{aqiData.aqi.value}</div>
                                    <div className="text-xl text-white/90">AQI</div>
                                </div>
                            </motion.div>
                            <h2 className="text-3xl font-bold mb-2">{aqiData.aqi.level}</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">{aqiData.health_impact}</p>
                            <div className="mt-4 text-xs text-muted-foreground">
                                Last updated: {new Date(aqiData.timestamp).toLocaleString()}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Pollutants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {pollutants.map((pollutant, idx) => (
                        <motion.div
                            key={pollutant.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + idx * 0.05 }}
                        >
                            <Card className="p-6 glassmorphism">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className={`text-2xl font-bold ${pollutant.color}`}>{pollutant.name}</h3>
                                        <p className="text-sm text-muted-foreground">Concentration</p>
                                    </div>
                                    <Activity className={`h-6 w-6 ${pollutant.color}`} />
                                </div>
                                <div className="text-3xl font-bold mb-2">
                                    {pollutant.value.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">{pollutant.unit}</span>
                                </div>
                                <Progress value={(pollutant.value / pollutant.max) * 100} className="h-2 mb-2" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>0</span>
                                    <span>{pollutant.max} {pollutant.unit}</span>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Recommendations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="p-6 glassmorphism border-l-4 border-l-primary">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-bold mb-3">Health Recommendations</h3>
                                <ul className="space-y-2">
                                    {aqiData.recommendations.map((rec: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                            <span className="text-sm">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Impact on Wildlife */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8"
                >
                    <Card className="p-6 glassmorphism">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Environmental Impact Analysis
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <h4 className="font-semibold mb-2 text-sm">🐬 Aquatic Ecosystem</h4>
                                <p className="text-sm text-muted-foreground">
                                    Current AQI levels suggest {aqiData.aqi.value > 100 ? 'moderate' : 'minimal'} impact on water quality.
                                    Dolphin populations may experience {aqiData.aqi.value > 100 ? '8-12% reduction' : 'normal behavior'} in surface activity.
                                </p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <h4 className="font-semibold mb-2 text-sm">🐅 Terrestrial Wildlife</h4>
                                <p className="text-sm text-muted-foreground">
                                    Air quality is {aqiData.aqi.level.toLowerCase()} for wildlife.
                                    {aqiData.aqi.value > 150 ? ' Reduced hunting activity and increased respiratory stress possible.' : ' Normal activity patterns expected.'}
                                </p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <h4 className="font-semibold mb-2 text-sm">🌿 Vegetation Health</h4>
                                <p className="text-sm text-muted-foreground">
                                    Mangrove forests showing {aqiData.aqi.value < 100 ? 'good resilience' : 'moderate stress'} under
                                    current pollution levels. PM2.5 at {aqiData.pollutants.pm25.toFixed(1)} μg/m³.
                                </p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <h4 className="font-semibold mb-2 text-sm">🔥 Fire Risk Correlation</h4>
                                <p className="text-sm text-muted-foreground">
                                    {aqiData.aqi.value > 100 ? 'Elevated' : 'Normal'} pollution levels {aqiData.aqi.value > 100 ? 'may indicate' : 'suggest no'} recent fire activity or agricultural burning in the region.
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
