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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Utilitaires',
        href: '/utilitaires',
    },
];

export default function UtilitaireIndex({ auth }: { auth: Auth }) {
    const { flash, utilitaires, filters } = usePage<SharedData & { 
        utilitaires: any, 
        filters: { search?: string } 
    }>().props;

    const [search, setSearch] = useState(filters.search || '');
    
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('utilitaires.index'), { search }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleDelete = (ref: string) => {
        router.delete(route('utilitaires.destroy', ref));
    };

    const handleStatusChange = (produitId: number, isActive: boolean) => {
        router.patch(route('produits.update-status', produitId), { actif: isActive });
    };
    const canCreate = auth.user.role === 'admin' ;//|| auth.user.role === 'gerant';
    const canUpdate = auth.user.role === 'admin' ;//|| auth.user.role === 'gerant';
    const canDelete = auth.user.role === 'admin' ;//|| auth.user.role === 'gerant';
    const canUpdateStatus = auth.user.role === 'admin' ;//|| auth.user.role === 'gerant';
    const canViewallInfo = auth.user.role === 'admin' ;//|| auth.user.role === 'gerant';
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Utilitaires" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des utilitaires</h1>
                    <div className="flex gap-2">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-9 "
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {canCreate && ( 
                            <Link href={route('utilitaires.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter un produit
                                </Button>
                        </Link>
                        )}
                    </div>
                </div>
                <div className="rounded-lg border shadow-sm">
                    <Table>
                        <TableCaption>
                            {utilitaires.total > 0 ? (
                                `Affichage des utilitaires ${utilitaires.from} à ${utilitaires.to} sur ${utilitaires.total}`
                            ) : (
                                'Aucun produit trouvé'
                            )}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Statut</TableHead>
                                {canViewallInfo && (
                                <>
                                <TableHead>Créé par</TableHead>
                                </>
                                )}
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {utilitaires.data.map((produit: any, index: any) => {
                                
                                return (
                                    <TableRow key={produit.id}>
                                        <TableCell className="font-medium">
                                            {utilitaires.from + index}
                                        </TableCell>
                                        
                                        <TableCell className="font-medium">{produit.name}</TableCell>
                                       
                                        
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {canUpdateStatus && (
                                                <Switch
                                                    checked={produit.actif}
                                                    onCheckedChange={(checked) => handleStatusChange(produit.id, checked)}
                                                />
                                                )}
                                                <Badge variant={produit.actif ? 'default' : 'secondary'}>
                                                    {produit.actif ? 'Actif' : 'Inactif'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        {canViewallInfo && (
                                       <>
                                        
                                        <TableCell>
                                            {produit.user ? (
                                                <Badge variant="outline">
                                                    {produit.user.name}
                                                </Badge>
                                            ) : '-'}
                                        </TableCell></>
                                        )}
                                        
                                        <TableCell className="flex gap-2">
                                            <Link href={route('utilitaires.show', produit.ref)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {canUpdate && ( 
                                            <Link href={route('utilitaires.edit', produit.ref)}>
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
                                                            Cette action supprimera définitivement le produit et ne pourra pas être annulée.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(produit.ref)}>
                                                            Supprimer
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                
                {utilitaires.last_page > 1 && (
                    <div className="flex items-center justify-end">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href={utilitaires.prev_page_url || '#'}
                                        onClick={(e) => {
                                            if (!utilitaires.prev_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(utilitaires.prev_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!utilitaires.prev_page_url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {utilitaires.links.slice(1, -1).map((link: any, index: any) => {
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
                                        href={utilitaires.next_page_url || '#'}
                                        onClick={(e) => {
                                            if (!utilitaires.next_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(utilitaires.next_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!utilitaires.next_page_url ? 'pointer-events-none opacity-50' : ''}
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