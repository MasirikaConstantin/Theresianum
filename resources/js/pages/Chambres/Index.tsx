import { Auth, Chambre, SharedData, type BreadcrumbItem } from '@/types';
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
import AppLayout from '@/layouts/app-layout';
import { Dollar, FrancCongolais } from '@/hooks/Currencies';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Chambres',
        href: '/chambres',
    },
];



export default function ChambreIndex({ auth, chambres, types, statuts }: { 
    auth: Auth;
    chambres: any;
    types: string[];
    statuts: string[];
}) {
    const { flash, filters } = usePage<SharedData & { 
        filters: { search?: string; type?: string; statut?: string } 
    }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [statutFilter, setStatutFilter] = useState(filters.statut || '');
    
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('chambres.index'), { 
                search, 
                type: typeFilter,
                statut: statutFilter
            }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, typeFilter, statutFilter]);

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleDelete = (chambre: Chambre) => {
        router.delete(route('chambres.destroy', chambre.id));
    };

    const handleStatusChange = (chambreId: number, newStatut: string) => {
        router.patch(route('chambres.update-status', chambreId), { statut: newStatut });
    };

    const getStatutBadgeVariant = (statut: string) => {
        switch (statut) {
            case 'disponible': return 'default';
            case 'occupee': return 'destructive';
            case 'nettoyage': return 'secondary';
            case 'maintenance': return 'outline';
            default: return 'secondary';
        }
    };

    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'suite': return 'default';
            case 'double': return 'secondary';
            case 'familiale': return 'outline';
            default: return 'secondary';
        }
    };

    const canCreate = auth.user.role === 'admin';
    const canUpdate = auth.user.role === 'admin';
    const canDelete = auth.user.role === 'admin';
    const canUpdateStatus = auth.user.role === 'admin' || auth.user.role === 'receptionniste';

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Chambres" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <Bed className="h-6 w-6" />
                        <h1 className="text-2xl font-bold tracking-tight">Gestion des chambres</h1>
                    </div>
                    <div className="flex gap-2 flex-col sm:flex-row">
                        <div className="flex gap-2">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les types</SelectItem>
                                    {types.map(type => (
                                        <SelectItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statutFilter} onValueChange={setStatutFilter}>
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    {statuts.map(statut => (
                                        <SelectItem key={statut} value={statut}>
                                            {statut.charAt(0).toUpperCase() + statut.slice(1)}
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
                            <Link href={route('chambres.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter une chambre
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border shadow-sm">
                    <Table>
                        <TableCaption>
                            {chambres.total > 0 ? (
                                `Affichage des chambres ${chambres.from} à ${chambres.to} sur ${chambres.total}`
                            ) : (
                                'Aucune chambre trouvée'
                            )}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Numéro</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Prix</TableHead>
                                <TableHead>Capacité</TableHead>
                                <TableHead>Équipements</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {chambres.data.map((chambre: Chambre, index: number) => (
                                <TableRow key={chambre.id}>
                                    <TableCell className="font-medium">
                                        {chambres.from + index}
                                    </TableCell>
                                    <TableCell className="font-mono font-bold">
                                        {chambre.numero}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getTypeBadgeVariant(chambre.type)}>
                                            {chambre.type.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {Dollar(chambre.prix)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <span>{chambre.capacite}</span>
                                            <span>personne(s)</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-48 truncate" title={chambre.equipements}>
                                        {chambre.equipements || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {canUpdateStatus ? (
                                            <Select 
                                                value={chambre.statut} 
                                                onValueChange={(value) => handleStatusChange(chambre.id, value)}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statuts.map(statut => (
                                                        <SelectItem key={statut} value={statut}>
                                                            {statut.charAt(0).toUpperCase() + statut.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant={getStatutBadgeVariant(chambre.statut)}>
                                                {chambre.statut.toUpperCase()}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Link href={route('chambres.show', chambre.ref)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {canUpdate && (
                                                <Link href={route('chambres.edit', chambre.ref)}>
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
                                                                Cette action supprimera définitivement la chambre 
                                                                et toutes ses réservations associées.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(chambre)}>
                                                                Supprimer
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {chambres.last_page > 1 && (
                    <div className="flex items-center justify-end">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href={chambres.prev_page_url || '#'}
                                        onClick={(e) => {
                                            if (!chambres.prev_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(chambres.prev_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!chambres.prev_page_url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {chambres.links.slice(1, -1).map((link: any, index: number) => (
                                    <PaginationItem key={index}>
                                        {link.label === '...' ? (
                                            <PaginationEllipsis />
                                        ) : (
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
                                        )}
                                    </PaginationItem>
                                ))}
                                
                                <PaginationItem>
                                    <PaginationNext 
                                        href={chambres.next_page_url || '#'}
                                        onClick={(e) => {
                                            if (!chambres.next_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(chambres.next_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!chambres.next_page_url ? 'pointer-events-none opacity-50' : ''}
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