"use client"
import Header from "@/components/header"
import WildlifeCard from "@/components/wildlife-card"
import FireRiskCard from "@/components/fire-risk-card"
import PollutionImpactCard from "@/components/carbon-impact-card"
import ForecastingCard from "@/components/forecasting-card"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-zinc-900">
      <Header />

      {/* Main content */}
      <main className="px-4 md:px-12 py-12 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] flex flex-col">
        {/* 4-Column Grid Dashboard - The Core Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 flex-1 auto-rows-fr">
          <WildlifeCard />
          <FireRiskCard />
          <PollutionImpactCard />
          <ForecastingCard />
        </div>

      </main>

      {/* Redesigned Footer with Deep Forest Background - Attached to Edge */}
      <footer
        className="relative bg-cover bg-center py-6 border-t border-zinc-100 overflow-hidden shadow-2xl w-full"
        style={{ backgroundImage: "url('/dashboard-bg-refined.jpg')" }}
      >
        {/* Subtle dark tint for visibility */}
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1600px] mx-auto">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-black tracking-tighter text-white uppercase">EcoLens</span>
            <span className="text-[10px] text-emerald-100/60 font-medium tracking-wide">Pioneering intelligence.</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex gap-6">
              {["System", "Privacy", "Terms"].map((item) => (
                <a key={item} href="#" className="text-[10px] font-black text-white/70 hover:text-white transition-colors uppercase tracking-[0.2em]">{item}</a>
              ))}
            </div>
            <div className="h-8 w-px bg-white/10 hidden md:block" />
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest leading-none">Powered by</span>
              <span className="text-sm font-black text-white">EcoLens AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
