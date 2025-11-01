import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, Eye, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Clients',
        href: '/clients',
    },
];

export default function ClientIndex({ auth }: { auth: Auth }) {
    const { flash, clients, filters } = usePage<SharedData & { 
        clients: any, 
        filters: { search?: string } 
    }>().props;

    const [search, setSearch] = useState(filters.search || '');
    // Délai pour la recherche
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('clients.index'), { search }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleDelete = (ref: string) => {
        router.delete(route('clients.destroy', ref));
    };
    const canUpdate = auth.user.role === "admin" || auth.user.role === "gerant";
    const canDelete = auth.user.role === "admin" ;
    const canCreate = auth.user.role === "admin" || auth.user.role === "gerant" || auth.user.role === "caissier";
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des clients</h1>
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
                        {canCreate &&(
                            <Link href={route('clients.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter un client
                                </Button>
                            </Link>
                        )}
                        
                    </div>
                </div>
                <div className="rounded-lg border shadow-sm">
                    <Table>
                        <TableCaption>
                            {clients.total > 0 ? (
                                `Affichage des clients ${clients.from} à ${clients.to} sur ${clients.total}`
                            ) : (
                                'Aucun client trouvé'
                            )}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Téléphone</TableHead>
                                <TableHead>Enregistré par</TableHead>
                                <TableHead>Date de naissance</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.data.map((client: any, index: any) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">
                                        {clients.from + index}
                                    </TableCell>
                                    <TableCell>{client.telephone?.slice(0, 15) || '-'}</TableCell>
                                   
                                    <TableCell>
                                        {client.enregistre_par ? (
                                            <Badge variant="outline">
                                                {client.enregistre_par?.name}
                                            </Badge>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        { client.date_naissance && format(new Date(client.date_naissance), 'PP', { locale: fr })}
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Link href={route('clients.show', client.ref)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        {canUpdate &&(
                                            <Link href={route('clients.edit', client.ref)}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        )}
                                        {canDelete &&(
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
                                                            Cette action supprimera définitivement le client et ne pourra pas être annulée.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(client.ref)}>
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
                
                {clients.last_page > 1 && (
                    <div className="flex items-center justify-end">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href={clients.prev_page_url || '#'}
                                        onClick={(e) => {
                                            if (!clients.prev_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(clients.prev_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!clients.prev_page_url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {clients.links.slice(1, -1).map((link: any, index: any) => {
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
                                        href={clients.next_page_url || '#'}
                                        onClick={(e) => {
                                            if (!clients.next_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(clients.next_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!clients.next_page_url ? 'pointer-events-none opacity-50' : ''}
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