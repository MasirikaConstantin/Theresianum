import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import DateRangePicker from "@/components/date-range-picker";
import AppLayout from '@/layouts/app-layout';
import { Auth, auth, BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from '@/components/ui/button';
import { FrancCongolais } from '@/hooks/Currencies';

interface Produit {
  id: string;
  name: string;
  ref: string;
  avatar_url: string;
  description: string;
}
interface SuccursaleStat {
  id: string;
  nom: string;
  total_quantite: number;
  total_ca: number;
  marge: number;
}

interface StatsData {
  produit: any;
  stats: {
    total_vendu: string;
    chiffre_affaires: string;
    marge: string;
  };
  ventes_par_periode: Array<{
    date: string;
    total_quantite: number;
    total_ca: number;
  }>;
  ventes_par_succursale: SuccursaleStat[];
  date_debut: string;
  date_fin: string;
}



export default function ProductStats({ auth, produits: initialProduits = [] }: { auth: Auth; produits?: Produit[] }) {
  const [produits, setProduits] = useState<Produit[]>(initialProduits);
  const [selectedProduitId, setSelectedProduitId] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  // Charger la liste des produits seulement si non fournis par les props
  useEffect(() => {
    if (initialProduits.length === 0) {
      axios.get(route('produits.list'))
        .then(response => {
          if (Array.isArray(response.data)) {
            setProduits(response.data);
          } else {
            console.error('Expected array but got:', response.data);
            setProduits([]);
          }
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          setProduits([]);
        });
    }
  }, [initialProduits]);
  // Charger les stats quand les filtres changent
  useEffect(() => {
    if (!selectedProduitId) return;

    setLoading(true);
    const params = {
      produit_id: selectedProduitId,
      date_debut: dateDebut,
      date_fin: dateFin
    };

    axios.get(route('produits.stats'), { params })
      .then(response => {
        setStats(response.data);
      })
      .finally(() => setLoading(false));
  }, [selectedProduitId, dateDebut, dateFin]);

  const resetFilters = () => {
    setDateDebut('');
    setDateFin('');
  };

  // Préparer les données pour le graphique
  const prepareChartData = () => {
    if (!stats?.ventes_par_periode) return [];

    return stats.ventes_par_periode.map(item => ({
      date: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      quantité: item.total_quantite,
      'Chiffre affaires': item.total_ca
    }));
  };
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Les Produits',
      href: route('produits.index')
    },
    {
      title: 'Produits',
      href: route('produits.list')
    },
  ];
  const handlePrint = async () => {
    if (!selectedProduitId) return;

    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('produit_id', selectedProduitId);
      if (dateDebut) params.append('date_debut', dateDebut);
      if (dateFin) params.append('date_fin', dateFin);
      params.append('export', 'pdf');

      window.open(`${route('produits.stats')}?${params.toString()}`, '_blank');
    } finally {
      setExportLoading(false);
    }
  };

  // Filtrer les produits basé sur le terme de recherche
  const filteredProduits = produits.filter(produit =>
    produit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
      <Head title="Statistiques des produits" />
      <div className="container mx-auto p-6">

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sélection du produit */}
          <Card className="w-full md:w-1/3 flex flex-col">
            <CardHeader>
              <CardTitle>Produits</CardTitle>
              {/* Champ de recherche */}
              <div className="relative mt-2">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <div className="flex-1 overflow-hidden px-6">
              <ScrollArea className="h-full pr-3">
                <div className="space-y-2 pb-4">
                  {filteredProduits.length > 0 ? (
                    filteredProduits.map(produit => (
                      <button
                        key={produit.id}
                        className={`w-full p-3 text-left rounded-md transition-colors ${selectedProduitId === produit.id
                            ? 'bg-secondary text-card-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground'
                          }`}
                        onClick={() => setSelectedProduitId(produit.id)}
                      >
                        <div className="flex items-center gap-3">
                          {produit.avatar_url ? (
                            <img
                              src={produit.avatar_url}
                              className="w-8 h-8 rounded-full"
                              alt={produit.name.split(' ').map((n: string) => n[0]).join('')}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{produit.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {produit.description ? produit.description.slice(0, 30) + "..." : ""}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucun produit trouvé
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </Card>

          <div className='w-full md:w-2/3 '>
            {/* Filtres */}
            <Card className='mb-2'>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Filtres</CardTitle>
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    disabled={!selectedProduitId || loading || exportLoading}
                  >
                    {exportLoading ? 'Génération...' : 'Exporter en PDF'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DateRangePicker
                  dateDebut={dateDebut}
                  dateFin={dateFin}
                  setDateDebut={setDateDebut}
                  setDateFin={setDateFin}
                  resetFilters={resetFilters}
                />
              </CardContent>
            </Card>

            {/* Statistiques */}
            {stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  <StatCard title="Quantité vendue" value={stats.stats.total_vendu} icon="📦" />
                  <StatCard title="Chiffre d'affaires" value={`${FrancCongolais(parseFloat(stats.stats.chiffre_affaires))}`} icon="💰" />
                  <StatCard title="Marge bénéficiaire" value={`${FrancCongolais(parseFloat(stats.stats.marge))} `} icon="📈" />
                </div>

                {/* Graphique */}
                <Card className='mb-2'>
                  <CardHeader>
                    <CardTitle>Ventes par période</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareChartData()}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantité" fill="#3b82f6" />
                        <Bar dataKey="Chiffre affaires" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
            
          </div>

        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, icon }: { title: string, value: any, icon: any }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm font-medium">{title}</p>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value || '-'}</p>
      </CardContent>
    </Card>
  );
}

function SuccursaleChart({ ventesParSuccursale }: { ventesParSuccursale: any[] }) {
  // Préparer les données pour le graphique
  const chartData = ventesParSuccursale.map(succursale => ({
    name: succursale.nom,
    quantité: succursale.total_quantite,
    ca: parseFloat(succursale.total_ca),
    marge: parseFloat(succursale.marge)
  }));

  return (
    <Card className='mb-2'>
      <CardHeader>
        <CardTitle>Ventes par succursale</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fontSize: 12, fontWeight: 'bold', color: 'black' }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'ca' || name === 'marge') {
                  return [`${FrancCongolais(parseFloat(value as string))}`, name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar
              dataKey="quantité"
              name="Quantité vendue"
              fill="#3b82f6"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="ca"
              name="Chiffre d'affaires (FC)"
              fill="#10b981"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="marge"
              name="Marge bénéficiaire (FC)"
              fill="#8b5cf6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

