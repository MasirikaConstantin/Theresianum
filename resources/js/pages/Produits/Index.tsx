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
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { FrancCongolais } from '@/hooks/Currencies';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Produits',
        href: '/produits',
    },
];

export default function ProduitIndex({ auth }: { auth: Auth }) {
    const { flash, produits, filters } = usePage<SharedData & { 
        produits: any, 
        filters: { search?: string } 
    }>().props;

    const [search, setSearch] = useState(filters.search || '');
    
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('produits.index'), { search }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleDelete = (ref: string) => {
        router.delete(route('produits.destroy', ref));
    };

    const handleStatusChange = (produitId: number, isActive: boolean) => {
        router.patch(route('produits.update-status', produitId), { actif: isActive });
    };
    const canCreate = auth.user.role === 'admin' ;
    const canUpdate = auth.user.role === 'admin' ;
    const canDelete = auth.user.role === 'admin' ;
    const canUpdateStatus = auth.user.role === 'admin' ;
    const canViewallInfo = auth.user.role === 'admin' ;
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Produits" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des produits</h1>
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
                            <Link href={route('produits.create')}>
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
                            {produits.total > 0 ? (
                                `Affichage des produits ${produits.from} à ${produits.to} sur ${produits.total}`
                            ) : (
                                'Aucun produit trouvé'
                            )}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                {/*<TableHead>Image</TableHead>*/}
                                <TableHead>Nom</TableHead>
                                {canViewallInfo && (
                                <TableHead>Prix Achat</TableHead>
                                )}
                                <TableHead>Prix Vente</TableHead>
                                <TableHead>Statut</TableHead>
                                {canViewallInfo && (
                                <>
                                <TableHead>Marge</TableHead>
                                <TableHead>Catégorie</TableHead>
                                
                                <TableHead>Actions</TableHead>
                                </>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {produits.data.map((produit: any, index: any) => {
                                const marge = produit.prix_vente - produit.prix_achat;
                                const margePourcentage = (marge / produit.prix_achat) * 100;
                                
                                return (
                                    <TableRow key={produit.id}>
                                        <TableCell className="font-medium">
                                            {produits.from + index}
                                        </TableCell>
                                        
                                        <TableCell className="font-medium">{produit.name}</TableCell>
                                        {canViewallInfo && (
                                        <TableCell>
                                            {FrancCongolais(produit.prix_achat)}
                                        </TableCell>
                                        )}
                                        <TableCell>
                                            {FrancCongolais(produit.prix_vente)}
                                        </TableCell>
                                        
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
                                            <Badge variant={marge >= 0 ? 'default' : 'destructive'}>
                                                {FrancCongolais(marge)} ({margePourcentage.toFixed(2)}%)
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {produit.categorie ? (
                                                <Badge variant="outline">
                                                    {produit.categorie.nom}
                                                </Badge>
                                            ) : '-'}
                                        </TableCell></>
                                        )}
                                        
                                        <TableCell className="flex gap-2">
                                            {canViewallInfo && (
                                            <Link href={route('produits.show', produit.ref)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            )}
                                            {canUpdate && ( 
                                            <Link href={route('produits.edit', produit.ref)}>
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
                
                {produits.last_page > 1 && (
                    <div className="flex items-center justify-end">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href={produits.prev_page_url || '#'}
                                        onClick={(e) => {
                                            if (!produits.prev_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(produits.prev_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!produits.prev_page_url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {produits.links.slice(1, -1).map((link: any, index: any) => {
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
                                        href={produits.next_page_url || '#'}
                                        onClick={(e) => {
                                            if (!produits.next_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(produits.next_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!produits.next_page_url ? 'pointer-events-none opacity-50' : ''}
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