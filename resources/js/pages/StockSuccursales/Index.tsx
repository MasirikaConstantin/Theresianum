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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Stocks par Branche',
        href: '/stock-succursales',
    },
];

export default function StockSuccursaleIndex({ auth }: { auth: Auth }) {
    const { flash, stocks, produits, succursales, filters } = usePage<SharedData & { 
        stocks: any,
        produits: any[],
        succursales: any[],
        filters: any
    }>().props;

    // Initialiser les états avec les valeurs des filtres actuels
    const [search, setSearch] = useState(filters.search || '');
    const [succursaleRef, setSuccursaleRef] = useState(filters.succursale_ref || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('stock-succursales.index'), { 
                search, 
                succursale_ref: succursaleRef
            }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, succursaleRef]);

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleDelete = (ref: string) => {
        router.delete(route('stock-succursales.destroy', ref));
    };
    
    const canCreate = auth.user?.role === 'admin';
    const canUpdate = auth.user?.role === 'admin';
    const canDelete = auth.user?.role === 'admin';

    // Fonction pour gérer la navigation de pagination avec les filtres
    const handlePagination = (url: string) => {
        if (!url) return;
        
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (succursaleRef) params.append('succursale_ref', succursaleRef);
        
        // Ajouter les paramètres de filtre à l'URL de pagination
        const separator = url.includes('?') ? '&' : '?';
        const fullUrl = url + separator + params.toString();
        
        router.get(fullUrl, {}, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Stocks par Branche" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Stocks par Branche</h1>
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
                        <div className="relative w-full md:w-64">
                            <Select value={succursaleRef} onValueChange={setSuccursaleRef}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une branche" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="all">Toutes les branches</SelectItem>
                                        {succursales.map((succursale: any) => (
                                            <SelectItem key={succursale.id} value={succursale.ref}>
                                                {succursale.nom}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        {canCreate && (
                            <Link href={route('stock-succursales.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter un stock
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
                <div className="rounded-lg border shadow-sm">
                    <Table>
                        <TableCaption>
                            {stocks.total > 0 ? (
                                `Affichage des stocks ${stocks.from} à ${stocks.to} sur ${stocks.total}`
                            ) : (
                                <div className="flex items-center justify-center p-2"><p className="text-center text-muted-foreground text-xl">Aucun stock trouvé</p></div>
                            )}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Produit</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Branche</TableHead>
                                <TableHead>Quantité</TableHead>
                                <TableHead>Seuil d'alerte</TableHead>
                                <TableHead>Créé par</TableHead>
                                <TableHead>Date création</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stocks.data.map((stock: any, index: any) => (
                                <TableRow key={stock.ref}>
                                    <TableCell>{stocks.from + index}</TableCell>
                                    <TableCell className="font-medium">
                                        {stock.produit?.name || 'Produit supprimé'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={stock.produit?.type === "a_vendre" ? "default" : "destructive"}>
                                            {stock.produit?.type === "a_vendre" ? "A Vendre" : "Accessoire"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {stock.succursale?.nom || 'Branche supprimée'}
                                    </TableCell>
                                    <TableCell>
                                        <span className={stock.quantite <= stock.seuil_alerte ? 'font-bold text-red-600' : ''}>
                                            {stock.quantite}
                                            {stock.quantite <= stock.seuil_alerte && (
                                                <AlertTriangle className="ml-2 inline h-4 w-4" />
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell>{stock.seuil_alerte}</TableCell>
                                    <TableCell>
                                        {stock.user?.name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(stock.created_at), 'PP', { locale: fr })}
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Link href={route('stock-succursales.show', stock.ref)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        {canUpdate && (
                                            <Link href={route('stock-succursales.edit', stock.ref)}>
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
                                            handlePagination(stocks.prev_page_url);
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
                                                    handlePagination(link.url);
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
                                            handlePagination(stocks.next_page_url);
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