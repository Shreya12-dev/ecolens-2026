"use client"
import { AlertCircle, Flame, TrendingDown, AlertTriangle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const alerts = [
  {
    id: 1,
    title: "High fire risk detected",
    region: "Western Ghats",
    time: "2 hours ago",
    severity: "red",
    icon: Flame,
  },
  {
    id: 2,
    title: "Elephant population drop",
    region: "Region A",
    time: "Yesterday",
    severity: "orange",
    icon: TrendingDown,
  },
  {
    id: 3,
    title: "Deforestation spike via satellite",
    region: "Amazon Basin",
    time: "3 days ago",
    severity: "yellow",
    icon: AlertTriangle,
  },
  {
    id: 4,
    title: "Biodiversity index decreased",
    region: "East Africa",
    time: "5 days ago",
    severity: "orange",
    icon: AlertCircle,
  },
]

const severityColors = {
  red: "bg-rose-50 text-rose-600 border-rose-100",
  orange: "bg-orange-50 text-orange-600 border-orange-100",
  yellow: "bg-amber-50 text-amber-600 border-amber-100",
}

export default function AlertsSidebar() {
  return (
    <Card className="bg-white border-zinc-100 rounded-[2.5rem] shadow-sm flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-3 pt-8 px-6">
        <CardTitle className="text-base font-black text-zinc-900 flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          Recent Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-8 flex-1 overflow-auto">
        {alerts.map((alert) => {
          const Icon = alert.icon
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-3xl border ${severityColors[alert.severity as keyof typeof severityColors]} transition-all hover:shadow-md cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl bg-white/80 shadow-sm border border-black/5`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black leading-tight mb-1">{alert.title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold opacity-60 uppercase">{alert.region}</p>
                    <p className="text-[10px] font-bold opacity-40">{alert.time}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1 opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )
        })}
        <Button variant="outline" className="w-full mt-4 bg-zinc-50 border-zinc-100 hover:bg-zinc-100 text-zinc-900 font-bold text-xs rounded-2xl h-11">
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  )
}
