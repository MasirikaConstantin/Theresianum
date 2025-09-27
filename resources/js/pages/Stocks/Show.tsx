import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface StockShowProps {
    auth: Auth;
    stock: any;
}

export default function StockShow({ auth, stock }: StockShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Stocks',
            href: '/stocks',
        },
        {
            title: 'Détails du Stock',
            href: '#',
        },
    ];
    const canUpdate = auth.user.role === 'admin' // || auth.user.role === 'gerant';
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Détails du Stock" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Détails du Stock</h1>
                    <div className="flex gap-2">
                        {canUpdate && (
                        <Link href={route('stocks.edit', stock.ref)}>
                            <Button variant="outline">Modifier</Button>
                        </Link>
                        )}
                        <Link href={route('stocks.index')}>
                            <Button variant="outline">Retour à la liste</Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader className="grid gap-6 p-6">

                        <CardTitle className="text-lg font-semibold">
                            Informations de base
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Produit</p>
                                <p className="font-medium">{stock.produit?.name || 'Produit supprimé'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Référence</p>
                                <p className="font-medium">{stock.ref}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Quantité en stock</p>
                                <p className={`font-medium flex items-center ${stock.quantite <= stock.quantite_alerte ? 'text-red-600' : ''
                                    }`}>
                                    {stock.quantite}
                                    {stock.quantite <= stock.quantite_alerte && (
                                        <AlertTriangle className="ml-2 h-4 w-4" />
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Seuil d'alerte</p>
                                <p className="font-medium">{stock.quantite_alerte}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Statut</p>
                                <Badge variant={stock.actif ? 'default' : 'destructive'}>
                                    {stock.actif ? 'Actif' : 'Inactif'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="grid gap-2">
                            <h2 className="text-lg font-semibold">Métadonnées</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Créé par</p>
                                    <p className="font-medium">{stock.user?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date de création</p>
                                    <p className="font-medium">{format(new Date(stock.created_at), 'PPpp', { locale: fr })}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Dernière modification</p>
                                    <p className="font-medium">{format(new Date(stock.updated_at), 'PPpp', { locale: fr })}</p>
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>

        </AppLayout>
    );
}