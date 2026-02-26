"use client";

import React from 'react';
import Header from "@/components/header";
import WildlifeForecastDashboard from "@/components/WildlifeForecastDashboard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WildlifeForecastingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc] text-[#1e293b]">
            <Header />

            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/biodiversity"
                            className="p-3 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-xl transition-all hover:scale-105"
                        >
                            <ArrowLeft className="h-6 w-6 text-emerald-600" />
                        </Link>
                        <div>
                            <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2">
                                Wildlife <span className="text-emerald-600">Intelligence</span>
                            </h1>
                            <p className="text-slate-500 font-medium">LSTM-driven population forecasting and ecological resilience modeling</p>
                        </div>
                    </div>

                    <div className="bg-white/80 border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-6 md:p-10 backdrop-blur-xl">
                        <WildlifeForecastDashboard />
                    </div>
                </div>
            </main>
        </div>
    );
}
