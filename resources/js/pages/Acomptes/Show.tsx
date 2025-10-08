import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, Eye, PlusCircle, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = (venteRef: string): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Acomptes',
        href: '/acomptes',
    },
    {
        title: `Acompte ${venteRef}`,
        href: '#',
    },
];

export default function VenteShow({ auth, reservation, montant_produits_ttc, tva }: { auth: Auth; reservation: any, montant_produits_ttc:number, tva : number }) {

    const paiementFait = reservation.montant_payer === reservation.montant_total;

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs(reservation.code)}>
            <Head title={`Détails de la reservation ${reservation.code}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={route('acomptes.index')}>
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Détails de la reservation {reservation.code}</h1>
                    
                </div>
                {!paiementFait && (
                <a href={route('acomptes.paiement.show', reservation.ref)}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" /> Ajouter un paiement
                        </Button>
                </a>
                )}
                <a href={route('ventes.print', reservation.id)} target="_blank">
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
                                    <Link href={route('clients.show', reservation.client.ref)}>   
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" /> {reservation.client?.name || 'Aucun client'}
                                    </Button>
                                    </Link>
                                    
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Vendeur</p>
                                    <Link href={route('utilisateurs.show', reservation.operateur.ref)}>   
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" /> {reservation.operateur?.name || 'Inconnu'}
                                    </Button>
                                    </Link>
                                    
                                </div>
                            </div>
                            <div className="grid gap-4">
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                                    <p>{format(new Date(reservation.created_at), 'PPPp', { locale: fr })}</p>
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Mode de paiement</p>
                                    <Badge variant="outline">
                                        {reservation.type_paiement=='cash' ? 'Espèces' : reservation.type_paiement=='card' ? 'Carte' : 'Chèque'}
                                    </Badge>
                                </div>
                                
                            </div>
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
                                    }).format(reservation.prix_total).replace('$US', '$ ')}
                                </p>
                                
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium">Montant payé</p>
                                <p className="font-medium">
                                    {new Intl.NumberFormat('fr-FR', {
                                        style: 'currency',
                                        currency: 'USD'
                                    }).format(reservation.montant_payer).replace('$US', '$ ')}
                                </p>
                                
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium">Montant Restant</p>
                                <p className="font-medium">
                                    {new Intl.NumberFormat('fr-FR', {
                                        style: 'currency',
                                        currency: 'USD'
                                    }).format(reservation.prix_total - reservation.montant_payer).replace('$US', '$ ')}
                                </p>
                                
                            </div>
                            <div className="flex justify-between items-center border-t pt-2 mt-2">
                                <p className="text-lg font-bold">Montant total</p>
                                <p className="text-lg font-bold">
                                    {new Intl.NumberFormat('fr-FR', {
                                        style: 'currency',
                                        currency: 'USD'
                                    }).format(reservation.prix_total).replace('$US', '$ ')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    

                    

                    <div className="flex justify-end gap-2">
                        <Link href={route('acomptes.index')}>
                            <Button variant="outline">Retour</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}