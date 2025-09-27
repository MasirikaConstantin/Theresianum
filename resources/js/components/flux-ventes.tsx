"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import axios from "axios"
import { useEffect, useState } from "react"
import { usePage } from "@inertiajs/react"
import { Auth } from "@/types"
import * as Spinners from 'react-spinners';
export const description = "A simple area chart"

const chartConfig = {
  sales: {
    label: "Ventes",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface SixHoursStats {
  hour: string
  total_ventes: number
}

export function FluxVentes({ auth }: { auth: Auth }) {
  const [stats, setStats] = useState<SixHoursStats[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/get-six-hours-stats', {
      params: {
        user_id: auth.user.id // Changé de vendeur_id à user_id
      }
    })
    .then(response => {
      setStats(response.data.sixHoursStats)
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des stats:", error)
      setStats([])
    })
    .finally(() => setLoading(false))
  }, [auth.user.id])
  if (loading) {
    return <div className="text-center flex items-center justify-center h-[200px]"><Spinners.PuffLoader color="#000" size={100} /></div>
  }

  if (!stats || stats.length === 0) {
    return <div className="text-center h-[200px]">Aucune donnée disponible pour les 6 dernières heures</div>
  }

  return (
    <div className="h-[200px] p-2">
      <div className="h-[20px]">
        <div>Le flux de ventes dans les 6 dernières heures</div>
      </div>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            width={500}
            height={300}
            data={stats}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="total_ventes"
              type="monotone"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.4}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </div>
  )
}