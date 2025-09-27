"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

const chartConfig = {
  sales: {
    label: "Ventes",
    color: "var(--chart-1)",
  },
  transactions: {
    label: "Transactions",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function SalesChart() {
  const [timeRange, setTimeRange] = React.useState<"today" | "week" | "month">("today")
  const [chartData, setChartData] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get('/api/sales-data', {
          params: { range: timeRange }
        })
        setChartData(response.data)
      } catch (error) {
        console.error("Error fetching sales data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesData()
  }, [timeRange])

  const handleRangeChange = (value: string) => {
    setTimeRange(value as "today" | "week" | "month")
  }

  if (isLoading) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Chiffre d'affaires</CardTitle>
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
          <CardTitle>Chiffre d'affaires</CardTitle>
          <CardDescription>
            Evolution des ventes selon la période sélectionnée
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={handleRangeChange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Aujourd'hui" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="today" className="rounded-lg">
              Aujourd'hui
            </SelectItem>
            <SelectItem value="week" className="rounded-lg">
              Cette semaine
            </SelectItem>
            <SelectItem value="month" className="rounded-lg">
              Ce mois
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTransactions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                if (timeRange === 'today') {
                  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                }
                return date.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value} €`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    if (timeRange === 'today') {
                      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    }
                    return date.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })
                  }}
                  valueFormatter={(value, name) => {
                    if (name === 'total_sales') return [`${value} €`, 'Ventes']
                    if (name === 'transactions') return [value, 'Transactions']
                    return [value, name]
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="total_sales"
              type="monotone"
              fill="url(#fillSales)"
              stroke="var(--chart-1)"
              strokeWidth={2}
            />
            <Area
              dataKey="transactions"
              type="monotone"
              fill="url(#fillTransactions)"
              stroke="var(--chart-2)"
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}