import React from 'react';
import { useStockSuccursales } from '@/hooks/useStockSuccursales';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Package, 
  Store,
  TrendingDown
} from 'lucide-react';

const StockSuccursales: React.FC = () => {
  const { data, loading, error, refetch } = useStockSuccursales();

  const getStockStatus = (quantite: number, seuilAlerte: number) => {
    if (quantite === 0) return 'rupture';
    if (quantite <= seuilAlerte) return 'alerte';
    return 'normal';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'rupture':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'alerte':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rupture':
        return <Badge variant="destructive">Rupture</Badge>;
      case 'alerte':
        return <Badge variant="warning">Alerte</Badge>;
      default:
        return <Badge variant="success">Normal</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de charger les données de stock: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">État du stock</h2>
          <p className="text-muted-foreground">
            Surveillance des niveaux de stock et alertes par produit
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>
        {/* Alertes globales */}
      <div className="space-y-4">
        {data.filter(stock => getStockStatus(stock.quantite, stock.seuil_alerte) === 'rupture').length > 0 && (
          <Alert variant="default">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ruptures de stock détectées</AlertTitle>
            <AlertDescription>
              {data.filter(stock => getStockStatus(stock.quantite, stock.seuil_alerte) === 'rupture')
                .map(stock => `${stock.produit?.name} (${stock.succursale?.nom})`)
                .join(', ')}
            </AlertDescription>
          </Alert>
        )}
        
        {data.filter(stock => getStockStatus(stock.quantite, stock.seuil_alerte) === 'alerte').length > 0 && (
          <Alert variant="default">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Stocks critiques détectés</AlertTitle>
            <AlertDescription>
              {data.filter(stock => getStockStatus(stock.quantite, stock.seuil_alerte) === 'alerte')
                .map(stock => `${stock.produit?.name} (${stock.succursale?.nom})`)
                .join(', ')}
            </AlertDescription>
          </Alert>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {data.map((stock) => {
          const status = getStockStatus(stock.quantite, stock.seuil_alerte);
          
          return (
            <div 
              key={stock.id} 
              className={`border-l-4 border-l-primary p-2 border-b-2 border-b-primary rounded-b-xl shadow-sm  ${
                status === 'rupture' ? 'border-l-destructive bg-destructive/10' :
                status === 'alerte' ? 'border-l-warning bg-warning/10' : 'border-l-primary bg-primary/10'
              }`}
            >
              <div className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{stock.produit?.name}</CardTitle>
                  </div>
                   <div className="flex items-center space-x-2 pt-2">
                   <div className="flex items-center space-x-2 mt-2 mr-5">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <CardDescription className="text-sm">
                        {stock.succursale?.nom} 
                    </CardDescription>
                    </div>
                    {getStatusBadge(status)} {getStatusIcon(status)}
                  </div>
                </div>
                
                {/* Affichage de la succursale */}
                
              </div>
              
              <div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Quantité en stock</span>
                    <span className={
                      status === 'rupture' ? 'text-destructive font-bold' :
                      status === 'alerte' ? 'text-yellow-500 font-bold' :
                      'text-green-500 font-bold'
                    }>
                      {stock.quantite} unités
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Seuil d'alerte</span>
                    <span className="text-sm">{stock.seuil_alerte} unités</span>
                  </div>
                  
                  
                </div>
              </div>
            </div>
          );
        })}
      </div>

      
    </div>
  );
};

export default StockSuccursales;