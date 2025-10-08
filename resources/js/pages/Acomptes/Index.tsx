import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, Vente, type BreadcrumbItem } from '@/types';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Acomptes',
        href: '/acomptes',
    },
];

export default function VenteIndex({ auth }: { auth: Auth }) {
    const { flash, reservations, filters } = usePage<SharedData & { 
        reservations: any, 
        filters: { search?: string } 
    }>().props;

    const [search, setSearch] = useState(filters.search || '');
    
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('acomptes.index'), { search }, {
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
            <Head title="Acomptes" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des reservations non payées</h1>
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
                            {reservations.total > 0 ? (
                                `Affichage acomptes ${reservations.from} à ${reservations.to} sur ${reservations.total}`
                            ) : (
                                'Aucun acompte trouvé'
                            )}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Vendeur</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservations.data.map((reservation: any, index: any) => (
                                <TableRow key={reservation.id}>
                                    <TableCell className="font-medium">
                                        {reservations.from + index}
                                    </TableCell>
                                    <TableCell>{reservation.client?.name || '-'}</TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: 'USD'
                                        }).format(reservation.prix_total).replace('$US', '$ ')}
                                    </TableCell>
                                    <TableCell>{reservation.operateur?.name || '-'}</TableCell>
                                    <TableCell>
                                        {format(new Date(reservation.created_at), 'PP', { locale: fr })}
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Link href={route('acomptes.show', reservation.ref)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        
                                        <a href={route('reservations.print', reservation.ref)} target="_blank" rel="noopener noreferrer">
                                            <Button variant="default" size="sm">
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </a>

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
                                                        Cette action supprimera définitivement la vente et ne pourra pas être annulée.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(reservation.ref)}>
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
                
                {reservations.last_page > 1 && (
                    <div className="flex items-center justify-end">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href={reservations.prev_page_url || '#'}
                                        onClick={(e) => {
                                            if (!reservations.prev_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(reservations.prev_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!reservations.prev_page_url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {reservations.links.slice(1, -1).map((link: any, index: any) => {
                                    if (link.label === '...') {
                                        return (
                                            <PaginationItem key={index}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }
                                    return (
                                        <PaginationItem key={index}>
                                            <PaginationLink
                                                href={link.url || '#'}
                                                onClick={(e) => {
                                                    if (!link.url) {
                                                        e.preventDefault();
                                                        return;
                                                    }
                                                    e.preventDefault();
                                                    router.get(link.url, {}, {
                                                        preserveState: true,
                                                        replace: true,
                                                        preserveScroll: true
                                                    });
                                                }}
                                                isActive={link.active}
                                            >
                                                {link.label}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}
                                
                                <PaginationItem>
                                    <PaginationNext 
                                        href={reservations.next_page_url || '#'}
                                        onClick={(e) => {
                                            if (!reservations.next_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(reservations.next_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!reservations.next_page_url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}