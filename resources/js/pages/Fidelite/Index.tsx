import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';
import * as Spinners from 'react-spinners';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Vente } from '@/types';
import { FrancCongolais } from '@/hooks/Currencies';

type Client = {
    id: number;
    name: string;
    email: string;
    telephone: string;
    date_naissance: string;
    anniversaire_proche: boolean;
    jours_avant_anniversaire: number | null;
    ref: string;
    user_id: number;
    fidelite: {
        points: number;
        nombre_achats: number;
        montant_total_achats: number;
    };
    vente:Vente[];
    
};

export default function FideliteIndex({ auth, flash }: { auth: any, flash: any }) {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({});
    const [filter, setFilter] = useState<'all' | 'anniversaire' | 'meilleurs'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchClients();
        }, 500); // Délai de 500ms après la dernière frappe

        return () => clearTimeout(timer);
    }, [filter, searchTerm]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter === 'anniversaire') params.anniversaire = true;
            if (filter === 'meilleurs') params.meilleurs = true;
            if (searchTerm) params.search = searchTerm;
            
            const response = await axios.get('/api/fidelite', { params });
            setClients(response.data);
            setStats(response.data.stats);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const offrirCadeau = async (clientId: number) => {
        try {
            const response = await axios.post(`/api/fidelite/${clientId}/cadeau`);
            fetchClients();
            if(response.data.success){
                toast.success(response.data.success);
            }
            if(response.data.error){
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const breadcrumbs = [
        { title: 'Programme de fidélité', href: '/fidelite' },
    ];
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Programme de fidélité" />
            <div className="space-y-6 p-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Programme de fidélité</h1>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Rechercher un client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                        <Button 
                            variant={filter === 'all' ? 'default' : 'outline'} 
                            onClick={() => setFilter('all')}
                        >
                            Tous les clients
                        </Button>
                        <Button 
                            variant={filter === 'anniversaire' ? 'default' : 'outline'} 
                            onClick={() => setFilter('anniversaire')}
                        >
                            Anniversaires
                        </Button>
                        <Button 
                            variant={filter === 'meilleurs' ? 'default' : 'outline'} 
                            onClick={() => setFilter('meilleurs')}
                        >
                            Meilleurs clients
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Clients fidèles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_clients}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Anniversaires aujourd'hui</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.clients_anniversaire}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Meilleur client</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.meilleur_client ? (
                                <div>
                                    <div className="font-bold">{stats.meilleur_client.client.name}</div>
                                    <div>{FrancCongolais(stats.meilleur_client.montant_total_achats)}  dépensés</div>
                                </div>
                            ) : (
                                <div>Aucun client</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des clients</CardTitle>
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
                                        <TableHead>#</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Date de naissance</TableHead>
                                        <TableHead>Points</TableHead>
                                        <TableHead>Total achats</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {Object.values(clients).slice(0, -1).map((client, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index +1}</TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/fidelite/${client.ref}`} className="hover:underline">
                                                    {client.name}
                                                </Link>
                                                {client.anniversaire_proche && (
                                                    <Badge variant="destructive">
                                                        {client.jours_avant_anniversaire === 0 
                                                            ? "Aujourd'hui" 
                                                            : `Dans ${Math.ceil(client.jours_avant_anniversaire)} j`} 
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                            <TableCell>
                                                <div>{client.telephone}</div>
                                                <div className="text-sm text-muted-foreground">{client.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                {client.date_naissance ? (format(new Date(client.date_naissance), 'PPP', { locale: fr })) : 'Aucune '}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {client.fidelite?.points || 0} pts
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {client.fidelite?.montant_total_achats  ?FrancCongolais(client.fidelite?.montant_total_achats) : 0 } 
                                            </TableCell>
                                            <TableCell>
                                                <>
                                                <Link href={`/fidelite/${client.ref}`} className='mr-2'>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>  
                                                {client.date_naissance && ( 
                                                    new Date(client.date_naissance).getMonth() === new Date().getMonth() &&
                                                    new Date(client.date_naissance).getDate() === new Date().getDate() && (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => offrirCadeau(client.id)}
                                                        >
                                                            Offrir cadeau 
                                                        </Button>
                                                    ))}
                                                </>{/**client.fidelite?.a_recu_cadeau_anniversaire === 0 ?  */}
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