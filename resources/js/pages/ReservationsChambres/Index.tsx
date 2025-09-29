import AppLayout from '@/layouts/app-layout';
import { Auth, Reservation, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, Eye, Search, Bed } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dollar } from '@/hooks/Currencies';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PaginationComponent } from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Réservations Chambres',
        href: '/reservations-chambres',
    },
];


export default function ReservationChambreIndex({ auth, reservations, statuts }: { 
    auth: Auth;
    reservations: any;
    statuts: string[];
}) {
    const { flash, filters } = usePage<SharedData & { 
        filters: { search?: string; statut?: string } 
    }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [statutFilter, setStatutFilter] = useState(filters.statut || '');
    
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('chambres-reservations.index'), { 
                search, 
                statut: statutFilter
            }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, statutFilter]);

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleDelete = (reservation: Reservation) => {
        router.delete(route('chambres-reservations.destroy', reservation.id));
    };

    const handleStatusChange = (reservationId: number, newStatut: string) => {
        router.patch(route('reservations.update-status', reservationId), { statut: newStatut });
    };

    const getStatutBadgeVariant = (statut: string) => {
        switch (statut) {
            case 'confirmee': return 'default';
            case 'en_attente': return 'secondary';
            case 'annulee': return 'destructive';
            case 'terminee': return 'outline';
            default: return 'secondary';
        }
    };

    const getDuree = (dateDebut: string, dateFin: string) => {
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        return Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 3600 * 24));
    };

    const formatDate = (dateTime: string) => {
        const date = new Date(dateTime);
        return format(date, 'PPP', { locale: fr });
    };

    const canCreate = auth.user.role === 'admin' || auth.user.role === 'receptionniste';
    const canUpdate = auth.user.role === 'admin' || auth.user.role === 'receptionniste';
    const canDelete = auth.user.role === 'admin';
    const canUpdateStatus = auth.user.role === 'admin' || auth.user.role === 'receptionniste';

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Réservations des Chambres" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <Bed className="h-6 w-6" />
                        <h1 className="text-2xl font-bold tracking-tight">Réservations des chambres</h1>
                    </div>
                    <div className="flex gap-2 flex-col sm:flex-row">
                        <div className="flex gap-2">
                            <Select value={statutFilter} onValueChange={setStatutFilter}>
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous</SelectItem>
                                    {statuts.map(statut => (
                                        <SelectItem key={statut} value={statut}>
                                            {statut === 'confirmee' ? 'Confirmée' : 
                                             statut === 'en_attente' ? 'En attente' :
                                             statut === 'annulee' ? 'Annulée' : 'Terminée'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        
                        {canCreate && (
                            <Link href={route('chambres-reservations.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nouvelle réservation
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border shadow-sm">
                    <Table>
                        <TableCaption>
                            {reservations.total > 0 ? (
                                `Affichage des réservations ${reservations.from} à ${reservations.to} sur ${reservations.total}`
                            ) : (
                                'Aucune réservation trouvée'
                            )}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Chambre</TableHead>
                                <TableHead>Période</TableHead>
                                <TableHead>Durée</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservations.data.map((reservation: Reservation, index: number) => {
                                const duree = getDuree(reservation.date_debut, reservation.date_fin);
                                const dateDebut = formatDate(reservation.date_debut);
                                const dateFin = formatDate(reservation.date_fin);
                                
                                return (
                                    <TableRow key={reservation.id}>
                                        <TableCell className="font-medium">
                                            {reservations.from + index}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    {reservation.client.prenom} {reservation.client.nom}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {reservation.client.telephone}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    Chambre {reservation.chambre.numero}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {reservation.chambre.type}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    <strong>Arrivée:</strong> {dateDebut} (14:00)
                                                </div>
                                                <div className="text-sm">
                                                    <strong>Départ:</strong> {dateFin} (12:00)
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {duree} journée(s)
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {Dollar(reservation.prix_total)}
                                        </TableCell>
                                        <TableCell>
                                            {canUpdateStatus && reservation.statut !== 'terminee' && reservation.statut !== 'annulee' ? (
                                                <Select 
                                                    value={reservation.statut} 
                                                    onValueChange={(value) => handleStatusChange(reservation.id, value)}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statuts.map(statut => (
                                                            <SelectItem key={statut} value={statut}>
                                                                {statut === 'confirmee' ? 'Confirmée' : 
                                                                 statut === 'en_attente' ? 'En attente' :
                                                                 statut === 'annulee' ? 'Annulée' : 'Terminée'}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant={getStatutBadgeVariant(reservation.statut)}>
                                                    {reservation.statut === 'confirmee' ? 'Confirmée' : 
                                                     reservation.statut === 'en_attente' ? 'En attente' :
                                                     reservation.statut === 'annulee' ? 'Annulée' : 'Terminée'}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Link href={route('chambres-reservations.show', reservation.ref)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {canUpdate && (
                                                    <Link href={route('chambres-reservations.edit', reservation.ref)}>
                                                        <Button variant="outline" size="sm">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
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
                                                                    Cette action supprimera définitivement la réservation 
                                                                    et toutes ses occupations associées.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(reservation)}>
                                                                    Supprimer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <PaginationComponent data={reservations} />
            </div>
        </AppLayout>
    );
}