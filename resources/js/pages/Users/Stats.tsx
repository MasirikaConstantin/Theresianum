import {PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import Layout from '@/layouts/app-layout';
import {
  AreaChart,
  BarChart,
  LineChart,
  DonutChart,
  ScatterChart,
} from "@/components/ui/charts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserStatsProps extends PageProps {
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    succursale: {
      nom: string;
    } | null;
  };
  ventesData: Array<{ date: string; total: number }>;
  ventesMensuellesData: Array<{ month: number; year: number; total: number }>;
  pointagesData: Array<{ statut: string; count: number }>;
  retardsData: Array<{ date: string; retard: number }>;
  congesData: Array<{ type: string; count: number }>;
  stocksData: Array<{ produit_id: number; quantite: number; produit: { nom: string } }>;
  depensesData: Array<{ date: string; total: number }>;
}

export default function UserStats({
  user,
  ventesData,
  ventesMensuellesData,
  pointagesData,
  retardsData,
  congesData,
  stocksData,
  depensesData,
  auth,
}: UserStatsProps) {
  // Formater les données pour les graphiques
  const ventesChartData = ventesData.map((item) => ({
    date: item.date,
    total: item.total,
  }));

  const ventesMensuellesChartData = ventesMensuellesData.map((item) => ({
    name: `${item.year}-${item.month}`,
    total: item.total,
  }));

  const pointagesChartData = pointagesData.map((item) => ({
    name: item.statut,
    value: item.count,
  }));

  const retardsChartData = retardsData.map((item) => ({
    date: item.date,
    retard: item.retard,
  }));

  const congesChartData = congesData.map((item) => ({
    name: item.type,
    value: item.count,
  }));

  const stocksChartData = stocksData.map((item) => ({
    name: item.produit.nom,
    value: item.quantite,
  }));

  const depensesChartData = depensesData.map((item) => ({
    date: item.date,
    total: item.total,
  }));

  return (
    <Layout auth={auth}>
      <Head title={`Statistiques de ${user.name}`} />

      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center mt-1 space-x-2">
                <Badge variant="outline">{user.role ==="admin" ? "Admin" : user.role === "gerant" ? "D.R.H" : user.role === "coiffeur" ? "Coiffeur" : user.role === "caissier" ? "Caissier" : "Aucun"}</Badge>
                {user.succursale && (
                  <Badge variant="secondary">{user.succursale.nom}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Ventes quotidiennes */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Ventes quotidiennes</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <AreaChart
                data={ventesChartData}
                index="date"
                categories={["total"]}
                colors={["emerald"]}
                yAxisWidth={80}
                valueFormatter={(value) => `$${value.toFixed(2)}`}
              />
            </CardContent>
          </Card>

          {/* Ventes mensuelles */}
          <Card>
            <CardHeader>
              <CardTitle>Ventes mensuelles</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <BarChart
                data={ventesMensuellesChartData}
                index="name"
                categories={["total"]}
                colors={["blue"]}
                yAxisWidth={80}
                valueFormatter={(value) => `$${value.toFixed(2)}`}
              />
            </CardContent>
          </Card>

          {/* Statut de pointage */}
          <Card>
            <CardHeader>
              <CardTitle>Présence</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <DonutChart
                data={pointagesChartData}
                category="value"
                index="name"
                colors={["emerald", "red", "yellow", "blue"]}
                valueFormatter={(value) => `${value} jours`}
              />
            </CardContent>
          </Card>

          {/* Retards */}
          <Card>
            <CardHeader>
              <CardTitle>Retards (en minutes)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <LineChart
                data={retardsChartData}
                index="date"
                categories={["retard"]}
                colors={["red"]}
                yAxisWidth={60}
                valueFormatter={(value) => `${value} min`}
              />
            </CardContent>
          </Card>

          {/* Congés */}
          <Card>
            <CardHeader>
              <CardTitle>Types de congés</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <DonutChart
                data={congesChartData}
                category="value"
                index="name"
                colors={["blue", "green", "pink", "orange"]}
                valueFormatter={(value) => `${value} jours`}
              />
            </CardContent>
          </Card>

          {/* Stocks gérés */}
          {stocksChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Stocks gérés</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BarChart
                  data={stocksChartData}
                  index="name"
                  categories={["value"]}
                  colors={["purple"]}
                  yAxisWidth={60}
                  valueFormatter={(value) => `${value} unités`}
                />
              </CardContent>
            </Card>
          )}

          {/* Dépenses (pour les caissiers) */}
          {depensesChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dépenses enregistrées</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ScatterChart
                  data={depensesChartData}
                  index="date"
                  category="total"
                  colors={["orange"]}
                  yAxisWidth={80}
                  valueFormatter={(value) => `$${value.toFixed(2)}`}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}