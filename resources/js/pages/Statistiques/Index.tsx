import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,

    ChartTooltipContent
} from "@/components/ui/chart";
import Layout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { ProductServiceChart } from '@/components/product-service-chart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Auth, BreadcrumbItem } from '@/types';
import { FilterX } from 'lucide-react';
import { MonDatePicker } from '@/components/example-date-picker';
import { Label } from '@/components/ui/label';
import { RevenueTableWithPagination } from './RevenueTable';

interface Props extends PageProps {
    succursales: Array<{
        id: number;
        nom: string;
    }>;
    filters: {
        succursale?: string;
        date_debut?: string;
        date_fin?: string;
        periode?: string;
    };
    ventesData: Record<string, number>;
    ventesParSuccursale: Record<string, Record<string, number>>;
    employesStats: Record<string, number>;
    pointagesStats: Record<string, number>;
    congesStats: Record<string, number>;
    depensesStats: number;
    auth: Auth;
}

export default function StatistiquesIndex({
    auth,
    succursales,
    filters,
    ventesData,
    ventesParSuccursale,
    employesStats,
    pointagesStats,
    congesStats,
    depensesStats,
}: Props) {
    const applyFilters = (newFilters: Partial<typeof filters>) => {
        router.get(route('statistiques.index'), {
            ...filters,
            ...newFilters,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        router.get(route('statistiques.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    // Préparer les données pour les graphiques
    const ventesChartData = Object.entries(ventesData).map(([date, total]) => ({
        date,
        total: Number(parseFloat(total).toFixed(2)),
    }));
    const ventesParSuccursaleChartData = Object.entries(ventesParSuccursale).map(([succursaleId, data]) => {
        const succursale = succursales.find(s => s.id === Number(succursaleId));
        return {
            name: succursale?.nom || `Branche ${succursaleId}`,
            data: Object.entries(data).map(([date, total]) => ({
                date,
                total: Number(parseFloat(total).toFixed(2)),
            })),
        };
    });

    const employesChartData = Object.entries(employesStats).map(([role, count]) => ({
        name: role.charAt(0).toUpperCase() + role.slice(1),
        value: count,
    }));

    const pointagesChartData = Object.entries(pointagesStats).map(([statut, count]) => ({
        name: statut.charAt(0).toUpperCase() + statut.slice(1),
        value: count,
    }));

    const congesChartData = Object.entries(congesStats).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count,
    }));

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Statistiques',
            href: '/statistiques',
        },
    ];
    const chartConfig = {


    } satisfies ChartConfig
    
    return (
        <Layout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Statistiques" />

            <div className="container p-6">
                <h1 className="text-3xl font-bold mb-6">Tableau de bord des statistiques</h1>

                {/* Filtres */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filtres</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="succursale">Succursale</Label>
                                <Select
                                    value={filters.succursale || 'all'}
                                    onValueChange={(value) => applyFilters({
                                        succursale: value === 'all' ? undefined : value
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Toutes les succursales" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les succursales</SelectItem>
                                        {succursales.map((succursale) => (
                                            <SelectItem key={succursale.id} value={String(succursale.id)}>
                                                {succursale.nom}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <MonDatePicker
                                label="Date de début"
                                className="mt-0"
                                value={filters.date_debut || ''}
                                onChange={(value) => applyFilters({ date_debut: value })}
                            />
                            <MonDatePicker
                                label="Date de fin"
                                className="mt-0"
                                value={filters.date_fin || ''}
                                onChange={(value) => applyFilters({ date_fin: value })}
                            />

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={resetFilters}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <FilterX className="h-4 w-4" />
                                    Réinitialiser
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className='flex flex-col md:flex-row gap-6'>
                    <div className='w-full md:w-1/3'>
                        <RevenueTableWithPagination data={ventesChartData} />
                    </div>
                    <div className='w-full md:w-2/3 space-y-6 '>
                {/* Graphique des ventes */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Évolution des ventes</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] pl-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <ChartContainer
                                style={{ width: "100%", height: "100%" }}
                                config={chartConfig}
                                className="aspect-auto h-[250px] w-full">
                                <AreaChart
                                    data={ventesChartData}
                                    margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                                >
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>

                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    />

                                    <YAxis
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                                        domain={[0, (dataMax) => Math.ceil(dataMax / 1000) * 1000]}
                                        width={80}
                                    />

                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />

                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(label) => (
                                                    <span className="text-gray-500 font-medium">
                                                        {new Date(label).toLocaleDateString('fr-FR', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long'
                                                        })}
                                                    </span>
                                                )}
                                                valueFormatter={(value) => [
                                                    `$${Number(value).toLocaleString()}`,
                                                    'Total des ventes'
                                                ]}
                                                className="bg-white shadow-lg border border-gray-200 rounded-md p-3"
                                            />
                                        }
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                        activeDot={{
                                            r: 6,
                                            stroke: '#1d4ed8',
                                            strokeWidth: 2,
                                            fill: '#ffffff'
                                        }}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                </div>
                </div>
            

                {/* Ventes par succursale */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Ventes par succursale</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] pl-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <ChartContainer
                                style={{ width: "100%", height: "100%" }}
                                config={chartConfig}
                                className="aspect-auto h-[250px] w-full">
                                <BarChart
                                    data={ventesParSuccursaleChartData.flatMap(succursale =>
                                        succursale.data.map(item => ({
                                            date: item.date,
                                            [succursale.name]: item.total,
                                        }))
                                    )}
                                    margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                                    layout="vertical"
                                >
                                    <defs>
                                        <linearGradient id="colorSuccursale1" x1="0" y1="0" x2="100%" y2="0">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        </linearGradient>
                                        <linearGradient id="colorSuccursale2" x1="0" y1="0" x2="100%" y2="0">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                                        </linearGradient>
                                        <linearGradient id="colorSuccursale3" x1="0" y1="0" x2="100%" y2="0">
                                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
                                        </linearGradient>
                                        <linearGradient id="colorSuccursale4" x1="0" y1="0" x2="100%" y2="0">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2} />
                                        </linearGradient>
                                        <linearGradient id="colorSuccursale5" x1="0" y1="0" x2="100%" y2="0">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />

                                    <XAxis
                                        type="number"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                                    />

                                    <YAxis
                                        dataKey="date"
                                        type="category"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        width={100}
                                    />

                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(label) => (
                                                    <span className="text-gray-500 font-medium">
                                                        {new Date(label).toLocaleDateString('fr-FR', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long'
                                                        })}
                                                    </span>
                                                )}
                                                valueFormatter={(value, name) => [
                                                    `$${Number(value).toLocaleString()}`,
                                                    name
                                                ]}
                                                className="bg-white shadow-lg border border-gray-200 rounded-md p-3"
                                            />
                                        }
                                    />

                                    <Legend
                                        content={({ payload }) => (
                                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                                {payload?.map((entry, index) => (
                                                    <div key={`legend-${index}`} className="flex items-center">
                                                        <div
                                                            className="w-4 h-4 mr-2 rounded-sm"
                                                            style={{
                                                                backgroundColor: entry.color,
                                                                background: entry.color?.includes('url') ?
                                                                    `linear-gradient(to right, ${entry.color === 'url(#colorSuccursale1)' ? '#3b82f6' :
                                                                        entry.color === 'url(#colorSuccursale2)' ? '#10b981' :
                                                                            entry.color === 'url(#colorSuccursale3)' ? '#ef4444' :
                                                                                entry.color === 'url(#colorSuccursale4)' ? '#f59e0b' : '#8b5cf6'}, 
                                                ${entry.color === 'url(#colorSuccursale1)' ? '#3b82f680' :
                                                                        entry.color === 'url(#colorSuccursale2)' ? '#10b98180' :
                                                                            entry.color === 'url(#colorSuccursale3)' ? '#ef444480' :
                                                                                entry.color === 'url(#colorSuccursale4)' ? '#f59e0b80' : '#8b5cf680'})` :
                                                                    entry.color
                                                            }}
                                                        />
                                                        <span className="text-sm text-gray-600">{entry.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    />

                                    {ventesParSuccursaleChartData.map((succursale, index) => (
                                        <Bar
                                            key={succursale.name}
                                            dataKey={succursale.name}
                                            stackId="a"
                                            fill={`url(#colorSuccursale${index + 1})`}
                                            radius={[0, 4, 4, 0]}
                                        />
                                    ))}
                                </BarChart>
                            </ChartContainer>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
{/* 
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Répartition des employés  /}
                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition des employés</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <PieChart
                                data={employesChartData}
                                category="value"
                                index="name"
                            />
                        </CardContent>
                    </Card>

                    {/* Statut des pointages /}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statut des pointages</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <PieChart
                                data={pointagesChartData}
                                category="value"
                                index="name"
                            />
                        </CardContent>
                    </Card>

                    {/* Types de congés /}
                    <Card>
                        <CardHeader>
                            <CardTitle>Types de congés</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <PieChart
                                data={congesChartData}
                                category="value"
                                index="name"
                            />
                        </CardContent>
                    </Card>
                </div>
                */}
                <div className='mb-6'>
                    <ProductServiceChart auth={auth} />
                </div>

                {/* Dépenses 
                <Card>
                    <CardHeader>
                        <CardTitle>Dépenses totales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            $ {depensesStats.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>*/}
            </div>
        </Layout>
    );
}