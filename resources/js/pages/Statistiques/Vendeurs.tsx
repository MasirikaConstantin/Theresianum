import { Head } from '@inertiajs/react';
import { BreadcrumbItem, PageProps } from '@/types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { format, formatISO } from 'date-fns';
import { DatePicker } from '@/components/DatePicker';
import DateRangePicker from '@/components/date-range-picker';
import { UserCheck } from 'lucide-react';
import { fr } from 'date-fns/locale';
export default function VendeursIndex({
  vendeurs,
  filters,
  auth
}: PageProps<{
  vendeurs: any[],
  filters?: any
}>) {
  const [dateDebut, setDateDebut] = useState(filters?.date_debut || '');
  const [dateFin, setDateFin] = useState(filters?.date_fin || '');
  const [selectedVendeurId, setSelectedVendeurId] = useState(filters?.vendeur_id || '');
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<{
    selectedVendeur?: any,
    stats?: any,
    ventes?: any[],
    pointages?: any[],
    conges?: any[]
  }>({});

  const fetchStats = async () => {
    if (!selectedVendeurId) {
      setStatsData({});
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('vendeur_id', selectedVendeurId);
      if (dateDebut) params.append('date_debut', dateDebut);
      if (dateFin) params.append('date_fin', dateFin);

      const response = await axios.get(route('statistiques.vendeurs.stats'), { params });

      setStatsData({
        selectedVendeur: response.data.selectedVendeur,
        stats: response.data.stats,
        ventes: response.data.ventes,
        pointages: response.data.pointages,
        conges: response.data.conges
      });

      // Mise à jour URL
      window.history.pushState(
        {},
        '',
        `${route('statistiques.vendeurs')}?${params.toString()}`
      );
    } catch (error) {
      console.error('Erreur API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedVendeurId, dateDebut, dateFin]);

  // ... reste du code similaire mais en utilisant statsData au lieu de data
  // Préparer les données pour le graphique
  const prepareChartData = () => {
    if (!statsData.ventes || !statsData.ventes.length) return [];

    return statsData.ventes.map(vente => ({
      date: new Date(vente.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      }),
      montant: parseFloat(vente.montant_total),
      produits: vente.produits?.reduce((sum: number, p: any) => sum + p.quantite, 0) || 0,
      services: vente.services?.length || 0
    }));
  };

  const resetFilters = () => {
    setDateDebut('');
    setDateFin('');
    // Optionnel: réinitialiser aussi le vendeur sélectionné si besoin
    // setSelectedVendeurId('');
  };

  const chartData = prepareChartData();

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistiques', href: route('statistiques.index') },
    { title: 'Vendeurs', href: route('statistiques.vendeurs') },
  ];
  // Ajoutez cette fonction dans votre composant
  const handlePrint = async () => {
    if (!selectedVendeurId) return;

    const params = new URLSearchParams();
    params.append('vendeur_id', selectedVendeurId);
    if (dateDebut) params.append('date_debut', dateDebut);
    if (dateFin) params.append('date_fin', dateFin);
    params.append('export', 'pdf');

    // Ouvrir le PDF dans un nouvel onglet
    window.open(`${route('statistiques.vendeurs.stats')}?${params.toString()}`, '_blank');
  };
  return (
    <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
      <Head title="Statistiques des vendeurs" />

      <div className="container mx-auto p-6">

        <div className="flex flex-col md:flex-row gap-6">
          {/* Liste des vendeurs */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Liste des vendeurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vendeurs.map(vendeur => (
                    <Button
                      key={vendeur.id}
                      variant={selectedVendeurId == vendeur.id ? 'default' : 'ghost'}
                      className={`w-full justify-start ${selectedVendeurId == vendeur.id ? 'bg-secondary text-card-foreground' : ''}`}
                      onClick={() => setSelectedVendeurId(vendeur.id)}
                    >
                      <div className="flex items-center gap-3">
                        {vendeur.avatar_url ? (
                          <img
                            src={vendeur.avatar_url}
                            className="w-8 h-8 rounded-full"
                            alt={vendeur.name.split(' ').map((n: string) => n[0]).join('')}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-gray-600" />
                          </div>
                        )}


                        <div>
                          <p>{vendeur.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {vendeur.succursale?.nom || 'Aucune branche'}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Détails et statistiques */}
          {selectedVendeurId ? (
            <div className="w-full md:w-2/3 space-y-6">
              {loading ? (
                <div className="flex justify-center">
                  <p>Chargement en cours...</p>
                </div>
              ) : statsData.selectedVendeur ? (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Filtres</CardTitle>
                        <Button onClick={handlePrint} variant="outline">
                          Exporter en PDF
                        </Button>
                      </div>

                    </CardHeader>
                    <CardContent>
                      <div className="">
                        <DateRangePicker
                          dateDebut={dateDebut}
                          dateFin={dateFin}
                          setDateDebut={setDateDebut}
                          setDateFin={setDateFin}
                          resetFilters={resetFilters}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Profil du vendeur */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        {statsData.selectedVendeur.avatar_url ? (
                          <img
                            src={statsData.selectedVendeur.avatar_url}
                            className="w-16 h-16 rounded-full"
                            alt={statsData.selectedVendeur.name}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-gray-600" />
                          </div>
                        )}

                        <div>
                          <CardTitle>{statsData.selectedVendeur.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {statsData.selectedVendeur.succursale?.nom || 'Aucune branche'}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Statistiques */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Total des ventes"
                      value={statsData.stats?.total_ventes}
                      icon="💰"
                    />
                    <StatCard
                      title="Montant total"
                      value={`${statsData.stats?.montant_total?.toLocaleString()} $`}
                      icon="💵"
                    />
                    <StatCard
                      title="Moyenne par vente"
                      value={`${parseFloat(statsData.stats?.moyenne_vente)?.toFixed(2)} $`}
                      icon="📊"
                    />
                    <StatCard
                      title="Produits vendus"
                      value={statsData.stats?.produits_vendus}
                      icon="🛍️"
                    />
                  </div>

                  {/* Graphique des ventes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Évolution des ventes</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis
                            style={{
                              fontSize: 12,
                              fontWeight: 'bold',
                              color: '#000',

                            }}
                            tick={{
                              fontSize: 12,
                              fontWeight: 'bold',
                              color: '#000',
                            }}
                          />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="montant" name="Montant ($)" fill="#3b82f6" />
                          <Bar dataKey="produits" name="Produits vendus" fill="#10b981" />
                          <Bar dataKey="services" name="Services" fill="#000" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Dernières ventes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dernières ventes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Mode de paiement</TableHead>
                            <TableHead>Produits</TableHead>
                            <TableHead>Services</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {statsData.ventes && statsData.ventes.length > 0 ? (
                            statsData.ventes.map(vente => (
                              <TableRow key={vente.id}>
                                <TableCell>
                                  {format(new Date(vente.created_at), 'PPPp', { locale: fr })}
                                </TableCell>
                                <TableCell>{vente.montant_total} $</TableCell>
                                <TableCell>{vente.mode_paiement}</TableCell>
                                <TableCell>{vente.produits.reduce((sum, p) => sum + p.quantite, 0)}</TableCell>
                                <TableCell>{vente.services.length}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center">Aucune vente trouvée</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="flex justify-center">Aucune donnée disponible</div>
              )}
            </div>
          ) : (
            <div className="w-full md:w-2/3 flex items-center justify-center">
              <p>Sélectionnez un vendeur pour voir ses statistiques</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, icon }: { title: string; value: any; icon: string }) {
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