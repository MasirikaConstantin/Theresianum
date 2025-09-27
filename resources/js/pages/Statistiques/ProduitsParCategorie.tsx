import AppLayout from '@/layouts/app-layout';
import { Auth, BreadcrumbItem, Categorie, ProduitStats } from '@/types';
import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Box,
  Layers
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Tableau de bord', href: route('dashboard') },
  { title: 'Statistiques', href: route('statistiques.index') },
  { title: 'Produits par Catégorie', href: route('statistiques.produits-par-categorie') },
];

interface ProduitStatsParCategorieProps {
  auth: Auth;
  categories: Categorie[];
  statsGlobales: {
    totalProduits: number;
    totalVentes: number;
    chiffreAffaire: string;
    produitsEnRupture: number;
  };
  statsParCategorie: ProduitStats[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ProduitStatsParCategorie({ 
  auth, 
  categories, 
  statsGlobales, 
  statsParCategorie 
}: ProduitStatsParCategorieProps) {
  const [categorieSelectionnee, setCategorieSelectionnee] = useState<Categorie | null>(categories[0] || null);

  const statsCategorie = categorieSelectionnee 
    ? statsParCategorie.find(stat => stat.categorie_id === categorieSelectionnee.id)
    : null;
    const  currency = (value: number) => new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'USD'
    }).format(value).replace('$US', '$ ')
  // Données pour le graphique à barres (ventes par catégorie)
  const dataVentes = statsParCategorie.map(stat => ({
    name: stat.categorie_nom,
    ventes: stat.total_ventes,
    chiffre_affaire: currency(stat.chiffre_affaire)
  }));

  // Données pour le graphique circulaire (répartition des produits)
  const dataRepartition = statsParCategorie.map(stat => ({
    name: stat.categorie_nom,
    value: stat.total_produits
  }));
  
  return (
    <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
      <Head title="Statistiques Produits par Catégorie" />
      
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Statistiques Produits par Catégorie</h1>
        </div>

        {/* Cartes de statistiques globales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsGlobales.totalProduits}</div>
              <p className="text-xs text-muted-foreground">Toutes catégories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ventes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsGlobales.totalVentes}</div>
              <p className="text-xs text-muted-foreground">Unités vendues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Montant vendue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currency(parseFloat(statsGlobales.chiffreAffaire))} </div>
              <p className="text-xs text-muted-foreground">Total généré</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits en Rupture</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsGlobales.produitsEnRupture}</div>
              <p className="text-xs text-muted-foreground">Nécessitent réapprovisionnement</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Liste des catégories à gauche */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Catégories</CardTitle>
              <CardDescription>Sélectionnez une catégorie pour voir ses statistiques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((categorie) => (
                  <div
                    key={categorie.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent ${
                      categorieSelectionnee?.id === categorie.id 
                        ? 'bg-accent border-primary' 
                        : 'border-transparent'
                    }`}
                    onClick={() => setCategorieSelectionnee(categorie)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{categorie.nom}</span>
                      <Badge variant={categorie.is_active ? "default" : "secondary"}>
                        {categorie.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {categorie.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {categorie.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Détails de la catégorie sélectionnée à droite */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {categorieSelectionnee ? `Statistiques - ${categorieSelectionnee.nom}` : 'Sélectionnez une catégorie'}
              </CardTitle>
              <CardDescription>
                {categorieSelectionnee?.description || 'Détails des performances de la catégorie'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsCategorie ? (
                <div className="space-y-6">
                  {/* Cartes de stats de la catégorie */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Produits</CardTitle>
                        <Box className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{statsCategorie.total_produits}</div>
                        <p className="text-xs text-muted-foreground">Total dans cette catégorie</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventes</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{statsCategorie.total_ventes}</div>
                        <p className="text-xs text-muted-foreground">Unités vendues</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Montant vendue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{currency(statsCategorie.chiffre_affaire)} </div>
                        <p className="text-xs text-muted-foreground">Total généré</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Stock et alertes */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">État du Stock</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Stock moyen</span>
                            <span className="font-medium">{statsCategorie.stock_moyen}</span>
                          </div>
                          <Progress value={(statsCategorie.stock_moyen / Math.max(statsCategorie.stock_moyen, 100)) * 100} />
                          
                          <div className="flex justify-between text-sm mt-4">
                            <span>Produits en alerte</span>
                            <span className="font-medium text-destructive">
                              {statsCategorie.produits_en_alerte}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Taux de vente</span>
                            <span className="font-medium">
                              {((statsCategorie.total_ventes / Math.max(statsCategorie.total_produits, 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span>Marge moyenne</span>
                            <span className="font-medium text-green-600">
                              {currency(statsCategorie.marge_moyenne)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Graphiques */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Top Produits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {statsCategorie.top_produits.slice(0, 5).map((produit, index) => (
                            <div key={produit.id} className="flex justify-between text-sm">
                              <span className="truncate">{index + 1}. {(produit.nom).length > 10 ? produit.nom.slice(0, 20) + '...' : produit.nom}</span>
                              <span className="font-medium">{produit.ventes} ventes</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Évolution Mensuelle</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsCategorie.evolution_mensuelle}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="mois" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="ventes" fill="#0088FE" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Sélectionnez une catégorie pour voir ses statistiques détaillées
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Graphiques globaux */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ventes par Catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataVentes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ventes" fill="#8884d8" name="Nombre de ventes" />
                    <Bar dataKey="chiffre_affaire" fill="#82ca9d" name="Montant vendue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition des Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataRepartition}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {dataRepartition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}