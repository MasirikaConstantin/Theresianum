import { Auth, Salle, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, Eye, Search, Users, Calendar } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Dollar, FrancCongolais } from '@/hooks/Currencies';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Espaces',
        href: '/espaces',
    },
];



export default function SalleIndex({ auth, espaces, vocations }: { 
    auth: Auth;
    espaces: any;
    vocations: string[];
}) {
    const { flash, filters } = usePage<SharedData & { 
        filters: { search?: string; vocation?: string; disponible?: string } 
    }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [vocationFilter, setVocationFilter] = useState(filters.vocation || '');
    const [disponibleFilter, setDisponibleFilter] = useState(filters.disponible || '');
    
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('espaces.index'), { 
                search, 
                vocation: vocationFilter,
                disponible: disponibleFilter
            }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, vocationFilter, disponibleFilter]);

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleDelete = (salle: Salle) => {
        router.delete(route('espaces.destroy', salle.id));
    };

    const handleStatusChange = (salleId: number, isAvailable: boolean) => {
        router.patch(route('espaces.update-status', salleId), { disponible: isAvailable });
    };

    const getVocationBadgeVariant = (vocation: string) => {
        switch (vocation) {
            case 'mixte': return 'default';
            case 'journee': return 'secondary';
            case 'nuit': return 'outline';
            default: return 'secondary';
        }
    };

    const getVocationLabel = (vocation: string) => {
        switch (vocation) {
            case 'journee': return 'Journée';
            case 'nuit': return 'Nuit';
            case 'mixte': return 'Mixte';
            default: return vocation;
        }
    };

    const canCreate = auth.user.role === 'admin';
    const canUpdate = auth.user.role === 'admin';
    const canDelete = auth.user.role === 'admin';
    const canUpdateStatus = auth.user.role === 'admin' || auth.user.role === 'receptionniste';

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Salles" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        <h1 className="text-2xl font-bold tracking-tight">Gestion des espaces</h1>
                    </div>
                    <div className="flex gap-2 flex-col sm:flex-row">
                        <div className="flex gap-2">
                            <Select value={vocationFilter} onValueChange={setVocationFilter}>
                                <SelectTrigger className="w-32">
                                <SelectValue placeholder="Vocation" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="all">Toutes</SelectItem>
                                {vocations.map(vocation => (
                                    <SelectItem key={vocation} value={vocation}>
                                    {getVocationLabel(vocation)}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>

                            <Select value={disponibleFilter} onValueChange={setDisponibleFilter}>
                                <SelectTrigger className="w-36">
                                <SelectValue placeholder="Disponibilité" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="1">Disponible</SelectItem>
                                <SelectItem value="0">Indisponible</SelectItem>
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
                            <Link href={route('espaces.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter une salle
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border shadow-sm">
                    <Table>
                        <TableCaption>
                            {espaces.total > 0 ? (
                                `Affichage des espaces ${espaces.from} à ${espaces.to} sur ${espaces.total}`
                            ) : (
                                'Aucune salle trouvée'
                            )}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Capacité</TableHead>
                                <TableHead>Vocation</TableHead>
                                <TableHead>Prix Journée</TableHead>
                                <TableHead>Prix Nuit</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {espaces.data.map((salle: Salle, index: number) => (
                                <TableRow key={salle.id}>
                                    <TableCell className="font-medium">
                                        {espaces.from + index}
                                    </TableCell>
                                    
                                    <TableCell className="font-semibold">
                                        {salle.nom}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4 text-blue-600" />
                                            <span>{salle.capacite_max} pers.</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getVocationBadgeVariant(salle.vocation)}>
                                            {getVocationLabel(salle.vocation)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold text-green-600">
                                        {Dollar(salle.prix_journee)}
                                    </TableCell>
                                    <TableCell className="font-semibold text-purple-600">
                                        {Dollar(salle.prix_nuit)}
                                    </TableCell>
                                    
                                   
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Link href={route('espaces.show', salle.ref)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {canUpdate && (
                                                <Link href={route('espaces.edit', salle.ref)}>
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
                                                                Cette action supprimera définitivement la salle 
                                                                et toutes ses réservations associées.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(salle)}>
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

                {espaces.last_page > 1 && (
                    <div className="flex items-center justify-end">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href={espaces.prev_page_url || '#'}
                                        onClick={(e) => {
                                            if (!espaces.prev_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(espaces.prev_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!espaces.prev_page_url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {espaces.links.slice(1, -1).map((link: any, index: number) => (
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
                                        href={espaces.next_page_url || '#'}
                                        onClick={(e) => {
                                            if (!espaces.next_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(espaces.next_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!espaces.next_page_url ? 'pointer-events-none opacity-50' : ''}
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