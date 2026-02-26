"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Wildlife", href: "/wildlife" },
  { label: "Biodiversity Report", href: "/biodiversity-report" },
  { label: "Fire Risk", href: "/fire-risk" },
  { label: "Carbon Impact", href: "/carbon-impact" },
  { label: "Insights", href: "/insights" },
  { label: "Docs", href: "/documentation" },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="hidden lg:flex items-center gap-8">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm font-medium transition-colors ${
            pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
