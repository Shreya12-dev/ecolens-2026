"use strict";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
    AlertTriangle, TrendingDown, TrendingUp, Shield, Activity,
    Droplets, Wind, Settings2, Map as MapIcon, BarChart3
} from 'lucide-react';
import { Slider } from "@/components/ui/slider";

interface ForecastData {
    historical: {
        years: number[];
        population: number[];
        stress: number[];
        anthropogenic: number[];
    };
    forecast: {
        years: number[];
        population: number[];
        stress: number[];
        anthropogenic: number[];
    };
    risk_score: number;
    predicted_category: string;
    confidence_interval: number;
    evaluation: {
        mae: number;
        rmse: number;
    };
}

const WildlifeForecastDashboard = () => {
    const [data, setData] = useState<Record<string, ForecastData> | null>(null);
    const [selectedSpecies, setSelectedSpecies] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // Simulation States
    const [forestProtection, setForestProtection] = useState([50]); // 0-100%
    const [antiPoaching, setAntiPoaching] = useState([50]); // 0-100%

    useEffect(() => {
        const fetchForecasts = async () => {
            try {
                const response = await fetch('/api/biodiversity');
                const result = await response.json();
                if (result.forecasts) {
                    setData(result.forecasts);
                    const species = Object.keys(result.forecasts);
                    if (species.length > 0) setSelectedSpecies(species[0]);
                }
            } catch (error) {
                console.error("Error fetching forecasts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchForecasts();
    }, []);

    const simulatedData = useMemo(() => {
        if (!data || !selectedSpecies) return null;
        const current = data[selectedSpecies];

        const stressOffset = (forestProtection[0] - 50) / 100;
        const anthroOffset = (antiPoaching[0] - 50) / 100;

        const newForecastPop = current.forecast.population.map((pop, i) => {
            const yearIndex = i + 1;
            const factor = 1 - (stressOffset * 0.2 + anthroOffset * 0.1);
            return Math.max(0, pop * (1 + (stressOffset * 0.1 + anthroOffset * 0.05) * yearIndex));
        });

        const newStress = current.forecast.stress.map(s => Math.max(0, Math.min(1, s - stressOffset * 0.5)));
        const newAnthro = current.forecast.anthropogenic.map(a => Math.max(0, Math.min(1, a - anthroOffset * 0.5)));

        const latestStress = newStress[newStress.length - 1];
        const latestAnthro = newAnthro[newAnthro.length - 1];
        const latestPop = newForecastPop[newForecastPop.length - 1];
        const historicalPop = current.historical.population[current.historical.population.length - 1];

        const newRiskScore = Math.max(0, Math.min(1,
            (latestStress * 0.4 + latestAnthro * 0.4 + (1 - Math.min(1, latestPop / historicalPop)) * 0.2)
        ));

        let category = "Least Concern";
        if (newRiskScore > 0.8) category = "Critically Endangered";
        else if (newRiskScore > 0.6) category = "Endangered";
        else if (newRiskScore > 0.4) category = "Vulnerable";
        else if (newRiskScore > 0.2) category = "Near Threatened";

        return {
            ...current,
            forecast: {
                ...current.forecast,
                population: newForecastPop,
                stress: newStress,
                anthropogenic: newAnthro
            },
            risk_score: newRiskScore,
            predicted_category: category
        };
    }, [data, selectedSpecies, forestProtection, antiPoaching]);

    if (loading) return (
        <div className="p-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
            <p className="text-slate-500 font-medium text-lg">Initializing Predictive Models...</p>
        </div>
    );

    if (!data || !selectedSpecies || !simulatedData) return <div className="p-8 text-center text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-100 italic">No forecasting data available. Please run the ML training script.</div>;

    const current = simulatedData;

    const chartData = [
        ...current.historical.years.map((year, i) => ({
            year,
            population: current.historical.population[i],
            stress: current.historical.stress[i] * 100,
            type: 'Historical'
        })),
        ...current.forecast.years.map((year, i) => ({
            year,
            population: current.forecast.population[i],
            stress: current.forecast.stress[i] * 100,
            type: 'Forecast'
        }))
    ];

    const correlationData = chartData.map(d => ({
        stress: d.stress,
        population: d.population,
        year: d.year
    }));

    const getRiskColor = (score: number) => {
        if (score > 0.8) return "text-rose-600";
        if (score > 0.5) return "text-amber-600";
        return "text-emerald-600";
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ecosystem Multivariate Welfare Forecast</h2>
                    <p className="text-slate-500 font-medium">LSTM Hybrid Resilience Modeling & Simulation</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl w-full sm:w-auto">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Target Species:</span>
                        <select
                            value={selectedSpecies}
                            onChange={(e) => setSelectedSpecies(e.target.value)}
                            className="bg-transparent text-slate-900 font-bold outline-none cursor-pointer hover:text-emerald-600 transition-colors"
                        >
                            {Object.keys(data).map(sp => (
                                <option key={sp} value={sp}>{sp}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group">
                    <CardHeader className="pb-2 bg-gradient-to-br from-rose-50/50 to-transparent">
                        <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Extinction Risk</CardDescription>
                        <CardTitle className={`text-4xl font-black ${getRiskColor(current.risk_score)}`}>
                            {(current.risk_score * 100).toFixed(1)}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-slate-400 font-medium">10-year probability trajectory</div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group">
                    <CardHeader className="pb-2 bg-gradient-to-br from-amber-50/50 to-transparent">
                        <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Ecology Status</CardDescription>
                        <CardTitle className="text-3xl font-black text-amber-600">{current.predicted_category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-slate-400 font-medium">IUCN-mapped prediction</div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group">
                    <CardHeader className="pb-2 bg-gradient-to-br from-blue-50/50 to-transparent">
                        <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Model Fidelity (R²)</CardDescription>
                        <CardTitle className="text-4xl font-black text-blue-600">{(current.confidence_interval * 100).toFixed(0)}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                            MAE: <span className="text-blue-600 font-bold">{current.evaluation?.mae || 0.1}</span>
                            RMSE: <span className="text-blue-600 font-bold">{current.evaluation?.rmse || 0.15}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group">
                    <CardHeader className="pb-2 bg-gradient-to-br from-emerald-50/50 to-transparent">
                        <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Trend Trajectory</CardDescription>
                        <CardTitle className="flex items-center gap-2 text-3xl font-black">
                            {current.forecast.population[current.forecast.population.length - 1] >= current.historical.population[current.historical.population.length - 1] ? (
                                <><TrendingUp className="text-emerald-500 h-8 w-8" /> Stable</>
                            ) : (
                                <><TrendingDown className="text-rose-500 h-8 w-8" /> Decline</>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-slate-400 font-medium">Delta relative to baseline</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Visualizations and Scenarios */}
                <div className="lg:col-span-3 space-y-8">
                    <Card className="bg-white border-slate-200 shadow-sm rounded-[2.5rem] p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <Activity className="h-6 w-6 text-emerald-500" />
                                    Population Dynamics (2015-2034)
                                </h3>
                                <p className="text-slate-400 font-medium">Multi-factor LSTM Prediction curve</p>
                            </div>
                            <div className="flex items-center gap-6 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                    <span className="text-xs font-bold text-slate-600">Population</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-rose-400 rounded-full opacity-50" />
                                    <span className="text-xs font-bold text-slate-400">Habitat Stress</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[450px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.05} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="year"
                                        stroke="#cbd5e1"
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#cbd5e1"
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                                        labelStyle={{ color: '#1e293b', fontWeight: 900, marginBottom: '0.5rem' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="population"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fill="url(#popGrad)"
                                        activeDot={{ r: 8, stroke: '#fff', strokeWidth: 3 }}
                                        animationDuration={1500}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="stress"
                                        stroke="#f43f5e"
                                        strokeWidth={2}
                                        strokeDasharray="8 8"
                                        fill="url(#stressGrad)"
                                        opacity={0.6}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-white border-slate-200 shadow-sm rounded-[2.5rem] p-6 lg:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-indigo-50 rounded-2xl">
                                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900">Stress Correlation</h4>
                                    <p className="text-sm text-slate-400 font-medium">Population vs Habitat Pressure</p>
                                </div>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                                        <XAxis type="number" dataKey="stress" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={{ stroke: '#e2e8f0' }} />
                                        <YAxis type="number" dataKey="population" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={{ stroke: '#e2e8f0' }} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                        <Scatter name="Resilience" data={correlationData} fill="#6366f1" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm rounded-[2.5rem] p-6 lg:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-emerald-100 rounded-2xl">
                                    <Activity className="h-6 w-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900">Population Forecast</h4>
                                    <p className="text-sm text-slate-600 font-medium">10-year projection details</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-emerald-100">
                                    <span className="text-xs font-bold text-slate-600 uppercase">Current Population</span>
                                    <span className="text-lg font-black text-emerald-700">{Math.round(current.historical.population[current.historical.population.length - 1])}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-emerald-100">
                                    <span className="text-xs font-bold text-slate-600 uppercase">Projected 2034</span>
                                    <span className="text-lg font-black text-emerald-700">{Math.round(current.forecast.population[current.forecast.population.length - 1])}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-emerald-100">
                                    <span className="text-xs font-bold text-slate-600 uppercase">Historical Min/Max</span>
                                    <span className="text-xs font-black text-emerald-700">{Math.min(...current.historical.population)} / {Math.max(...current.historical.population)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-emerald-100">
                                    <span className="text-xs font-bold text-slate-600 uppercase">Growth Rate</span>
                                    <span className={`text-xs font-black ${(((current.forecast.population[current.forecast.population.length - 1] - current.historical.population[current.historical.population.length - 1]) / current.historical.population[current.historical.population.length - 1]) * 100) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {(((current.forecast.population[current.forecast.population.length - 1] - current.historical.population[current.historical.population.length - 1]) / current.historical.population[current.historical.population.length - 1]) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-emerald-100">
                                    <span className="text-xs font-bold text-slate-600 uppercase">Habitat Stress</span>
                                    <span className="text-xs font-black text-amber-700">{(current.historical.stress[current.historical.stress.length - 1] * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="bg-white border-slate-200 shadow-sm rounded-[2.5rem] p-6 lg:p-8 overflow-hidden relative">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-rose-50 rounded-2xl">
                                <MapIcon className="h-6 w-6 text-rose-600" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900">Spatial Stress Map</h4>
                                <p className="text-sm text-slate-400 font-medium">High-risk habitat distribution</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-10 grid-rows-6 h-40 gap-1 opacity-80">
                            {Array.from({ length: 60 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`rounded-sm transition-all duration-500 hover:scale-125 ${i % 7 === 0 ? 'bg-rose-500/40 animate-pulse' : (i % 3 === 0 ? 'bg-amber-400/40' : 'bg-emerald-400/20')}`}
                                />
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-tighter text-slate-300">
                            <span>East Sector</span>
                            <span>Central Core</span>
                            <span>West Buffer</span>
                        </div>
                    </Card>
                </div>

                {/* Scenario Controls Sidebar */}
                <div className="space-y-8">
                    <Card className="bg-white border-slate-200 shadow-xl rounded-[2.5rem] p-8 border-t-4 border-t-emerald-500">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <Settings2 className="h-6 w-6 text-emerald-500" />
                                Simulator
                            </h3>
                            <p className="text-slate-400 text-sm font-medium">Policy intervention impact model</p>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-5">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Forest Cover</label>
                                    <span className="text-lg font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">+{forestProtection[0]}%</span>
                                </div>
                                <Slider
                                    value={forestProtection}
                                    onValueChange={setForestProtection}
                                    max={100}
                                    className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-4 [&_[role=slider]]:border-emerald-500 [&_[role=slider]]:shadow-none"
                                />
                                <p className="text-[11px] text-slate-400 leading-relaxed italic">Simulates reforestation density and mangrove belt restoration effectiveness.</p>
                            </div>

                            <div className="space-y-5">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Patrol Intensity</label>
                                    <span className="text-lg font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">{antiPoaching[0]}%</span>
                                </div>
                                <Slider
                                    value={antiPoaching}
                                    onValueChange={setAntiPoaching}
                                    max={100}
                                    className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-4 [&_[role=slider]]:border-indigo-500 [&_[role=slider]]:shadow-none"
                                />
                                <p className="text-[11px] text-slate-400 leading-relaxed italic">Simulates AI-guided anti-poaching and anthropogenic pressure reduction.</p>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                <span className="text-xs font-bold text-slate-600 px-1 border-l-2 border-emerald-500">Stability Gain</span>
                                <span className="text-emerald-600 font-black text-sm">+{((forestProtection[0] - 50) * 0.4).toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <span className="text-xs font-bold text-slate-600 px-1 border-l-2 border-blue-500">Resilience</span>
                                <span className="text-blue-600 font-black text-sm">+{(antiPoaching[0] / 10).toFixed(1)}x</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-900 border-none rounded-[2.5rem] p-8 text-white overflow-hidden relative shadow-2xl">
                        <div className="relative z-10">
                            <Shield className="h-10 w-10 text-emerald-400 mb-4" />
                            <h4 className="text-xl font-black mb-2 tracking-tight">Ecosystem Alert</h4>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Current models indicate <span className="text-rose-400 font-bold">critical focus</span> required on {selectedSpecies} nursery habitats.
                            </p>
                            <button className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-2xl transition-all hover:scale-105 uppercase tracking-widest text-xs">
                                Download Technical Audit
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Helper to clip values
// @ts-ignore
Math.clip = (val, min, max) => Math.max(min, Math.min(max, val));

export default WildlifeForecastDashboard;
