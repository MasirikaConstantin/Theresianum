import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, TrendingUp, ShoppingCart, Gift, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis } from 'recharts';
import { FrancCongolais } from '@/hooks/Currencies';

const breadcrumbs = (clientName: string): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Clients',
        href: '/clients',
    },
    {
        title: `Détails de ${clientName}`,
        href: '#',
    },
];

// Configuration des couleurs pour les graphiques
const chartConfig = {
    ventes: {
        label: "Ventes",
        color: "hsl(var(--chart-1))",
    },
    montant: {
        label: "Montant",
        color: "hsl(var(--chart-2))",
    },
    quantite: {
        label: "Quantité",
        color: "hsl(var(--chart-3))",
    },
    remise: {
        label: "Remise",
        color: "hsl(var(--chart-4))",
    },
    promotion: {
        label: "Promotion",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ClientShow({ 
    auth, 
    client, 
    ventesParMois, 
    produitsPopulaires, 
    modesPaiement, 
    evolutionFidelite,
    statistiquesGenerales 
}: { 
    auth: Auth; 
    client: any;
    ventesParMois: any[];
    produitsPopulaires: any[];
    modesPaiement: any[];
    evolutionFidelite: any[];
    statistiquesGenerales: any;
}) {
    const canUpdate = auth.user.role === "admin" || auth.user.role === "gerant";
    
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs(client.telephone)}>
            <Head title={`Détails de ${client.telephone}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 overflow-auto">
                <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    
                    <h1 className="text-2xl font-bold tracking-tight">Détails de {client.telephone}</h1>
                </div>
                <div className="flex justify-end gap-2">
                        <Link href={route('clients.index')}>
                            <Button variant="outline">Retour</Button>
                        </Link>
                        {canUpdate &&(
                            <Link href={route('clients.edit', client.ref)}>
                                <Button>Modifier</Button>
                            </Link>
                        )}
                    </div>
                </div>
                {/* Informations du client */}
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations principales</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-4">
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                                    <p>{client.name}</p>
                                </div>
                                {client.telephone && (
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                                        <p>{client.telephone}</p>
                                    </div>
                                )}
                                
                                {client.date_naissance && (
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
                                        <p>{format(new Date(client.date_naissance), 'PPP', { locale: fr })} ({client.age}) ans</p>
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-4">
                                {client.email && (
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p>{client.email}</p>
                                    </div>
                                )}
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Enregistré par</p>
                                    <p>
                                        {client.enregistre_par ? (
                                            <Link href={route('utilisateurs.show', client.enregistre_par.ref)}>
                                                <Badge variant="outline">
                                                    {client.enregistre_par?.name}
                                                </Badge>
                                            </Link>
                                        ) : (
                                            'Système'
                                        )}
                                    </p>
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                                    <p>{format(new Date(client.created_at), 'PPPp', { locale: fr })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {client.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-line">{client.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                   
                </div>
                {/* Cartes de statistiques générales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total des achats</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistiquesGenerales?.total_achats || 0}</div>
                           
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Points fidélité</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{client.fidelite?.points || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {client.fidelite?.nombre_achats || 0} achats
                            </p>
                        </CardContent>
                    </Card>
                    
                    {/*<Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Remises obtenues</CardTitle>
                            <Gift className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistiquesGenerales?.total_remises_format || '0 FC'}</div>
                            <p className="text-xs text-muted-foreground">
                                Économies totales
                            </p>
                        </CardContent>
                    </Card>*/}
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dernier achat</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {client.fidelite?.dernier_achat ? 
                                    format(new Date(client.fidelite.dernier_achat), 'PPP', { locale: fr }) : 
                                    'Jamais'
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {client.fidelite?.dernier_achat ? 
                                    format(new Date(client.fidelite.dernier_achat), 'yyyy', { locale: fr }) : 
                                    ''
                                }
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Graphiques */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Évolution des ventes par mois */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Évolution des achats</CardTitle>
                            <CardDescription>
                                Montant des achats par mois sur les 12 derniers mois
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig}>
                                <AreaChart
                                    accessibilityLayer
                                    data={ventesParMois}
                                    margin={{
                                        left: 12,
                                        right: 12,
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="mois"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="line" />}
                                    />
                                    <Area
                                        dataKey="montant"
                                        type="natural"
                                        fill="var(--color-montant)"
                                        fillOpacity={0.4}
                                        stroke="var(--color-montant)"
                                        stackId="a"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter>
                            <div className="flex w-full items-start gap-2 text-sm">
                                <div className="grid gap-2">
                                    <div className="flex items-center gap-2 font-medium leading-none">
                                        Tendance sur les 12 derniers mois
                                    </div>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Modes de paiement */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Modes de paiement préférés</CardTitle>
                            <CardDescription>
                                Répartition des modes de paiement utilisés
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={chartConfig}
                                className="mx-auto aspect-square max-h-[250px]"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={modesPaiement}
                                        dataKey="count"
                                        nameKey="mode_paiement"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                    >
                                        {modesPaiement.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Produits les plus achetés */}
                    <Card>
  <CardHeader>
    <CardTitle>Produits favoris</CardTitle>
    <CardDescription>Top 5 des produits les plus achetés</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="h-[300px]">
      <BarChart
        data={produitsPopulaires}
        layout="vertical"
        margin={{ left: 60, right: 20 }}
        width={600}
        height={300}
      >
        <CartesianGrid horizontal={false} stroke="#f0f0f0" />
        <YAxis
          dataKey="produit_nom"
          type="category"
          tickLine={false}
          axisLine={false}
          width={120}
          tick={{ fill: '#000' }}
        />
        <XAxis 
          type="number" 
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#000' }}
        />
        <Bar
          dataKey="quantite_totale"
          fill="#0088FE"
          radius={[0, 4, 4, 0]} // Arrondi à droite seulement
          animationDuration={1500}
        />
      </BarChart>
    </div>
  </CardContent>
</Card>

                    {/* Évolution des points de fidélité */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Évolution fidélité</CardTitle>
                            <CardDescription>
                                Progression des points de fidélité au fil du temps
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig}>
                                <LineChart
                                    accessibilityLayer
                                    data={evolutionFidelite}
                                    margin={{
                                        left: 12,
                                        right: 12,
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Line
                                        dataKey="points_cumules"
                                        type="monotone"
                                        stroke="#0088FE"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

               
            </div>
        </AppLayout>
    );
}