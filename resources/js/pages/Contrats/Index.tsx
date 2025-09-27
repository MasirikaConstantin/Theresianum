import { Auth, PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, MoreVertical, Pencil, PlusCircle, Search, Trash2 } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PaginationComponent } from '@/components/Pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Contrat {
    id: number;
    
    ref: string;
    duree: string;
    date_debut: string;
    date_fin: string | null;
    type_contrat: string;
    fonction: string;
    is_active: boolean;
    agent: {
        nom: string;
        postnom: string;
        prenom: string;
    };
    succursale?: {
        nom: string;
    };
}

export default function Index({  }: PageProps) {
    const { auth, contrats, filters } = usePage<{ 
        auth: Auth;
        contrats: { data: Contrat[]; links: any[], from: number };
        filters: { search?: string };
    }>().props;

    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('contrats.index'), { search }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);
    const deleteContrat = (id: number) => {
        router.delete(route('contrats.destroy', id));
        toast.success('Contrat supprimé avec succès');
    };
    return (
        <AppLayout  
            auth={auth}
            breadcrumbs={[
                {
                    title: 'Gestion des Contrats',
                    href: '/contrats',
                },
            ]}
        >
            <Head title="Gestion des Contrats" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des Contrats</h1>
                    <div className="flex gap-2">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="search"
                                placeholder="Rechercher un contrat..."
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Link href={route('contrats.create')}>
                                <Button>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Nouveau Contrat
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border shadow-sm">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Agent</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Fonction</TableHead>
                                            <TableHead>Date Début</TableHead>
                                            <TableHead>Date Fin</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contrats.data.map((contrat, index) => (
                                            <TableRow key={contrat.id}>
                                                <TableCell className="font-medium">{contrats.from + index}</TableCell>
                                                <TableCell>{`${contrat.agent.nom} ${contrat.agent.postnom} ${contrat.agent.prenom}`}</TableCell>
                                                <TableCell>{contrat.type_contrat}</TableCell>
                                                <TableCell>{contrat.fonction === 'admin' ? 'Administrateur' : contrat.fonction === 'ressource_humaine' ? 'Ressource Humaine' : contrat.fonction === 'communicateur' ? 'Communicateur' : contrat.fonction === 'caissière' ? 'Caissière' : contrat.fonction === 'manager' ? 'Gestionnaire' : contrat.fonction === 'agent' ? 'Agent' : contrat.fonction === 'assistant_direction' ? 'Assistant Direction' : contrat.fonction === 'charge_vente_client' ? 'Charge vente client' : contrat.fonction === 'coiffeuse' ? 'Coiffeuse' : contrat.fonction === 'maquilleuse' ? 'Maquilleuse' : contrat.fonction === 'cleaner' ? 'Cleaner' : contrat.fonction === 'estheticienne' ? 'Esthéticienne' : contrat.fonction === 'prothesiste' ? 'Prothésiste' : 'Autre'}</TableCell>
                                                <TableCell>{format(new Date(contrat.date_debut), 'PPP',{locale:fr})}</TableCell>
                                                <TableCell>{contrat.date_fin ? format(new Date(contrat.date_fin), 'PPP', {locale :fr}) : '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={contrat.is_active ? 'default' : 'secondary'}>
                                                        {contrat.is_active ? 'Actif' : 'Inactif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="flex gap-2">
                                                <Link href={route('contrats.show', contrat.ref)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye />
                                                    </Button>
                                                    </Link>
                                                    <Link href={route('contrats.edit', contrat.ref)}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil />
                                                    </Button>
                                                    </Link>

                                                     <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm">
                                                        <Trash2 />
                                                    </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Supprimer le contrat</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Voulez-vous vraiment supprimer ce contrat ?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteContrat(contrat.id)}>Supprimer</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                        </div>
                        <PaginationComponent data={contrats} className="mt-6" />
                    </div>
        </AppLayout>
    );
}