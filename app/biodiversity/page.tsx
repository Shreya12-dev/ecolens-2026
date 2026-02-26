"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Leaf, TrendingUp, AlertCircle, Award } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

type SpeciesGroup = 'all' | 'birds' | 'mammals' | 'reptiles';

export default function BiodiversityPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedGroup, setSelectedGroup] = useState<SpeciesGroup>('all')
    const [endangeredModalOpen, setEndangeredModalOpen] = useState(false)
    const [endangeredSpecies, setEndangeredSpecies] = useState<any[]>([])
    const [loadingEndangered, setLoadingEndangered] = useState(false)

    useEffect(() => {
        setLoading(true)
        const params = new URLSearchParams()
        if (selectedGroup !== 'all') {
            params.append('group', selectedGroup)
        }
        
        fetch(`/api/biodiversity?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setData(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [selectedGroup])

    const handleEndangeredClick = async () => {
        setLoadingEndangered(true)
        setEndangeredModalOpen(true)
        
        const params = new URLSearchParams({ only: 'endangered' })
        if (selectedGroup !== 'all') {
            params.append('group', selectedGroup)
        }
        
        try {
            const res = await fetch(`/api/biodiversity?${params.toString()}`)
            const result = await res.json()
            setEndangeredSpecies(result.endangered_species || [])
        } catch (err) {
            console.error(err)
            setEndangeredSpecies([])
        }
        setLoadingEndangered(false)
    }


    if (loading || !data) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading biodiversity data...</p>
                </div>
            </div>
        )
    }

    // Get metrics from API response
    const totalSpecies = data.summary?.total_species || 0
    const endangeredCount = data.summary?.endangered_species || 0
    const biodiversityIndex = data.summary?.biodiversity_index || 0
    const endangeredRatio = data.summary?.endangered_ratio || 0

    // Create mock species data for visualization based on metrics
    const speciesData = [
        { name: 'Aves', commonName: 'Birds', population: Math.round(totalSpecies * 0.4), trend: 'stable' },
        { name: 'Mammalia', commonName: 'Mammals', population: Math.round(totalSpecies * 0.35), trend: 'stable' },
        { name: 'Reptilia', commonName: 'Reptiles', population: Math.round(totalSpecies * 0.25), trend: 'stable' }
    ]

    // Conservation status distribution based on endangered count
    const conservationData = [
        { status: 'Least Concern', count: Math.round(totalSpecies * (1 - endangeredRatio/100)) },
        { status: 'Near Threatened', count: Math.round(endangeredCount * 0.3) },
        { status: 'Vulnerable', count: Math.round(endangeredCount * 0.35) },
        { status: 'Endangered', count: Math.round(endangeredCount * 0.25) },
        { status: 'Critically Endangered', count: Math.round(endangeredCount * 0.1) }
    ].filter(item => item.count > 0)

    const COLORS: { [key: string]: string } = {
        'Critically Endangered': '#ef4444',
        'Endangered': '#dc2626',
        'Vulnerable': '#f97316',
        'Near Threatened': '#eab308',
        'Least Concern': '#22c55e',
        'Data Deficient': '#94a3b8',
        'Not Assessed': '#64748b'
    }


    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="relative border-b border-border bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 overflow-hidden">
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
                                <Leaf className="h-8 w-8 text-green-500" />
                                Biodiversity & Ecosystem Health
                            </h1>
                            <p className="text-muted-foreground">Conservation Status & Diversity Metrics for Sundarbans</p>
                        </div>
                    </div>

                    {/* Species Group Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={selectedGroup === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedGroup('all')}
                            className="gap-2"
                        >
                            🌍 All Species
                        </Button>
                        <Button
                            variant={selectedGroup === 'birds' ? 'default' : 'outline'}
                            onClick={() => setSelectedGroup('birds')}
                            className="gap-2"
                        >
                            🐦 Birds
                        </Button>
                        <Button
                            variant={selectedGroup === 'mammals' ? 'default' : 'outline'}
                            onClick={() => setSelectedGroup('mammals')}
                            className="gap-2"
                        >
                            🐘 Mammals
                        </Button>
                        <Button
                            variant={selectedGroup === 'reptiles' ? 'default' : 'outline'}
                            onClick={() => setSelectedGroup('reptiles')}
                            className="gap-2"
                        >
                            🐍 Reptiles
                        </Button>
                    </div>

                    {selectedGroup !== 'all' && (
                        <div className="mt-3 text-sm text-muted-foreground">
                            Showing data for <strong>{selectedGroup}</strong> only
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="p-6 glassmorphism border-2 border-green-500/30">
                            <Award className="h-8 w-8 text-green-500 mb-2" />
                            <div className="text-3xl font-bold">{biodiversityIndex.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">Biodiversity Index</div>
                            <div className="text-xs text-green-500 mt-1">Very good health</div>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="p-6 glassmorphism">
                            <Leaf className="h-8 w-8 text-emerald-500 mb-2" />
                            <div className="text-3xl font-bold">{totalSpecies}</div>
                            <div className="text-sm text-muted-foreground">Total Species</div>
                            <div className="text-xs text-emerald-500 mt-1">Unique species monitored</div>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="p-6 glassmorphism">
                            <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                            <div className="text-3xl font-bold">{Math.round(totalSpecies * (1 - endangeredRatio/100))}</div>
                            <div className="text-sm text-muted-foreground">Stable Species</div>
                            <div className="text-xs text-blue-500 mt-1">Least concern status</div>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card 
                            className="p-6 glassmorphism border-2 border-red-500/30 cursor-pointer hover:border-red-500/50 transition-all"
                            onClick={handleEndangeredClick}
                        >
                            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                            <div className="text-3xl font-bold">{endangeredCount}</div>
                            <div className="text-sm text-muted-foreground">Endangered Species</div>
                            <div className="text-xs text-red-500 mt-1">Click to view details</div>
                        </Card>
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Species Population */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <Card className="p-6 glassmorphism">
                            <h3 className="text-lg font-bold mb-4">Species Populations</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={speciesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                                    <YAxis stroke="hsl(var(--foreground))" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                        formatter={(value: any, name: string | undefined, props: any) => [
                                            value, 
                                            `${props.payload.commonName} (${props.payload.fullName})`
                                        ]}
                                    />
                                    <Bar dataKey="population" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>

                    {/* Conservation Status */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                        <Card className="p-6 glassmorphism">
                            <h3 className="text-lg font-bold mb-4">Conservation Status Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={conservationData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ payload, percent, index }) => `${payload.status.split(' ')[0]}: ${payload.count}`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {conservationData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || '#64748b'} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>
                </div>

                {/* Habitat Health Breakdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Card className="p-6 glassmorphism mb-8">
                        <h3 className="text-lg font-bold mb-6">Ecosystem Health Metrics</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">Biodiversity Score</span>
                                    <span className="text-sm font-bold">{biodiversityIndex.toFixed(1)}%</span>
                                </div>
                                <Progress value={Math.min(biodiversityIndex, 100)} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">Species Stability</span>
                                    <span className="text-sm font-bold">{Math.round(100 - endangeredRatio)}%</span>
                                </div>
                                <Progress value={Math.round(100 - endangeredRatio)} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">Conservation Concern</span>
                                    <span className="text-sm font-bold">{endangeredRatio.toFixed(1)}%</span>
                                </div>
                                <Progress value={endangeredRatio} className="h-2" />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Species Details */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <h3 className="text-xl font-bold mb-4">Species Groups Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {speciesData.map((species, idx) => (
                            <motion.div
                                key={species.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 + idx * 0.05 }}
                            >
                                <Card className="p-4 glassmorphism hover:border-primary/50 transition-all">
                                    <h4 className="font-bold mb-2">{species.commonName}</h4>
                                    <p className="text-sm text-muted-foreground mb-2 italic">
                                        {species.name}
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Species Count:</span>
                                            <span className="font-medium">{species.population}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Trend:</span>
                                            <span className="text-green-500 font-medium">Stable</span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Endangered Species Modal */}
            <Dialog open={endangeredModalOpen} onOpenChange={setEndangeredModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            Endangered Species {selectedGroup !== 'all' && `(${selectedGroup})`}
                        </DialogTitle>
                        <DialogDescription>
                            Species with conservation status: Critically Endangered (CR), Endangered (EN), or Vulnerable (VU)
                        </DialogDescription>
                    </DialogHeader>

                    {loadingEndangered ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : endangeredSpecies.length > 0 ? (
                        <div className="rounded-lg border border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Scientific Name</TableHead>
                                        <TableHead>Common Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Occurrences</TableHead>
                                        <TableHead>Class</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {endangeredSpecies.map((species, idx) => (
                                        <TableRow key={idx} className="hover:bg-muted/50">
                                            <TableCell className="font-medium text-sm">
                                                <span title={species.scientificName} className="truncate block max-w-xs">
                                                    {species.scientificName}
                                                </span>
                                            </TableCell>
                                            <TableCell className="italic text-muted-foreground">
                                                {species.commonName !== 'Not Available' ? species.commonName : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="outline"
                                                    className={
                                                        species.iucnRedListCategory === 'CR' ? 'bg-red-500/20 text-red-700 border-red-500' :
                                                        species.iucnRedListCategory === 'EN' ? 'bg-orange-500/20 text-orange-700 border-orange-500' :
                                                        'bg-yellow-500/20 text-yellow-700 border-yellow-500'
                                                    }
                                                >
                                                    {species.iucnRedListCategory}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{species.numberOfOccurrences}</TableCell>
                                            <TableCell className="text-sm">{species.class || '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No endangered species found {selectedGroup !== 'all' ? `in ${selectedGroup}` : ''}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
