"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, TrendingUp, AlertTriangle, Leaf } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface SummaryData {
    totalUniqueSpecies: number
    endangeredSpecies: number
    endangeredRatio: number
    totalOccurrences: number
    averageOccurrences: number
    biodiversityIndex: number
}

interface IUCNCategory {
    count: number
    percentage: number
    color: string
}

interface SpeciesItem {
    scientificName: string
    iucnRedListCategory: string
    totalOccurrences: number
    color: string
}

interface TrendPoint {
    period: string
    speciesCount: number
    occurrences: number
    year?: number
    month?: number
}

interface ReportData {
    summary: SummaryData
    iucnBreakdown: { [key: string]: IUCNCategory }
    speciesList: SpeciesItem[]
    trend: TrendPoint[]
    metadata?: {
        timestamp: string
        totalRecordsProcessed: number
    }
}

const IUCN_LABELS: { [key: string]: string } = {
    'CR': 'Critically Endangered',
    'EN': 'Endangered',
    'VU': 'Vulnerable',
    'NT': 'Near Threatened',
    'LC': 'Least Concern',
    'DD': 'Data Deficient',
    'EW': 'Extinct in Wild',
    'EX': 'Extinct',
    'NOT_EVALUATED': 'Not Evaluated'
}

export default function BiodiversityReportPage() {
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/biodiversity/report')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch report')
                return res.json()
            })
            .then(data => {
                setData(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching report:', err)
                setError(err.message)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                    <p className="text-lg text-slate-600">Loading biodiversity report...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            Error Loading Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600">{error || 'Failed to load biodiversity data'}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const summary = data.summary
    const iucnData = Object.entries(data.iucnBreakdown).map(([key, value]) => ({
        name: IUCN_LABELS[key] || key,
        value: value.count,
        color: value.color
    }))

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                                    <Leaf className="w-8 h-8 text-emerald-600" />
                                    Biodiversity Full Report
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Comprehensive species data and conservation analysis
                                </p>
                            </div>
                        </div>
                        <div className="text-right text-sm text-slate-500">
                            <p>Updated: {new Date(data.metadata?.timestamp || Date.now()).toLocaleString()}</p>
                            <p>{data.metadata?.totalRecordsProcessed} records processed</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Species */}
                    <Card className="bg-white border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Total Unique Species
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-slate-900">
                                {summary.totalUniqueSpecies.toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                All ranks and categories
                            </p>
                        </CardContent>
                    </Card>

                    {/* Endangered Species */}
                    <Card className="bg-white border-red-200 bg-gradient-to-br from-red-50 to-white">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                Endangered Species
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-red-600">
                                {summary.endangeredSpecies}
                            </div>
                            <p className="text-xs text-red-600 mt-2">
                                {summary.endangeredRatio.toFixed(2)}% of total
                            </p>
                        </CardContent>
                    </Card>

                    {/* Biodiversity Index */}
                    <Card className="bg-white border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                Biodiversity Index
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-emerald-600">
                                {summary.biodiversityIndex.toFixed(1)}
                            </div>
                            <p className="text-xs text-emerald-600 mt-2">
                                Out of 100 - Excellent
                            </p>
                        </CardContent>
                    </Card>

                    {/* Average Occurrences */}
                    <Card className="bg-white border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Average Occurrences
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-slate-900">
                                {summary.averageOccurrences.toFixed(1)}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Per species
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* IUCN Breakdown - Pie Chart */}
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle>IUCN Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={iucnData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value, percent }: any) => `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {iucnData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => (value ?? 0).toLocaleString()} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Trend Over Time - Line Chart */}
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle>Biodiversity Trend Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.trend && data.trend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data.trend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis 
                                            dataKey="period" 
                                            angle={-45}
                                            height={80}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis stroke="#64748b" />
                                        <Tooltip contentStyle={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }} />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="speciesCount" 
                                            stroke="#10b981" 
                                            strokeWidth={2}
                                            dot={false}
                                            name="Species Count"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-slate-500">
                                    No trend data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Species Table */}
                <Card className="bg-white border-slate-200">
                    <CardHeader>
                        <CardTitle>Top 100 Species by Occurrences</CardTitle>
                        <p className="text-sm text-slate-600 mt-2">
                            Most frequently recorded species in the dataset
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50 border-b border-slate-200">
                                    <TableRow>
                                        <TableHead className="text-slate-700 font-semibold">Scientific Name</TableHead>
                                        <TableHead className="text-slate-700 font-semibold">IUCN Category</TableHead>
                                        <TableHead className="text-right text-slate-700 font-semibold">Occurrences</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.speciesList.map((species, idx) => (
                                        <TableRow 
                                            key={idx}
                                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                        >
                                            <TableCell className="font-medium text-slate-900">
                                                <em>{species.scientificName}</em>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="outline"
                                                    style={{ 
                                                        backgroundColor: species.color + '20',
                                                        color: species.color,
                                                        borderColor: species.color
                                                    }}
                                                >
                                                    {IUCN_LABELS[species.iucnRedListCategory] || species.iucnRedListCategory}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-slate-600 font-medium">
                                                {species.totalOccurrences.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {data.speciesList.length === 0 && (
                            <div className="py-8 text-center text-slate-500">
                                No species data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-slate-600">
                    <p>This report provides comprehensive biodiversity data for policy and conservation planning.</p>
                    <p className="mt-2 text-xs">Last updated: {new Date(data.metadata?.timestamp || Date.now()).toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}
