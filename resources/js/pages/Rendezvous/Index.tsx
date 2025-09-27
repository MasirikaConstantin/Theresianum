import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Check, X, CalendarCheck, CalendarX, icons, Clock1 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rendez-vous', href: '#' },
];

const statusBadges = {
    'en_attente' : {icon : Clock1, color : 'bg-amber-200 text-amber-800', label : "En Attente"},
    'confirmé': { icon: Check, color: 'bg-green-100 text-green-800', label : 'Confirmé' },
    'annulé': { icon: X, color: 'bg-red-100 text-red-800', label : "Annulé" },
    'terminé': { icon: CalendarCheck, color: 'bg-blue-100 text-blue-800', label : "Terminé" },
    'no-show': { icon: CalendarX, color: 'bg-yellow-100 text-yellow-800', label : "Non vue" },
};

export default function RendezvouIndex({ rendezvous, auth }: { rendezvous: any; auth: any }) {
    const canEdit = rendezvous.statut === 'confirmé' || auth.user.role === 'admin';
    const canCreate = auth.user.role === 'admin' || auth.user.role === 'gerant';
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Gestion des rendez-vous" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des rendez-vous</h1>
                    {/*canCreate && <Link href={route('rendezvous.create')}>
                        <Button>
                            <Calendar className="mr-2 h-4 w-4" />
                            Nouveau rendez-vous
                        </Button>
                    </Link>*/}
                </div>

                <div className="border rounded-lg">
                    <Table>
                        <TableCaption>Les Rendez-vous</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Date/Heure</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Branche</TableHead>
                                <TableHead>Durée</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Services</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rendezvous.data.map((rdv: any, index: any) => {
                                const StatusIcon = statusBadges[rdv.statut].icon;
                                return (
                                    <TableRow key={rdv.id}>
                                        <TableCell>
                                            {rendezvous.from + index}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(rdv.date_rdv), 'PP', { locale: fr })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {rdv.client ? rdv.client.name.slice(0, 20) + '...' : 'Non spécifié'}
                                        </TableCell>
                                        <TableCell>
                                            {rdv.succursale.nom}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {rdv.heure_debut.slice(0, 5)} - {rdv.heure_fin.slice(0, 5)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusBadges[rdv.statut].color} gap-2`}>
                                                <StatusIcon className="h-3 w-3" />
                                                 {statusBadges[rdv.statut].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {JSON.parse(rdv.services).length} service(s)
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Link href={route('rendezvous.show', rdv.ref)}>
                                                <Button variant="outline" size="sm">
                                                    Voir
                                                </Button>
                                            </Link>
                                            {/*canEdit && (
                                            <Link href={route('rendezvous.edit', rdv.ref)}>
                                                <Button variant="outline" size="sm">
                                                    Modifier
                                                </Button>
                                            </Link>
                                            )*/}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {rendezvous.last_page > 1 && (
                    <div className="flex items-center justify-end">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href={rendezvous.prev_page_url || '#'}
                                        onClick={(e) => {
                                            if (!rendezvous.prev_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(rendezvous.prev_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!rendezvous.prev_page_url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {rendezvous.links.slice(1, -1).map((link: any, index: any) => {
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
                                        href={rendezvous.next_page_url || '#'}
                                        onClick={(e) => {
                                            if (!rendezvous.next_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(rendezvous.next_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!rendezvous.next_page_url ? 'pointer-events-none opacity-50' : ''}
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