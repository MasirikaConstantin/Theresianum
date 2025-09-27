import { Auth, BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, MoreVertical, Pencil, PlusCircle, Search, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PaginationComponent } from '@/components/Pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';

interface Agent {
    id: number;
    matricule: string;
    nom: string;
    postnom: string;
    prenom: string;
    sexe: string;
    email: string;
    role: string;
    statut: string;
    succursale: {
        name: string;
    };
}

export default function Index({ auth }: { auth: Auth }) {
    const { flash, agents, filters } = usePage<SharedData & { agents: Agent[], filters: { search?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    // Délai pour la recherche
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('personnels.index'), { search }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const deleteAgent = (id: number) => {
        router.delete(route('personnels.destroy', id));
        toast.success('Agent supprimé avec succès');
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Accueil', href: route('dashboard') },
        { title: 'Gestion du Personnel', href: route('personnels.index') },
    ];
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={breadcrumbs}
        >
            <Head title="Gestion du Personnel" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion du Personnel</h1>
                    <div className="flex gap-2">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                        name="search"
                                        placeholder="Rechercher un agent..."
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                        </div>
                        
                        <Link href={route('personnels.create')}>
                            <Button>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Nouvel Agent
                            </Button>
                        </Link>

                    </div>
                    
                </div>

                <div className="rounded-lg border shadow-sm">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Matricule</TableHead>
                                            <TableHead>Nom Complet</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Rôle</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {agents.data.map((agent) => (
                                            <TableRow key={agent.id}>
                                                <TableCell>{agent.matricule}</TableCell>
                                                <TableCell>{`${agent.nom} ${agent.postnom} ${agent.prenom}`}</TableCell>
                                                <TableCell>{agent.email.slice(0, 10) + '...'} </TableCell>
                                                <TableCell>{agent.role === 'admin' ? 'Administrateur' : agent.role === 'ressource_humaine' ? 'Ressource Humaine' : agent.role === 'communicateur' ? 'Communicateur' : agent.role === 'caissière' ? 'Caissière' : agent.role === 'manager' ? 'Gestionnaire' : agent.role === 'agent' ? 'Agent' : agent.role === 'assistant_direction' ? 'Assistant Direction' : agent.role === 'charge_vente_client' ? 'Charge vente client' : agent.role === 'coiffeuse' ? 'Coiffeuse' : agent.role === 'maquilleuse' ? 'Maquilleuse' : agent.role === 'cleaner' ? 'Cleaner' : agent.role === 'estheticienne' ? 'Esthéticienne' : agent.role === 'prothesiste' ? 'Prothésiste' : 'Autre'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={agent.statut === 'actif' ? 'default' : 'destructive'}>
                                                        {agent.statut}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="flex gap-2">
                                                    <Link href={route('personnels.show', agent.ref)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye />
                                                    </Button>
                                                    </Link>
                                                    <Link href={route('personnels.edit', agent.ref)}>
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
                                                            <AlertDialogTitle>Supprimer l'agent</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Voulez-vous vraiment supprimer cet agent ?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteAgent(agent.id)}>Supprimer</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                
                            </div>
                            {agents && (
                                <PaginationComponent data={agents} />
                            )} 
                        </div>
                        
        </AppLayout>
    );
}