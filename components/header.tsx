"use client"
import Link from "next/link"
import { Bell, Search, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header
      className="relative bg-cover bg-center sticky top-0 z-50 border-b border-white/10 shadow-2xl overflow-hidden"
      style={{ backgroundImage: "url('/dashboard-bg-refined.jpg')" }}
    >
      {/* Dark tint overlay for better text contrast instead of light white */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative px-8 py-14 flex items-center justify-between z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="p-2 bg-emerald-400 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.5)]">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">EcoLens</h1>
            <p className="text-[10px] text-emerald-100/70 font-medium tracking-wider mt-0.5">The Intelligent Eye for a Sustainable Planet</p>
          </div>
        </Link>

        {/* Navigation - White text for dark forest */}
        <nav className="hidden lg:flex items-center gap-10">
          {[
            { name: "Dashboard", href: "/" },
            { name: "Wildlife", href: "/wildlife" },
            { name: "Fire Risk", href: "/fire-monitoring" },
            { name: "Pollution Tracker", href: "/pollution-tracker" },
            { name: "Insights", href: "/insights" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-black text-white/90 hover:text-emerald-400 transition-all uppercase tracking-wider"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 group">
            <Search className="w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-xs font-bold outline-none placeholder-white/40 text-white w-32"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative hover:bg-white/10 rounded-xl text-white">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 border-2 border-emerald-950 rounded-full" />
          </Button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-400/30">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Live System</span>
          </div>
        </div>
      </div>
    </header>
  )
}
