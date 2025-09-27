import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, Eye, AlertTriangle, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Gestion des Stocks',
        href: '/stocks',
    },
];

export default function StockIndex({ auth }: { auth: Auth }) {
    const { flash, stocks, produits } = usePage<SharedData & { 
        stocks: any,
        produits: any[]
    }>().props;

    const [search, setSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('stocks.index'), { search }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleDelete = (ref: string) => {
        router.delete(route('stocks.destroy', ref));
    };

    const toggleStatus = (stock: any) => {
        router.patch(route('stocks.toggle-status', stock.ref), {
            actif: !stock.actif
        });
    };
    const canCreate = auth.user.role === 'admin' // || auth.user.role === 'gerant';
    const canUpdate = auth.user.role === 'admin' // || auth.user.role === 'gerant';
    const canDelete = auth.user.role === 'admin' // || auth.user.role === 'gerant';
    const canUpdateStatus = auth.user.role === 'admin' // || auth.user.role === 'gerant';
    const canViewallInfo = auth.user.role === 'admin' // || auth.user.role === 'gerant';
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Stocks" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des Stocks</h1>
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
                        {canCreate && (
                        <>
                        
                        <Link href={route('stocks.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter un stock
                            </Button>
                        </Link>
                        </>
                        )}
                    </div>
                </div>
                <div className="rounded-lg border shadow-sm">
                    <Table>

                        <TableCaption>
                            {stocks.total > 0 ? (
                                `Affichage des stocks ${stocks.from} à ${stocks.to} sur ${stocks.total}`
                            ) : (
                                'Aucun stock trouvé'
                            )}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Produit</TableHead>
                                <TableHead>Quantité</TableHead>
                                <TableHead>Seuil d'alerte</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Créé par</TableHead>
                                <TableHead>Date création</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stocks.data.map((stock: any, index: any) => (
                                <TableRow key={stock.id} >
                                    <TableCell>
                                        {stocks.from + index}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {stock.produit?.name || 'Produit supprimé'}
                                    </TableCell>
                                    <TableCell>
                                        <span className={stock.quantite <= stock.quantite_alerte ? 'font-bold text-red-600' : ''}>
                                            {stock.quantite}
                                            {stock.quantite <= stock.quantite_alerte && (
                                                <AlertTriangle className="ml-2 inline h-4 w-4" />
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell>{stock.quantite_alerte}</TableCell>
                                    <TableCell>
                                        <Badge variant={stock.actif ? 'default' : 'destructive'}>
                                            {stock.actif ? 'Actif' : 'Inactif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {stock.user?.name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(stock.created_at), 'PP', { locale: fr })}
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Link href={route('stocks.show', stock.ref)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        {/*canUpdate && (
                                            <Link href={route('stocks.edit', stock.ref)}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        )*/}
                                        {canUpdateStatus && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => toggleStatus(stock)}
                                        >
                                            {stock.actif ? 'Désactiver' : 'Activer'}
                                        </Button>
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
                                                        Cette action supprimera définitivement ce stock et ne pourra pas être annulée.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(stock.ref)}>
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
                
                {stocks.last_page > 1 && (
                    <div className="flex items-center justify-end">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href={stocks.prev_page_url || '#'}
                                        onClick={(e) => {
                                            if (!stocks.prev_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(stocks.prev_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!stocks.prev_page_url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {stocks.links.slice(1, -1).map((link: any, index: any) => {
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
                                        href={stocks.next_page_url || '#'}
                                        onClick={(e) => {
                                            if (!stocks.next_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(stocks.next_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!stocks.next_page_url ? 'pointer-events-none opacity-50' : ''}
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