import { Head, Link } from '@inertiajs/react';
import { Auth, PageProps } from '@/types';
import Layout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TransfertStock {
    id: number;
    produit: {
        id: number;
        nom: string;
    };
    quantite: number;
    succursale_source: {
        id: number;
        nom: string;
    };
    succursale_destination: {
        id: number;
        nom: string;
    };
    statut: string;
    date_demande: string;
    date_validation?: string;
}

interface Transfert {
    id: number;
    from: number;
    ref: string;
    note?: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    transfert_stocks: TransfertStock[];
}

interface Props extends PageProps {
    transferts: Transfert[];
    auth: Auth;
}

export default function TransfertIndex({ auth, transferts }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'validé':
                return <Badge variant="success">Validé</Badge>;
            case 'refusé':
                return <Badge variant="destructive">Refusé</Badge>;
            default:
                return <Badge variant="secondary">En attente</Badge>;
        }
    };

    return (
        <Layout auth={auth}>
            <Head title="Transferts de stock" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Transferts de stock</h1>
                    <Link href={route('transferts-central.create')}>
                        <Button>Nouveau transfert</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des transferts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Initiateur</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transferts.data.map((transfert, index) => (
                                    <TableRow key={transfert.id}>
                                        <TableCell className="font-medium">{transferts.from +index}</TableCell>
                                        <TableCell>
                                            {format(new Date(transfert.created_at), 'PP', { locale: fr })}
                                        </TableCell>
                                        <TableCell>{transfert.user.name}</TableCell>
                                        <TableCell>{transfert.note ? `${transfert.note.slice(0, 20)}...` : '-'}</TableCell>
                                        <TableCell>
                                            {getStatusBadge(
                                                transfert.transfert_stocks[0]?.statut || 'en attente'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Link href={route('transferts.show', transfert.ref)}>
                                                <Button variant="outline" size="sm">
                                                    Détails
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}