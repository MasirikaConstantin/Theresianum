import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Calendar, Wallet, Lock, LockOpen, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Auth, auth, BreadcrumbItem, Vente } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Caisse {
    id: number;
    ref: string;
    solde: string;
    statut: string;
    date_ouverture: string;
    date_fermeture?: string;
    succursale?: {
        id: number;
        nom: string;
    };
}

interface Stats {
    transactions_jour: number;
    montant_total_jour: string;
    moyenne_transaction: string;
}

interface Props {
    caisse: Caisse;
    stats: Stats;
    auth: Auth;
    transactions: Vente[];
}
export default function CaisseShow({ caisse, stats, auth, transactions }: Props) {
console.log(transactions);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Gestion des caisses',
            href: '/caisses',
        },
        {
            title: `Caisse ${caisse.succursale?.nom}`,
            href: `/caisses/${caisse.ref}`,
        },
    ];
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Caisse ${caisse.succursale?.nom}`} />
            
            <div className="container py-6 px-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wallet className="h-6 w-6" />
                        Détails de la caisse {caisse.succursale?.nom}
                    </h1>
                    <Button variant="outline" asChild>
                        <Link href={route('caisses.index')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Solde actuel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(parseFloat(caisse.solde)).replace('$US', '$')}
                            </div>
                            <Badge className="mt-2" variant={caisse.statut === 'ouverte' ? 'default' : 'secondary'}>
                                {caisse.statut === 'ouverte' ? (
                                    <LockOpen className="h-3 w-3 mr-1" />
                                ) : (
                                    <Lock className="h-3 w-3 mr-1" />
                                )}
                                {caisse.statut}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Transactions aujourd'hui</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.transactions_jour}</div>
                            <div className="text-sm text-muted-foreground mt-2">
                                Total: {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(parseFloat(stats.montant_total_jour)).replace('$US', '$')}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Moyenne par transaction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'USD'
                            }).format(parseFloat(stats.moyenne_transaction)).replace('$US', '$')}</div>
                            <Progress 
                                value={(parseFloat(stats.moyenne_transaction) / 1000) * 100} 
                                className="h-2 mt-2" 
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Informations générales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Building className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Branche</p>
                                    <p>{caisse.succursale?.nom || 'Non attribuée'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Date d'ouverture</p>
                                    <p>{format(new Date(caisse.date_ouverture), 'PPP', { locale: fr })}</p>
                                </div>
                            </div>
                            {caisse.date_fermeture && (
                                <div className="flex items-center gap-4">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date de fermeture</p>
                                        <p>{format(new Date(caisse.date_fermeture), 'PPP', { locale: fr })}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Activité récente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Exemple de transactions - à remplacer par vos données */}
                                {transactions.map((transaction) => (
                                    <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                                        <div>
                                            <p className="font-medium">Transaction #{transaction.code}</p>
                                            <p className="text-sm text-muted-foreground">{transaction.created_at}</p>
                                            <Button variant="link" asChild>
                                                <Link href={route('ventes.show', transaction.ref)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Voir
                                                </Link>
                                            </Button>
                                        </div>
                                        <div className="font-medium">
                                            +{(transaction.montant_total).toFixed(2)} $
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}