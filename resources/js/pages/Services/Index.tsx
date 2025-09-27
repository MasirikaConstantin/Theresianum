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
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Switch } from '@/components/ui/switch';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Services',
        href: '/services',
    },
];

export default function ServiceIndex({ auth }: { auth: Auth }) {
    const { flash, services, filters } = usePage<SharedData & { 
        services: any, 
        filters: { search?: string } 
    }>().props;

    const [search, setSearch] = useState(filters.search || '');
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('services.index'), { search }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleDelete = (ref: string) => {
        router.delete(route('services.destroy', ref));
    };

    const handleStatusChange = (serviceId: number, isActive: boolean) => {
        router.patch(route('services.update-status', serviceId), { actif: isActive });
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Services" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des services</h1>
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
                        <Link href={route('services.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter un service
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="rounded-lg border shadow-sm">
                    <Table>
                        <TableCaption>
                            {services.total > 0 ? (
                                `Affichage des services ${services.from} à ${services.to} sur ${services.total}`
                            ) : (
                                'Aucun service trouvé'
                            )}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Durée</TableHead>
                                <TableHead>Prix</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Créé par</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.data.map((service: any, index: any) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">
                                        {services.from + index}
                                    </TableCell>
                                    <TableCell className="font-medium">{service.name.slice(0, 20)}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {service.description || '-'}
                                    </TableCell>
                                    <TableCell>{service.duree_minutes} min</TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: 'USD',
                                        }).format(service.prix).replace('$US', '$')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={service.actif}
                                                onCheckedChange={(checked) => handleStatusChange(service.id, checked)}
                                            />
                                            <Badge variant={service.actif ? 'default' : 'secondary'}>
                                                {service.actif ? 'Actif' : 'Inactif'}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {service.user ? (
                                            <Badge variant="outline">
                                                {service.user.name}
                                            </Badge>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Link href={route('services.show', service.ref)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={route('services.edit', service.ref)}>
                                            <Button variant="outline" size="sm">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
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
                                                        Cette action supprimera définitivement le service et ne pourra pas être annulée.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(service.ref)}>
                                                        Supprimer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                {services.last_page > 1 && (
                                    <div className="flex items-center justify-end">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious 
                                                        href={services.prev_page_url || '#'}
                                                        onClick={(e) => {
                                                            if (!services.prev_page_url) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            e.preventDefault();
                                                            router.get(services.prev_page_url, {}, {
                                                                preserveState: true,
                                                                replace: true,
                                                                preserveScroll: true
                                                            });
                                                        }}
                                                        className={!services.prev_page_url ? 'pointer-events-none opacity-50' : ''}
                                                    />
                                                </PaginationItem>
                                                
                                                {services.links.slice(1, -1).map((link: any, index: any) => {
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
                                                        href={services.next_page_url || '#'}
                                                        onClick={(e) => {
                                                            if (!services.next_page_url) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            e.preventDefault();
                                                            router.get(services.next_page_url, {}, {
                                                                preserveState: true,
                                                                replace: true,
                                                                preserveScroll: true
                                                            });
                                                        }}
                                                        className={!services.next_page_url ? 'pointer-events-none opacity-50' : ''}
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