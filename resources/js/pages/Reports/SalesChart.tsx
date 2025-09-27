import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { SalesStatss } from '@/types/report';
import { Euro, TrendingUp, Package } from 'lucide-react';

interface SalesChartProps {
  stats: SalesStatss;
}

const SalesChart: React.FC<SalesChartProps> = ({ stats }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value).replace('$US', '$');
  };

  // Données pour le graphique
  const chartData = [
    {
      name: 'Ventes',
      total: stats.montant_total,
      net: stats.montant_net,
      remise: stats.montant_remise,
    },
  ];

   // Filtrer les items valides
   const validTopItems = stats.top_items.filter(item => 
    item.item_id !== null && item.item !== null
  );

  const nullItems = stats.top_items.filter(item => 
    item.item_id === null || item.item === null
  );
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-md">
          <p className="font-semibold">{label}</p>
          <p className="text-blue-500">Total: {formatCurrency(payload[0].value)}</p>
          <p className="text-green-500">Net: {formatCurrency(payload[1].value)}</p>
          <p className="text-red-500">Remise: {formatCurrency(payload[2].value)}</p>
        </div>
      );
    }
    return null;
  };

 
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique à barres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performances des Ventes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="total" 
                  name="Chiffre d'Affaires Total" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="net" 
                  name="Montant Net" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="remise" 
                  name="Remises" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Items (Produits ET Services) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top des Produits & Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validTopItems.length > 0 ? (
              <>
                {validTopItems.map((item, index) => (
                  <div key={`${item.type}-${item.item_id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">
                          {item.item?.name || 'Item inconnu'}
                          {item.type === 'service' && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Service
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.total_quantite} {item.type === 'service' ? 'fois' : 'unités'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(Number(item.total_montant))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Number(item.total_quantite) > 0 
                          ? `${formatCurrency(Number(item.total_montant) / Number(item.total_quantite))}/${item.type === 'service' ? 'fois' : 'unité'}`
                          : 'Prix indisponible'
                        }
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Afficher les items sans information */}
                {nullItems.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm font-medium mb-2">
                      {nullItems.length} item(s) sans information détaillée
                    </p>
                    <p className="text-yellow-700 text-xs">
                      Total: {formatCurrency(nullItems.reduce((sum, i) => sum + Number(i.total_montant), 0))}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune donnée de vente disponible</p>
              </div>
            )}
          </div>

          {/* Résumé financier */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-3">Résumé Financier</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total : </span>
                <span className="font-semibold">{formatCurrency(stats.montant_total)}</span>
              </div>
              
              {stats.montant_remise > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Remises:</span>
                  <span className="font-semibold">-{formatCurrency(stats.montant_remise)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-green-600">
                <span>Montant Net:</span>
                <span className="font-semibold">{formatCurrency(stats.montant_net)}</span>
              </div>
              
              {stats.total_depenses > 0 && (
                <div className="flex justify-between text-orange-500">
                  <span>Dépenses:</span>
                  <span className="font-semibold">-{formatCurrency(stats.total_depenses)}</span>
                </div>
              )}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Bénéfice Net:</span>
                  <span className={stats.benefice_net >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(stats.benefice_net)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesChart;