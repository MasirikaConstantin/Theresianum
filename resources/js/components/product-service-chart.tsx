"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import axios from "axios"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Auth, auth } from "@/types"

const chartConfig = {
  produits: {
    label: "Produits",
    color: "var(--chart-1)",
  },
  services: {
    label: "Services",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ProductServiceChart({ auth }: { auth: Auth }) {
  const [timeRange, setTimeRange] = React.useState<"today" | "week" | "month">("today")
  const [chartData, setChartData] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get('/api/product-service-data', {
          params: { range: timeRange , user_id: auth.user.id }
        })
        setChartData(response.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  const handleRangeChange = (value: string) => {
    setTimeRange(value as "today" | "week" | "month")
  }

    const getMaxValue = (data: any[]) => {
        if (!data || data.length === 0) return 1000; // valeur par défaut
        
        let max = 0;
        data.forEach(item => {
        const produits = parseFloat(item.produits) || 0;
        const services = parseFloat(item.services) || 0;
        const currentMax = Math.max(produits, services);
        if (currentMax > max) max = currentMax;
        });
        
        // Arrondir à la centaine supérieure pour avoir un joli intervalle
        return Math.ceil(max / 100) * 100;
    };

  if (isLoading) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Produits vs Services</CardTitle>
            <CardDescription>Chargement des données...</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[250px] flex items-center justify-center">
            <p>Chargement...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Comparaison Produits/Services</CardTitle>
          <CardDescription>
            Evolution des ventes de produits et services
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorProduits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorServices" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value)
                if (timeRange === 'today') {
                  return date.toLocaleTimeString('fr-FR', { hour: '2-digit' })
                }
                return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
              }}
            />
            <YAxis
              tickFormatter={(value) => `${value} $`}
              domain={[0, getMaxValue(chartData)]}
              ticks={[0, getMaxValue(chartData) / 4, getMaxValue(chartData) / 2, getMaxValue(chartData) * 3/4, getMaxValue(chartData)]}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    if (timeRange === 'today') {
                      return date.toLocaleTimeString('fr-FR', { hour: '2-digit' })
                    }
                    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="services"
              stroke="var(--chart-2)"
              fillOpacity={1}
              fill="url(#colorServices)"
            />
            <Area
              type="monotone"
              dataKey="produits"
              stroke="var(--chart-1)"
              fillOpacity={1}
              fill="url(#colorProduits)"
            />
            
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}