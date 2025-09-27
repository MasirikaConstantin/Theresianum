import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import * as Spinners from 'react-spinners';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function FideliteShow({ auth, client: initialClient }: { auth: any, client: any }) {
    const [client, setClient] = useState(initialClient);
    const [ventes, setVentes] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClientDetails();
    }, []);

    const fetchClientDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/fidelite/${client.id}`);
            setClient(response.data.client);
            setVentes(response.data.ventes);
            setStats(response.data.stats);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const offrirCadeau = async () => {
        try {
            await axios.post(`/api/fidelite/${client.id}/cadeau`);
            fetchClientDetails();
        } catch (error) {
            console.error(error);
        }
    };
    const breadcrumbs = [
        { title: 'Fidélité', href: '/fidelite' },
        { title: client.name, href: `/fidelite/${client.id}` },
    ];

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Fidélité - ${client.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{client.name}</h1>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{client.telephone || 'Aucun'}</Badge>
                            <Badge variant="outline">{client.email || 'Aucun'}</Badge>
                            {client.date_naissance && (
                                <>
                                <Badge variant="outline">
                                    Anniversaire: {format(new Date(client.date_naissance), 'PPP', { locale: fr })}
                                </Badge>
                                <Badge variant="outline">
                                    Âge: {client.age} ans
                                </Badge>
                                </>
                            )}
                        </div>
                    </div>
                    {client.date_naissance && 
                        new Date(client.date_naissance).getMonth() === new Date().getMonth() &&
                        new Date(client.date_naissance).getDate() === new Date().getDate() && (
                            <Button onClick={offrirCadeau} disabled={client.fidelite?.a_recu_cadeau_anniversaire}>
                                {client.fidelite?.a_recu_cadeau_anniversaire ? 'Cadeau déjà offert' : 'Offrir cadeau d\'anniversaire'}
                            </Button>
                        )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Points de fidélité</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{client.fidelite?.points || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Total achats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_depense || 0}  $</div>
                            <div className="text-sm text-muted-foreground">{stats.total_ventes || 0} commandes</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Moyenne par achat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.moyenne_achat ? parseFloat(stats.moyenne_achat).toFixed(2) : 0}  $</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Historique des achats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <Spinners.PuffLoader color="#000" size={100} />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Référence</TableHead>
                                        <TableHead>Montant</TableHead>
                                        <TableHead>Mode de paiement</TableHead>
                                        <TableHead>Articles</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ventes.map((vente: any) => (
                                        <TableRow key={vente.id}>
                                            <TableCell>
                                                {format(new Date(vente.created_at), 'PPP', { locale: fr })}
                                            </TableCell>
                                            <TableCell>{vente.code}</TableCell>
                                            <TableCell>{vente.montant_total}  $</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{vente.mode_paiement}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {vente.items.map((item: any) => (
                                                    <div key={item.id} className="text-sm">
                                                        {item.quantite}x {item.produit?.name || item.service?.name}
                                                    </div>
                                                ))}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" onClick={() => router.visit(`/ventes/${vente.ref}`)}>
                                                    Voir
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}