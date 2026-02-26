"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Shield, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Slider } from '@/components/ui/slider'

const SPECIES = [
    'Royal Bengal Tiger',
    'Saltwater Crocodile',
    'Ganges River Dolphin',
    'Water Monitor Lizard',
    'Spotted Deer'
]

const SPECIES_INFO: Record<string, { emoji: string; status: string; color: string }> = {
    'Royal Bengal Tiger': { emoji: '🐅', status: 'Endangered', color: 'text-orange-500' },
    'Saltwater Crocodile': { emoji: '🐊', status: 'Vulnerable', color: 'text-green-500' },
    'Ganges River Dolphin': { emoji: '🐬', status: 'Critically Endangered', color: 'text-red-500' },
    'Water Monitor Lizard': { emoji: '🦎', status: 'Near Threatened', color: 'text-yellow-500' },
    'Spotted Deer': { emoji: '🦌', status: 'Least Concern', color: 'text-emerald-500' }
}

export default function ForecastingPage() {
    const [selectedSpecies, setSelectedSpecies] = useState('Royal Bengal Tiger')
    const [forecastYears, setForecastYears] = useState(10)
    const [forecast, setForecast] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const fetchForecast = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/population-forecast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    species: selectedSpecies
                })
            })
            const data = await response.json()
            setForecast(data)
        } catch (error) {
            console.error('Forecast error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchForecast()
    }, [selectedSpecies])

    const getTrendIcon = (trend: string) => {
        if (trend === 'declining') return <TrendingDown className="h-5 w-5 text-red-500" />
        if (trend === 'increasing') return <TrendingUp className="h-5 w-5 text-green-500" />
        return <Minus className="h-5 w-5 text-yellow-500" />
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            {/* Header */}
            <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="hover:bg-white/10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <BarChart3 className="h-8 w-8 text-emerald-500" />
                                Multivariate LSTM Forecasting
                            </h1>
                            <p className="text-slate-400">Deep Learning Species Population Projections for Sundarbans Habitat</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="p-6 bg-slate-900/50 border-white/10 backdrop-blur-md">
                            <label className="text-sm font-medium mb-3 block text-slate-400 uppercase tracking-widest">Select Species</label>
                            <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                                <SelectTrigger className="bg-slate-950 border-white/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/20 text-slate-50">
                                    {SPECIES.map(species => (
                                        <SelectItem key={species} value={species}>
                                            <span className="flex items-center gap-2">
                                                {SPECIES_INFO[species].emoji} {species}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="p-6 bg-slate-900/50 border-white/10 backdrop-blur-md">
                            <label className="text-sm font-medium mb-3 block text-slate-400 uppercase tracking-widest">Confidence: {forecast?.confidence ? (forecast.confidence * 100).toFixed(0) : '85'}%</label>
                            <div className="pt-4">
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-emerald-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(forecast?.confidence || 0.85) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2">Model R² Score based on 10-year historical training</p>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className={`p-6 bg-slate-900/50 backdrop-blur-md border-2 ${forecast?.trend === 'declining' ? 'border-red-500/50 bg-red-500/5' : forecast?.trend === 'increasing' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-yellow-500/50 bg-yellow-500/5'}`}>
                            <div className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-3">Predicted Risk Score</div>
                            {forecast && (
                                <div className="flex items-center gap-3">
                                    <span className={`text-4xl font-black ${(forecast.risk_score * 100) > 60 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {(forecast.risk_score * 100).toFixed(1)}%
                                    </span>
                                    <div className="text-xs text-slate-400 leading-tight">
                                        10-Year Risk<br />of Endangerment
                                    </div>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                </div>

                {/* Species Info Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
                    <Card className="p-8 bg-slate-900/50 border-white/10 backdrop-blur-xl border-2 border-emerald-500/20">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="text-8xl bg-slate-950 p-6 rounded-3xl shadow-2xl border border-white/5">{SPECIES_INFO[selectedSpecies].emoji}</div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-4xl font-black mb-2 text-emerald-500">{selectedSpecies}</h2>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Conservation Status</div>
                                        <div className={`text-xl font-black flex items-center gap-2 justify-center md:justify-start ${SPECIES_INFO[selectedSpecies].color}`}>
                                            <Shield className="w-5 h-5" />
                                            {SPECIES_INFO[selectedSpecies].status}
                                        </div>
                                    </div>
                                    {forecast && forecast.forecast && forecast.forecast.length > 0 && (
                                        <>
                                            <div>
                                                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Baseline Population</div>
                                                <div className="text-2xl font-black text-slate-100">{forecast.current_population}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">2034 Prediction</div>
                                                <div className="text-2xl font-black text-emerald-400">
                                                    {forecast.forecast[forecast.forecast.length - 1].predicted_population}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Forecast Trajectory</div>
                                                <div className="flex items-center gap-2 text-xl font-black capitalize justify-center md:justify-start">
                                                    {getTrendIcon(forecast.trend)}
                                                    <span className={forecast.trend === 'declining' ? 'text-red-500' : 'text-emerald-500'}>{forecast.trend}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Forecast Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <Card className="p-6 bg-slate-900/50 border-white/10 backdrop-blur-md h-full">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-emerald-500" />
                                Interactive Population Forecast (2025 - 2034)
                            </h3>
                            {forecast && (
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={forecast.forecast}>
                                            <defs>
                                                <linearGradient id="colorPopulation" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                            <XAxis
                                                dataKey="month"
                                                stroke="#94a3b8"
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                axisLine={{ stroke: '#334155' }}
                                            />
                                            <YAxis
                                                stroke="#94a3b8"
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                axisLine={{ stroke: '#334155' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    border: '1px solid #334155',
                                                    borderRadius: '8px',
                                                    color: '#fff'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="upper_bound"
                                                stroke="#10b981"
                                                fill="transparent"
                                                strokeWidth={1}
                                                strokeDasharray="5 5"
                                                name="Optimistic Range"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="predicted_population"
                                                stroke="#10b981"
                                                fill="url(#colorPopulation)"
                                                strokeWidth={4}
                                                name="LSTM Prediction"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="lower_bound"
                                                stroke="#ef4444"
                                                fill="transparent"
                                                strokeWidth={1}
                                                strokeDasharray="5 5"
                                                name="At-Risk Range"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                        <Card className="p-6 bg-slate-900/50 border-white/10 backdrop-blur-md h-full space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Model Insights
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Fidelity Check</p>
                                    <p className="text-sm">The LSTM-Hybrid model considers multivariate inputs: climate trends, forest cover loss, and human encroachment patterns.</p>
                                </div>

                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Key Drivers</p>
                                    <ul className="text-sm space-y-2 mt-2">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Habitat connectivity
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            Salinity level shifts
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            Illegal poaching risk
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                                    <p className="text-xs text-emerald-400 uppercase font-bold tracking-widest mb-1 font-black">Recommendation</p>
                                    <p className="text-sm text-emerald-200">
                                        {forecast?.risk_score > 0.4
                                            ? "Immediate establishment of mangrove buffer zones and increased SMART patrolling highly recommended."
                                            : "Continue existing community-based surveillance and reforestation efforts."}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
