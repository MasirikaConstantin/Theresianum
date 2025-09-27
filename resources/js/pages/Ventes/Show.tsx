import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, Eye, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const breadcrumbs = (venteRef: string): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Ventes',
        href: '/ventes',
    },
    {
        title: `Vente ${venteRef}`,
        href: '#',
    },
];

export default function VenteShow({ auth, vente, montant_produits_ttc, tva }: { auth: Auth; vente: any, montant_produits_ttc:number, tva : number }) {
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs(vente.code)}>
            <Head title={`Détails de la vente ${vente.code}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={route('ventes.index')}>
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Détails de la vente {vente.code}</h1>
                    
                </div>
                <a href={route('ventes.print', vente.id)} target="_blank">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Printer className="h-4 w-4" /> Imprimer
                        </Button>
                    </a>
                    </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations générales</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-4">
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Client</p>
                                    <Link href={route('clients.show', vente.client.ref)}>   
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" /> {vente.client?.name || 'Aucun client'}
                                    </Button>
                                    </Link>
                                    
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Branche</p>
                                    <Link href={route('succursales.show', vente.succursale.ref)}>   
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" /> {vente.succursale?.nom || 'Aucune branche'}
                                    </Button>
                                    </Link>
                                    
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Vendeur</p>
                                    <Link href={route('utilisateurs.show', vente.vendeur.ref)}>   
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" /> {vente.vendeur?.name || 'Inconnu'}
                                    </Button>
                                    </Link>
                                    
                                </div>
                            </div>
                            <div className="grid gap-4">
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                                    <p>{format(new Date(vente.created_at), 'PPPp', { locale: fr })}</p>
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Mode de paiement</p>
                                    <Badge variant="outline">
                                        {vente.mode_paiement}
                                    </Badge>
                                </div>
                                {/*<div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Remise globale</p>
                                    <p>
                                        {new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: 'USD'
                                        }).format(vente.remise).replace('$US', '$ ')}
                                    </p>
                                </div>*/}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Détails des articles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Quantité</TableHead>
                                        <TableHead>Prix unitaire</TableHead>
                                        {/*<TableHead>Remise</TableHead>*/}
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vente.items.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Badge variant={item.produit_id ? 'default' : 'secondary'}>
                                                    {item.produit_id ? 'Produit' : 'Service'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {item.produit?.name || item.service?.name}
                                            </TableCell>
                                            <TableCell>{item.quantite}</TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'USD'
                                                }).format(item.prix_unitaire).replace('$US', '$ ')}
                                            </TableCell>
                                            {/*<TableCell>
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'USD'
                                                }).format(item.remise).replace('$US', '$ ')}
                                            </TableCell>*/}
                                            <TableCell>
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'USD'
                                                }).format(item.montant_total).replace('$US', '$ ')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Récapitulatif</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium">Total articles</p>
                                <p className="font-medium">
                                    {new Intl.NumberFormat('fr-FR', {
                                        style: 'currency',
                                        currency: 'USD'
                                    }).format(vente.items.reduce((sum: number, item: any) => sum + (item.prix_unitaire * item.quantite), 0)).replace('$US', '$ ')}
                                </p>
                            </div>
                            <div className="flex justify-between items-center">
                            {/*<p className="text-sm font-medium">TVA 16 % sur les produits</p>
                                <p className="font-medium text-amber-500">
                                     {new Intl.NumberFormat('fr-FR', {
                                        style: 'currency',
                                        currency: 'USD'
                                    }).format(tva).replace('$US', '$ ')}
                                </p>
                                <p className="text-sm font-medium">Remise globale</p>
                                <p className="font-medium text-red-500">
                                    - {new Intl.NumberFormat('fr-FR', {
                                        style: 'currency',
                                        currency: 'USD'
                                    }).format(vente.remise).replace('$US', '$ ')}
                                </p>*/}
                            </div>
                            <div className="flex justify-between items-center border-t pt-2 mt-2">
                                <p className="text-lg font-bold">Montant total</p>
                                <p className="text-lg font-bold">
                                    {new Intl.NumberFormat('fr-FR', {
                                        style: 'currency',
                                        currency: 'USD'
                                    }).format(vente.montant_total).replace('$US', '$ ')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Link href={route('ventes.index')}>
                            <Button variant="outline">Retour</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}