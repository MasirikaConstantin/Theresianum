import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Auth, BreadcrumbItem } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FrancCongolais } from '@/hooks/Currencies';

interface Caisse {
    id: number;
    ref: string;
    solde: string;
    statut: string;
    date_ouverture: string;
    date_fermeture?: string;
   
}

interface Props {
    caisses: {
        data: Caisse[];
        from: number;
        to: number;
        total: number;
    };
    auth: Auth;
}

export default function CaisseIndex({ caisses, auth }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Gestion des caisses',
            href: '/caisses',
        },
    ];
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Gestion des caisses" />
            
            <div className="container py-6 px-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wallet className="h-6 w-6" />
                        Gestion des caisses
                    </h1>
                </div>

                <div className="rounded-lg shadow">
                    <Table>
                        <TableCaption>{caisses.data.length > 0 ? `Affichage des caisses ${caisses.from} à ${caisses.to} sur ${caisses.total}` : 'Aucune caisse trouvée'}</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Solde</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Date ouverture</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {caisses.data.map((caisse, index) => (
                                <TableRow key={caisse.id}>
                                    <TableCell>{caisses.from + index}</TableCell>
                                    
                                    <TableCell>{FrancCongolais(parseFloat(caisse.solde))} </TableCell>
                                    <TableCell>
                                        <Badge variant={caisse.statut === 'ouverte' ? 'default' : 'secondary'}>
                                            {caisse.statut}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(caisse.date_ouverture), 'PPP', { locale: fr })}</TableCell>
                                    <TableCell>
                                        <Button size="sm" asChild>
                                            <Link href={route('caisses.show', caisse.ref)}>
                                                Détails
                                            </Link>
                                        </Button>
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