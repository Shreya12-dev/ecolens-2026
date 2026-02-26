"use client"
import Link from "next/link"
import { TrendingUp, Leaf, AlertCircle, Wind } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const monthlyData = [
    { month: "Jan", aqi: 120 },
    { month: "Feb", aqi: 135 },
    { month: "Mar", aqi: 180 },
    { month: "Apr", aqi: 210 },
    { month: "May", aqi: 245 },
    { month: "Jun", aqi: 164 },
]

export default function PollutionTrackerCard() {
    return (
        <Card className="glassmorphism card-hover border-white/10 col-span-full lg:col-span-1 overflow-hidden flex flex-col h-[520px] shadow-lg">
            <CardHeader className="pb-2 bg-gradient-to-br from-cyan-500/10 to-transparent">
                <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                            <Wind className="w-4 h-4 text-cyan-500" />
                        </div>
                        <span className="font-black tracking-tight uppercase text-xs text-cyan-400">Pollution Impact Tracker 🇮🇳</span>
                    </div>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        Live Data
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-4 flex-1 flex flex-col">
                {/* AQI Display */}
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest leading-none mb-2">West Bengal - Sundarbans</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-cyan-300">156</span>
                        <span className="text-sm text-cyan-400">AQI</span>
                        <span className="ml-auto px-2.5 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] rounded-full font-black border border-yellow-500/20">
                            Moderate
                        </span>
                    </div>
                </div>

                {/* Impact Summary */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-sm text-cyan-300">🌿 Vegetation Health</span>
                        <span className="font-black text-emerald-400">72%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-sm text-cyan-300">🐅 Wildlife Stress</span>
                        <span className="font-black text-orange-400">Moderate</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-sm text-cyan-300">🔥 Fire Risk</span>
                        <span className="font-black text-yellow-400">Medium</span>
                    </div>
                </div>

                {/* Trend Chart */}
                <div className="pt-2 flex-1">
                    <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-3 px-1">6-Month AQI Trend</p>
                    <div className="h-20 -mx-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" style={{ fontSize: "10px" }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: '10px' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Area type="monotone" dataKey="aqi" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorAqi)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <Link href="/pollution-tracker" className="block pt-1 mt-auto">
                    <Button variant="outline" size="sm" className="w-full bg-transparent hover:bg-cyan-500/10 border-cyan-500/20 text-[10px] h-10 font-black uppercase tracking-widest text-cyan-300 rounded-[1.2rem]">
                        Access Diagnostic Report
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
