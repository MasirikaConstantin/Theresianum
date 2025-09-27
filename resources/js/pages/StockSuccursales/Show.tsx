import AppLayout from '@/layouts/app-layout';
import { Auth, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StockSuccursaleShow({ auth, stock }: { 
    auth: Auth;
    stock: any;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Stocks par Branche',
            href: '/stock-succursales',
        },
        {
            title: 'Détails du stock',
            href: '#',
        },
    ];
    const canCreate = auth.user?.role === 'admin' ;//|| auth.user?.role === 'gerant';
    const canUpdate = auth.user?.role === 'admin' ;//|| auth.user?.role === 'gerant';
    const canDelete = auth.user?.role === 'admin' ;//|| auth.user?.role === 'gerant';
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Détails du stock en succursale" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Détails du stock</h1>
                    <div className="flex gap-2">
                        {canUpdate && (
                        <Link href={route('stock-succursales.edit', stock.ref)}>
                            <Button variant="outline">Modifier</Button>
                        </Link>
                        )}
                        <Link href={route('stock-succursales.index')}>
                            <Button variant="outline">Retour à la liste</Button>
                        </Link>
                    </div>
                </div>
                
                <div className="grid gap-6">
                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Informations de base
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                    <p className="text-sm text-muted-foreground">Produit</p>
                                    <p className="font-medium">{stock.produit?.name || 'Produit supprimé'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Branche</p>
                                    <p className="font-medium">{stock.succursale?.nom || 'Branche supprimée'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Quantité</p>
                                    <p className={`font-medium flex items-center ${
                                        stock.quantite <= stock.seuil_alerte ? 'text-red-600' : ''
                                    }`}>
                                        {stock.quantite}
                                        {stock.quantite <= stock.seuil_alerte && (
                                            <AlertTriangle className="ml-2 h-4 w-4" />
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Seuil d'alerte</p>
                                    <p className="font-medium">{stock.seuil_alerte}</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                Métadonnées
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
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
                            </CardContent>
                        <div className="grid gap-2">
                            
                            
                        </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}