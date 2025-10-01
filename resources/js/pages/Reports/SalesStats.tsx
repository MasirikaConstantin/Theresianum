import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro, TrendingUp, Package, Percent } from 'lucide-react';
import { SalesStatss } from '@/types/report';
import { FrancCongolais } from '@/hooks/Currencies';

interface SalesStatsProps {
  stats: SalesStatss;
}

const SalesStats: React.FC<SalesStatsProps> = ({ stats }) => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ventes</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_ventes}</div>
          <p className="text-xs text-muted-foreground">Nombre total de ventes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{FrancCongolais(stats.montant_total)}</div>
          <p className="text-xs text-muted-foreground">Montant total des ventes</p>
        </CardContent>
      </Card>

     

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{FrancCongolais(stats.benefice_net)}</div>
          <p className="text-xs text-muted-foreground">Après déduction des dépenses</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesStats;