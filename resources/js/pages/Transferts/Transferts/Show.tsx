// resources/js/Pages/Transferts/Show.tsx
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AppLayout from '@/layouts/app-layout';

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
    transfert: Transfert;
}

export default function TransfertShow({ auth, transfert }: Props) {
    const validateTransfert = () => {
        router.post(route('transferts.validate', transfert.id));
    };

    const rejectTransfert = () => {
        router.post(route('transferts.reject', transfert.id));
    };

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

    const isPending = transfert.transfert_stocks[0]?.statut === 'en attente';
    console.log(isPending);
    return (
        <AppLayout auth={auth}>
            <Head title={`Transfert ${transfert.ref}`} />

            <div className="container py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Transfert {transfert.ref}</h1>
                    <Link href={route('transferts.index')}>
                        <Button variant="outline">Retour</Button>
                    </Link>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Détails du transfert</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Référence</p>
                                <p className="font-medium">{transfert.ref}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-medium">
                                    {format(new Date(transfert.created_at), 'PPpp', { locale: fr })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Initiateur</p>
                                <p className="font-medium">{transfert.user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Statut</p>
                                <p className="font-medium">
                                    {getStatusBadge(transfert.transfert_stocks[0]?.statut || 'en attente')}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">Note</p>
                                <p className="font-medium">{transfert.note || 'Aucune note'}</p>
                            </div>
                        </div>

                        {isPending && auth.user.role === 'gerant' && (
                            <div className="flex gap-4 justify-end">
                                <Button variant="destructive" onClick={rejectTransfert}>
                                    Refuser le transfert
                                </Button>
                                <Button onClick={validateTransfert}>
                                    Valider le transfert
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Articles transférés</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produit</TableHead>
                                    <TableHead>Quantité</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transfert.transfert_stocks.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.produit.nom}</TableCell>
                                        <TableCell>{item.quantite}</TableCell>
                                        <TableCell>{item.succursale_source.nom}</TableCell>
                                        <TableCell>{item.succursale_destination.nom}</TableCell>
                                        <TableCell>{getStatusBadge(item.statut)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}