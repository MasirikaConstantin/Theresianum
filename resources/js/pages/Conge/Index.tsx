import { Head, Link, router } from '@inertiajs/react';
import { Auth, PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { EyeIcon, X } from 'lucide-react';

interface CongeIndexProps extends PageProps {
    conges: {
        data: Array<{
            id: number;
            agent: {
                nom: string;
                postnom: string;
                prenom: string;
                matricule: string;
            };
            type: string;
            date_debut: string;
            date_fin: string;
            duree_jours: number;
            statut: string;
            created_at: string;
        }>;
        links: Array<any>;
    };
    filters: {
        search?: string;
        statut?: string;
        type?: string;
        month?: string;
        year?: string;
    };
    auth: Auth;
}

const statusColors = {
    en_attente: 'bg-yellow-100 text-yellow-800',
    approuve: 'bg-green-100 text-green-800',
    rejete: 'bg-red-100 text-red-800',
};

const typeColors = {
    annuel: 'bg-blue-100 text-blue-800',
    maladie: 'bg-purple-100 text-purple-800',
    maternite: 'bg-pink-100 text-pink-800',
    exceptionnel: 'bg-orange-100 text-orange-800',
    sans_solde: 'bg-gray-100 text-gray-800',
};

export default function Index({ auth, conges, filters }: CongeIndexProps) {
    const handleFilter = (key: string, value: string) => {
        router.get(route('conges.index'), {
            ...filters,
            [key]: value || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Gestion des Congés',
            href: route('conges.index'),
        },
    ];
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={breadcrumbs}
        >
            <Head title="Gestion des Congés" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Gestion des Congés
                    </h1>
                    <div className="flex gap-2">
                    <div className="flex gap-2">
                                    <Input
                                        placeholder="Rechercher..."
                                        value={filters.search || ''}
                                        onChange={(e) => handleFilter('search', e.target.value)}
                                        className="max-w-xs"
                                    />
                                    <Button onClick={() => router.get(route('conges.index'))}><X/></Button>
                                    <Select
                                        value={filters.statut || undefined}
                                        onValueChange={(value) => handleFilter('statut', value)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Tous statuts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="en_attente">En attente</SelectItem>
                                                <SelectItem value="approuve">Approuvé</SelectItem>
                                                <SelectItem value="rejete">Rejeté</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={filters.type || undefined}
                                        onValueChange={(value) => handleFilter('type', value)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Tous types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="annuel">Annuel</SelectItem>
                                            <SelectItem value="maladie">Maladie</SelectItem>
                                            <SelectItem value="maternite">Maternité</SelectItem>
                                            <SelectItem value="exceptionnel">Exceptionnel</SelectItem>
                                            <SelectItem value="sans_solde">Sans solde</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                        <Button asChild>
                            <Link href={route('conges.create')}>Nouvelle Demande</Link>
                        </Button>
                    </div>
                </div>
                    <div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Agent</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Période</TableHead>
                                        <TableHead>Durée</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Date demande</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {conges.data.map((conge) => (
                                        <TableRow key={conge.id}>
                                            <TableCell>
                                                {conge.agent.nom} {conge.agent.postnom} {conge.agent.prenom}
                                                <div className="text-sm text-gray-500">{conge.agent.matricule}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={typeColors[conge.type as keyof typeof typeColors]}>
                                                    {conge.type.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(conge.date_debut), 'PPP', { locale: fr })} au{' '}
                                                {format(new Date(conge.date_fin), 'PPP', { locale: fr })}
                                            </TableCell>
                                            <TableCell>{conge.duree_jours} jours</TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[conge.statut as keyof typeof statusColors]}>
                                                    {conge.statut.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(conge.created_at), 'PPP', { locale: fr })}
                                            </TableCell>
                                            <TableCell className="space-x-2">
                                                <Link href={route('conges.show', conge.ref)}>
                                                    <Button variant="outline" size="sm" className="hover:bg-gray-100">
                                                        <EyeIcon className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
            </div>
        </AppLayout>
    );
}