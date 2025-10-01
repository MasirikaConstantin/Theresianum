import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, Plus, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Auth, BreadcrumbItem } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PaginationComponent } from '@/components/Pagination';
import { FrancCongolais } from '@/hooks/Currencies';

interface Depense {
    id: number;
    ref: string;
    libelle: string;
    montant: string;
    created_at: string;
    from: number;
    caisse: {
        ref: string;
    };
    user: {
        name: string;
    };
}

interface Props {
    depenses: {
        data: Depense[];
        from: number;
    };
    auth: Auth;
}

export default function DepenseIndex({ depenses, auth }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Depenses', href: '/depenses' },
    ];
    console.log(depenses);
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Gestion des dépenses" />
            
            <div className="container py-6 px-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wallet className="h-6 w-6" />
                        Gestion des dépenses
                    </h1>
                    <Button asChild>
                        <Link href={route('depenses.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle dépense
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg shadow">
                    <Table>
                        <TableCaption>Depenses</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Libellé</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Enregistré par</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {depenses.data.map((depense, index) => (
                                <TableRow key={depense.id}>
                                    <TableCell>{depenses.from + index }</TableCell>
                                    <TableCell>{depense.libelle.slice(0, 29)}</TableCell>
                                    <TableCell className="text-red-600">-{FrancCongolais(parseFloat(depense.montant))}</TableCell>
                                    <TableCell>{depense.user.name}</TableCell>
                                    <TableCell>{format(new Date(depense.created_at), 'PPP', { locale: fr })}</TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={route('depenses.show', depense.ref)}>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {depenses && (
                                                    <PaginationComponent data={depenses} />
                                                )}
                </div>
            </div>
        </AppLayout>
    );
}