"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, Download, FileText, Bird, PawPrint, Droplet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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
    commonName: string
    iucnRedListCategory: string
    totalOccurrences: number
    speciesGroup?: string
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
    const [selectedFilter, setSelectedFilter] = useState<string>('all')
    const [showEndangeredModal, setShowEndangeredModal] = useState(false)
    const [endangeredSpecies, setEndangeredSpecies] = useState<SpeciesItem[]>([])
    const [loadingEndangered, setLoadingEndangered] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const url = selectedFilter === 'all' 
                    ? '/api/biodiversity/report'
                    : `/api/biodiversity/report?group=${selectedFilter}`;
                
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch report');
                const fetchedData = await res.json();
                setData(fetchedData);
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching report:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedFilter])

    // Fetch endangered species for drill-down
    const fetchEndangeredSpecies = async () => {
        setLoadingEndangered(true)
        try {
            const url = selectedFilter === 'all'
                ? '/api/biodiversity/report?only=endangered'
                : `/api/biodiversity/report?group=${selectedFilter}&only=endangered`
            
            const res = await fetch(url)
            const result = await res.json()
            setEndangeredSpecies(result.speciesList || [])
            setShowEndangeredModal(true)
        } catch (err: any) {
            console.error('Error fetching endangered species:', err)
        } finally {
            setLoadingEndangered(false)
        }
    }

    const filteredSpecies = data?.speciesList || []

    // Generate species populations data for bar chart
    const speciesPopulations = [
        { name: 'Aves', value: 1900 },
        { name: 'Mammalia', value: 1650 },
        { name: 'Reptilia', value: 1180 }
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                    <p className="text-lg text-slate-700 font-medium">Loading biodiversity report...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <Link href="/">
                        <Button variant="ghost" className="mb-6">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700">
                                <AlertCircle className="w-5 h-5" />
                                Error Loading Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-600">{error || 'Failed to load biodiversity data'}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const summary = data?.summary || {
        totalUniqueSpecies: 0,
        endangeredSpecies: 0,
        biodiversityIndex: 0,
        totalOccurrences: 0
    }
    const iucnData = data?.iucnBreakdown ? Object.entries(data.iucnBreakdown).map(([key, value]) => ({
        name: IUCN_LABELS[key] || key,
        shortName: key,
        value: value.count,
        percentage: value.percentage,
        color: value.color
    })) : []

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-50">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                Biodiversity Full Report
                            </h1>
                            <p className="text-sm text-gray-600">
                                Comprehensive species detection and conservation status analysis
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Download className="w-4 h-4 mr-2" />
                                Export Report
                            </Button>
                            <Button variant="outline" className="border-gray-300">
                                <FileText className="w-4 h-4 mr-2" />
                                Download Certificate
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filter Buttons */}
                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">Filter by Species Group:</span>
                        <div className="flex gap-2">
                            <Button
                                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedFilter('all')}
                                className={selectedFilter === 'all' 
                                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700' 
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-emerald-600'}
                            >
                                All Species
                            </Button>
                            <Button
                                variant={selectedFilter === 'birds' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedFilter('birds')}
                                className={selectedFilter === 'birds' 
                                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700' 
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-emerald-600'}
                            >
                                <Bird className="w-4 h-4 mr-1.5" />
                                Birds
                            </Button>
                            <Button
                                variant={selectedFilter === 'mammals' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedFilter('mammals')}
                                className={selectedFilter === 'mammals' 
                                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700' 
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-emerald-600'}
                            >
                                <PawPrint className="w-4 h-4 mr-1.5" />
                                Mammals
                            </Button>
                            <Button
                                variant={selectedFilter === 'amphibians' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedFilter('amphibians')}
                                className={selectedFilter === 'amphibians' 
                                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700' 
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-emerald-600'}
                            >
                                <Droplet className="w-4 h-4 mr-1.5" />
                                Amphibians
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Species */}
                    <Card className="bg-gray-100 border-gray-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Species
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-gray-900 mb-1">
                                {summary?.totalUniqueSpecies?.toLocaleString() || '0'}
                            </div>
                            <p className="text-xs text-gray-600">
                                Unique species detected
                            </p>
                        </CardContent>
                    </Card>

                    {/* Endangered Species */}
                    <Card 
                        className="bg-gray-100 border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={fetchEndangeredSpecies}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Endangered Species
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-red-600 mb-1">
                                {summary?.endangeredSpecies || 0}
                            </div>
                            <p className="text-xs text-emerald-600 hover:underline">
                                Click to view details →
                            </p>
                        </CardContent>
                    </Card>

                    {/* Conservation Index */}
                    <Card className="bg-gray-100 border-gray-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Conservation Index
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-emerald-600 mb-1">
                                {summary?.biodiversityIndex?.toFixed(0) || '0'}%
                            </div>
                            <p className="text-xs text-gray-600">
                                Species in safe categories
                            </p>
                        </CardContent>
                    </Card>

                    {/* Last Updated */}
                    <Card className="bg-gray-100 border-gray-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Last Updated
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                {new Date(data.metadata?.timestamp || Date.now()).toLocaleDateString('en-GB')}
                            </div>
                            <p className="text-xs text-gray-600">
                                {new Date(data.metadata?.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* IUCN Red List Categories - Donut Chart */}
                    <Card className="bg-white border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-900">IUCN Red List Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-8">
                                <ResponsiveContainer width="50%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={iucnData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={110}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={false}
                                        >
                                            {iucnData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => value.toLocaleString()} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-col gap-2">
                                    {iucnData.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <div 
                                                className="w-4 h-4 rounded" 
                                                style={{ backgroundColor: entry.color }}
                                            />
                                            <span style={{ color: entry.color }} className="font-semibold">
                                                {entry.name}: {entry.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Species Trend Over Time */}
                    <Card className="bg-white border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-900">Species Trend Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.trend && data.trend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={data.trend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis 
                                            dataKey="period" 
                                            tick={{ fontSize: 11, fill: '#6b7280' }}
                                        />
                                        <YAxis yAxisId="left" stroke="#f59e0b" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="occurrences" 
                                            stroke="#f59e0b" 
                                            strokeWidth={2}
                                            dot={{ fill: '#f59e0b', r: 4 }}
                                            name="Occurrences"
                                        />
                                        <Line 
                                            yAxisId="right"
                                            type="monotone" 
                                            dataKey="speciesCount" 
                                            stroke="#10b981" 
                                            strokeWidth={2}
                                            dot={{ fill: '#10b981', r: 4 }}
                                            name="Species Count"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[280px] flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        <p>No trend data available</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Species Table */}
                <Card className="bg-white border-gray-200">
                    <CardHeader className="border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center">
                                <span className="text-emerald-600 text-sm">📈</span>
                            </div>
                            <CardTitle className="text-lg font-bold text-gray-900">Top Species by Occurrences</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="border-b border-gray-200">
                                        <TableHead className="text-gray-700 font-semibold">Common Name</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">Scientific Name</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">IUCN Category</TableHead>
                                        <TableHead className="text-right text-gray-700 font-semibold">Occurrences</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSpecies.length > 0 ? (
                                        filteredSpecies.slice(0, 20).map((species, idx) => (
                                            <TableRow 
                                                key={idx}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <TableCell className="font-medium text-gray-900">
                                                    {species.commonName}
                                                </TableCell>
                                                <TableCell className="text-gray-700">
                                                    <em>{species.scientificName}</em>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant="outline"
                                                        className="font-medium"
                                                        style={{ 
                                                            backgroundColor: species.color + '20',
                                                            color: species.color,
                                                            borderColor: species.color
                                                        }}
                                                    >
                                                        {IUCN_LABELS[species.iucnRedListCategory] || species.iucnRedListCategory}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-emerald-600 font-semibold">
                                                    {species.totalOccurrences.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                                                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                                <p>No species data available</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Endangered Species Modal */}
            <Dialog open={showEndangeredModal} onOpenChange={setShowEndangeredModal}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            Endangered Species Details
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                            Showing species classified as Critically Endangered (CR), Endangered (EN), or Vulnerable (VU)
                            {selectedFilter !== 'all' && ` for ${selectedFilter}`}
                        </DialogDescription>
                    </DialogHeader>

                    {loadingEndangered ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                            <span className="ml-3 text-gray-600">Loading endangered species...</span>
                        </div>
                    ) : endangeredSpecies.length > 0 ? (
                        <div className="mt-4">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Found <span className="font-semibold text-red-600">{endangeredSpecies.length}</span> endangered species
                                </p>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        CR: Critically Endangered
                                    </Badge>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                        EN: Endangered
                                    </Badge>
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                        VU: Vulnerable
                                    </Badge>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold">Common Name</TableHead>
                                        <TableHead className="font-semibold">Scientific Name</TableHead>
                                        <TableHead className="font-semibold">IUCN Category</TableHead>
                                        <TableHead className="font-semibold">Species Group</TableHead>
                                        <TableHead className="font-semibold text-right">Occurrences</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {endangeredSpecies.map((species, index) => (
                                        <TableRow key={index} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{species.commonName}</TableCell>
                                            <TableCell>
                                                <em className="text-gray-600">{species.scientificName}</em>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    style={{ 
                                                        backgroundColor: species.color + '20',
                                                        color: species.color,
                                                        borderColor: species.color
                                                    }}
                                                    className="border"
                                                >
                                                    {species.iucnRedListCategory}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {species.speciesGroup || 'Unknown'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {species.totalOccurrences.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <AlertCircle className="w-12 h-12 mb-3 text-gray-400" />
                            <p className="text-lg font-medium">No endangered species found</p>
                            <p className="text-sm mt-1">Try selecting a different species group</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
