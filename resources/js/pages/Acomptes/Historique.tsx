import AppLayout from '@/layouts/app-layout';
import { Auth, HistoriquePaiement, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, Eye, Search, Printer } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PaginationComponent } from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Historique des paiements',
        href: '/historique',
    },
];

export default function HistoriquePaiementIndex({ auth }: { auth: Auth }) {
    const { flash, historiquePaiements, filters } = usePage<SharedData & { 
        historiquePaiements: any, 
        filters: { search?: string } 
    }>().props;

    const [search, setSearch] = useState(filters.search || '');
    
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('acomptes.historique'), { search }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleDelete = (ref: string) => {
        router.delete(route('acomptes.destroy', ref));
    };
    const canDelete = auth.user?.role === 'admin';
    const canEdit = auth.user?.role === 'admin' || auth.user?.role === 'gerant';
    const canCreate = auth.user.role === 'admin' || auth.user.role === 'caissier';
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Historique des paiements" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Historique des paiements</h1>
                    <div className="flex gap-2">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        
                    </div>
                </div>
                <div className="rounded-lg border shadow-sm">
                    <Table>
                        <TableCaption>
                            {historiquePaiements.total > 0 ? (
                                `Affichage des historique des paiements ${historiquePaiements.from} à ${historiquePaiements.to} sur ${historiquePaiements.total}`
                            ) : (
                                'Aucune reservation trouvée'
                            )}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Compartiment</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Vendeur</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historiquePaiements.data.map((historiquePaiement: HistoriquePaiement, index: any) => (
                                <TableRow key={historiquePaiement.id}>
                                    <TableCell className="font-medium">
                                        {historiquePaiements.from + index}
                                    </TableCell>
                                    <TableCell>
                                        {historiquePaiement.reservation?.salle?.nom ||
                                            historiquePaiement.reservation?.chambre?.nom ||
                                            historiquePaiement.reservation?.espace?.nom}
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: 'USD'
                                        }).format(historiquePaiement.montant).replace('$US', '$ ')}
                                    </TableCell>
                                    <TableCell>{historiquePaiement.operateur?.name || '-'}</TableCell>
                                    <TableCell>
                                        {format(new Date(historiquePaiement.created_at), 'PP', { locale: fr })}
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Link href={route('acomptes.paiement.show', historiquePaiement.reservation.ref)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                      
                                        {canDelete && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Cette action supprimera définitivement la reservation et ne pourra pas être annulée.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(historiquePaiement.ref)}>
                                                        Supprimer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                <PaginationComponent data={historiquePaiements} />
            </div>
        </AppLayout>
    );
}