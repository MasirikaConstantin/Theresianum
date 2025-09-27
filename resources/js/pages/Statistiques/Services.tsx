import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import DateRangePicker from "@/components/date-range-picker";
import AppLayout from '@/layouts/app-layout';
import { Auth, auth, BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Package, Search, Download, TrendingUp, ShoppingCart, DollarSign, BarChart3, Scissors } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Définir le type Service
interface Service {
  id: string;
  name: string;
  ref: string;
  avatar_url: string;
  description: string;
  prix?: number;
}

interface SuccursaleStat {
  id: string;
  nom: string;
  total_quantite: number;
  total_ca: number;
  marge: number;
}

interface StatsData {
  service: any;
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

export default function ProductStats({ auth, services: initialServices = [] }: { auth: Auth; services?: Service[] }) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Charger la liste des services seulement si non fournis par les props
  useEffect(() => {
    if (initialServices.length === 0) { 
      axios.get(route('services.list'))
        .then(response => {
          if (Array.isArray(response.data)) {
            setServices(response.data);
          } else {
            console.error('Expected array but got:', response.data);
            setServices([]);
          }
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          setServices([]);
        });
    }
  }, [initialServices]);

  // Charger les stats quand les filtres changent
  useEffect(() => {
    if (!selectedServiceId) return;

    setLoading(true);
    const params = {
      service_id: selectedServiceId,
      date_debut: dateDebut,
      date_fin: dateFin
    };

    axios.get(route('services.stats'), { params })
      .then(response => {
        setStats(response.data);
        // Trouver le service sélectionné
        const service = services.find(s => s.id === selectedServiceId);
        setSelectedService(service || null);
      })
      .finally(() => setLoading(false));
  }, [selectedServiceId, dateDebut, dateFin, services]);

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
      'Chiffre affaires': item.total_ca,
      'Marge': parseFloat(stats.stats.marge) / (stats.ventes_par_periode.length || 1)
    }));
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Tableau de bord',
      href: route('dashboard')
    },
    {
      title: 'Statistiques Services',
      href: route('statistiques.index')
    },
  ];

  const handlePrint = async () => {
    if (!selectedServiceId) return;

    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('service_id', selectedServiceId);
      if (dateDebut) params.append('date_debut', dateDebut);
      if (dateFin) params.append('date_fin', dateFin);
      params.append('export', 'pdf');

      window.open(`${route('services.stats')}?${params.toString()}`, '_blank');
    } finally {
      setExportLoading(false);
    }
  };

  // Filtrer les services basé sur le terme de recherche
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.ref.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
      <Head title="Statistiques des services" />
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Panel latéral des services */}
          <Card className="w-full lg:w-1/4 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Services</CardTitle>
                <Badge variant="secondary">{filteredServices.length}</Badge>
              </div>
              {/* Champ de recherche */}
              <div className="relative mt-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher un service..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <div className="flex-1 overflow-hidden px-4">
              <ScrollArea className="h-[500px] pr-2">
                <div className="space-y-2 pb-4">
                  {filteredServices.length > 0 ? (
                    filteredServices.map(service => (
                      <button
                        key={service.id}
                        className={`w-full p-3 text-left rounded-lg transition-all duration-200 border ${
                          selectedServiceId === service.id
                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                            : 'border-border hover:border-primary hover:bg-accent/50'
                        }`}
                        onClick={() => setSelectedServiceId(service.id)}
                      >
                        <div className="flex items-center gap-3">
                          {service.avatar_url ? (
                            <img
                              src={service.avatar_url}
                              className="w-10 h-10 rounded-lg object-cover"
                              alt={service.name}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <Scissors className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{service.name}</p>
                            {service.prix && (
                              <p className="text-xs font-semibold text-green-100">
                                {parseFloat(service.prix).toFixed(2)} $
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun service trouvé</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </Card>

          {/* Contenu principal */}
          <div className='w-full lg:w-3/4 space-y-4'>
            {/* En-tête avec informations du service */}
            {selectedService && (
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {selectedService.avatar_url ? (
                      <img
                        src={selectedService.avatar_url}
                        className="w-16 h-16 rounded-lg object-cover"
                        alt={selectedService.name}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                        <Scissors className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">{selectedService.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedService.description || "Aucune description"}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        {selectedService.prix && (
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                            Prix: {parseFloat(selectedService.prix).toFixed(2)} $
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filtres et actions */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Filtres de période</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      size="sm"
                      disabled={!dateDebut && !dateFin}
                    >
                      Réinitialiser
                    </Button>
                    <Button
                      onClick={handlePrint}
                      variant="default"
                      size="sm"
                      disabled={!selectedServiceId || loading || exportLoading}
                      className="gap-2"
                    >
                      {exportLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Exporter PDF
                        </>
                      )}
                    </Button>
                  </div>
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

            {loading ? (
              // Squelette de chargement
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-8 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : stats ? (
              <>
                {/* Statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard 
                    title="Quantité vendue" 
                    value={stats.stats.total_vendu} 
                    icon={<ShoppingCart className="w-5 h-5" />}
                    trend={parseInt(stats.stats.total_vendu) > 0 ? 'up' : 'neutral'}
                  />
                  <StatCard 
                    title="Chiffre d'affaires" 
                    value={`${parseFloat(stats.stats.chiffre_affaires).toFixed(2)} $`} 
                    icon={<DollarSign className="w-5 h-5" />}
                    trend={parseFloat(stats.stats.chiffre_affaires) > 0 ? 'up' : 'neutral'}
                  />
                  
                </div>

                {/* Onglets pour différents graphiques */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview" className="gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Vue d'ensemble
                    </TabsTrigger>
                    <TabsTrigger value="succursales" className="gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Par succursale
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Évolution des ventes</CardTitle>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={prepareChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip 
                              formatter={(value, name) => {
                                if (name === 'Chiffre affaires' || name === 'Marge') {
                                  return [`${parseFloat(value as string).toFixed(2)}$`, name];
                                }
                                return [value, name];
                              }}
                            />
                            <Legend />
                            <Line 
                              yAxisId="left"
                              type="monotone" 
                              dataKey="quantité" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line 
                              yAxisId="right"
                              type="monotone" 
                              dataKey="Chiffre affaires" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="succursales" className="mt-4">
                    <SuccursaleChart ventesParSuccursale={stats.ventes_par_succursale} />
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              // État vide quand aucun service n'est sélectionné
              <Card className="text-center py-12">
                <CardContent>
                  <Scissors className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun service sélectionné</h3>
                  <p className="text-muted-foreground">
                    Veuillez sélectionner un service dans la liste pour voir ses statistiques
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: any, icon: React.ReactNode, trend?: 'up' | 'down' | 'neutral' }) {
  const trendColors = {
    up: 'text-green-100',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value || '0'}</p>
          </div>
          <div className={`p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors ${trendColors[trend || 'neutral']}`}>
            {icon}
          </div>
        </div>
        {trend && trend !== 'neutral' && (
          <div className={`flex items-center mt-2 text-sm ${trendColors[trend]}`}>
            {trend === 'up' ? '↗' : '↘'} {trend === 'up' ? 'Augmentation' : 'Diminution'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SuccursaleChart({ ventesParSuccursale }: { ventesParSuccursale: any[] }) {
  const chartData = ventesParSuccursale.map(succursale => ({
    name: succursale.nom,
    quantité: succursale.total_quantite,
    ca: parseFloat(succursale.total_ca),
    marge: parseFloat(succursale.marge)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance par succursale</CardTitle>
      </CardHeader>
      <CardContent className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12, fontWeight: 'bold' }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'ca' || name === 'marge') {
                  return [`${parseFloat(value as string).toFixed(2)}$`, 
                    name === 'ca' ? "Chiffre d'affaires" : "Marge bénéficiaire"];
                }
                return [value, "Quantité vendue"];
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
              name="Chiffre d'affaires"
              fill="#10b981"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="marge"
              name="Marge bénéficiaire"
              fill="#8b5cf6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}