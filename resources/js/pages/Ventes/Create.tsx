import AppLayout from '@/layouts/app-layout';
import { Auth, Client, Configuration, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ChevronLeft, Plus, X, Search, UserPlus, ShoppingCart, Tag, Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import debounce from 'lodash.debounce';
import { DialogDescription } from '@radix-ui/react-dialog';
import axios from 'axios'
import ClientManager from '@/components/ClientManager';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { FrancCongolais } from '@/hooks/Currencies';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Ventes',
        href: '/ventes',
    },
    {
        title: 'Nouvelle vente',
        href: '/ventes/create',
    },
];

type Item = {
    produit_id?: string;
    quantite: number;
    prix_unitaire: number;
    remise: number;
    remise_montant: number; 
    remise_pourcentage: number;
    montant_total: number;
    type: 'produit';
    nom: string;
    stock_disponible?: number;
};

const TVA_RATE = 0.0000000000001;

export default function VenteCreate({ auth, configuration }: { auth: Auth, configuration: Configuration }) {
    const { clients, produits } = usePage<SharedData>().props;
    const [utilisablePoints, setUtilisablePoints] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        client_id: '',
        quantite: 1,
        remise_montant: 0,
        remise: 0,
        remise_pourcentage: 0,
        montant_total: 0,
        mode_paiement: 'espèces',
        items: [] as Item[],
    });

    const modes_paiement = {
        'espèces': { value: 'espèces', label: 'Espèces' },
        'carte': { value: 'carte', label: 'Carte' },
        'chèque': { value: 'chèque', label: 'Chèque' },
        'autre': { value: 'autre', label: 'Points de fidélité' }
    };

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [clientSearchTerm, setClientSearchTerm] = useState('');

    // Fonction pour calculer la remise en pourcentage
    const calculerRemisePourcentage = (montant: number, pourcentage: number) => {
        return montant * (pourcentage / 100);
    };

    // Fonction pour calculer le stock disponible d'un produit
    const getStockDisponible = (produit: any): number => {
        if (!produit.stock) return 0;
        
        // Si le stock est un objet unique
        if (typeof produit.stock === 'object' && !Array.isArray(produit.stock)) {
            const stock = produit.stock;
            // Vérifier si actif est true ou 1, et que la quantité est positive
            const isActif = stock.actif === true || stock.actif === 1;
            const quantite = Number(stock.quantite) || 0;
            
            return isActif && quantite > 0 ? quantite : 0;
        }
        
        // Si le stock est un tableau (gestion d'erreur)
        if (Array.isArray(produit.stock)) {
            const stockActif = produit.stock.find(
                (s: any) => (s.actif === true || s.actif === 1) && s.quantite > 0
            );
            return stockActif ? stockActif.quantite : 0;
        }
        
        return 0;
    };

    // Filtrer les produits en fonction de la recherche
    const filteredProduits = produits?.filter((produit: any) =>
        produit.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).map((produit: any) => ({
        ...produit,
        stock_disponible: getStockDisponible(produit),
    }));

    // Filtrer les clients en fonction de la recherche
    const filteredClients = clients?.filter((client: any) => 
        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())) ||
        (client.telephone && client.telephone.toLowerCase().includes(clientSearchTerm.toLowerCase()))
    );

    // Recalculer le montant total
    useEffect(() => {
        const calculerMontantTotal = () => {
            const produits = data.items.filter(item => item.type === 'produit');
            const totalProduitsHT = produits.reduce((sum, item) => sum + parseFloat(item.montant_total.toString()), 0);
            const tvaProduitsAmount = totalProduitsHT * TVA_RATE;
            const totalProduitsTTC = totalProduitsHT + tvaProduitsAmount;
            const sousTotal = totalProduitsTTC;
            
            const remiseGlobale = data.remise_pourcentage > 0 
                ? calculerRemisePourcentage(sousTotal, data.remise_pourcentage)
                : data.remise_montant;
                
            const montantTotal = Math.max(sousTotal - remiseGlobale, 0);
            
            if (data.montant_total !== montantTotal || data.remise !== remiseGlobale) {
                setData(prevData => ({
                    ...prevData,
                    montant_total: montantTotal,
                    remise: remiseGlobale,
                    remise_montant: remiseGlobale
                }));
            }
        };
        
        calculerMontantTotal();
    }, [data.items, data.remise_pourcentage]);

    // Gérer les changements de remise globale
    const handleRemiseGlobaleChange = (value: number, type: 'pourcentage' | 'montant') => {
        if (type === 'pourcentage') {
            setData(prevData => ({
                ...prevData,
                remise_pourcentage: value,
                remise_montant: 0
            }));
        } else {
            setData(prevData => ({
                ...prevData,
                remise_montant: value,
                remise_pourcentage: 0
            }));
        }
    };

    // Trouver le client sélectionné
    useEffect(() => {
        if (data.client_id) {
            const client = clients?.find((c: any) => c.id.toString() === data.client_id);
            if (client) setSelectedClient(client);
        } else {
            setSelectedClient(null);
        }
    }, [data.client_id, clients]);

    // Ajouter un item au panier
    const handleAddItem = useCallback((item: any, type: 'produit') => {
        if (type === 'produit') {
            const stockDisponible = getStockDisponible(item);
            
            if (stockDisponible <= 0) {
                toast.error('Stock insuffisant pour ce produit');
                return;
            }
            
            const quantiteExistante = data.items
                .filter(i => i.produit_id === item.id.toString())
                .reduce((sum, i) => sum + i.quantite, 0);
                
            if (quantiteExistante >= stockDisponible) {
                toast.error('Quantité demandée dépasse le stock disponible');
                return;
            }
        }

        const existingItemIndex = data.items.findIndex(
            i => (type === 'produit' && i.produit_id === item.id.toString())
        );

        if (existingItemIndex !== -1) {
            const newItems = [...data.items];
            const currentItem = newItems[existingItemIndex];
            
            newItems[existingItemIndex] = {
                ...currentItem,
                quantite: currentItem.quantite + 1,
                montant_total: (currentItem.prix_unitaire * (currentItem.quantite + 1)) - (currentItem.remise_montant || 0)
            };
            
            setData('items', newItems);
            toast.success(`Quantité de ${item.name} augmentée`);
        } else {
            const newItem: Item = {
                produit_id: item.id.toString(),
                quantite: 1,
                prix_unitaire: item.prix_vente,
                remise: 0,
                remise_montant: 0,
                remise_pourcentage: 0,
                montant_total: item.prix_vente,
                type,
                nom: item.name,
                stock_disponible: getStockDisponible(item),
            };

            setData('items', [...data.items, newItem]);
            toast.success(`${item.name} ajouté au panier`);
        }
    }, [data.items]);

    const handleRemoveItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        const item = { ...newItems[index] };
        
        item.remise_montant = item.remise_montant ?? 0;
        item.remise_pourcentage = item.remise_pourcentage ?? 0;
        
        item[field] = value;
        
        if (field === 'remise_pourcentage') {
            const pourcentage = parseFloat(value) || 0;
            item.remise_montant = calculerRemisePourcentage(
                item.prix_unitaire * item.quantite,
                pourcentage
            );
            item.remise_pourcentage = pourcentage;
        }
        
        if (field === 'remise_montant') {
            const montant = parseFloat(value) || 0;
            const totalAvantRemise = item.prix_unitaire * item.quantite;
            item.remise_pourcentage = totalAvantRemise > 0 
                ? (montant / totalAvantRemise) * 100 
                : 0;
            item.remise_montant = montant;
        }
        
        const quantite = parseInt(item.quantite?.toString() || '1');
        const prix = parseFloat(item.prix_unitaire?.toString() || '0');
        const remise = parseFloat(item.remise_montant?.toString() || '0');
        
        item.montant_total = Math.max((prix * quantite) - remise, 0);
        
        newItems[index] = item;
        setData('items', newItems);
    };

    const debouncedSearch = debounce((value) => {
        setSearchTerm(value);
    }, 300);

    const debouncedClientSearch = debounce((value) => {
        setClientSearchTerm(value);
    }, 300);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.client_id) {
            toast.error('Veuillez sélectionner un client');
            return;
        }
        
        if (data.items.length === 0) {
            toast.error('Veuillez ajouter au moins un produit');
            return;
        }
        
        post(route('ventes.store'), {
            onSuccess: async () => {
                toast.success('Vente enregistrée avec succès');
                reset();
            
                const venteId = await getRecentVente();
                
                if (venteId) {
                    const url = route('ventes.print', { vente: venteId });
                    window.open(url, '_blank');
                } else {
                    toast.error("Impossible de récupérer l'ID de la vente.");
                }
            },
            
            onError: (errors) => {
                console.error('Erreurs:', errors);
                if (errors.items) {
                    toast.error('Erreur avec les articles du panier');
                } else if (errors.client_id) {
                    toast.error(errors.client_id);
                } else {
                    toast.error('Erreur lors de l\'enregistrement de la vente');
                }
            },
        });
    };

    const getRecentVente = async () => {
        try {
            const response = await axios.get(route('get-recent-vente'), {
                params: { vendeur_id: auth.user.id }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des ventes :', error);
            return null;
        }
    };

    // Fonction helper pour calculer les totaux détaillés
    const calculerTotauxDetailles = () => {
        const produits = data.items.filter(item => item.type === 'produit');
        const totalProduitsHT = produits.reduce((sum, item) => sum + parseFloat(item.montant_total.toString()), 0);
        const tvaProduitsAmount = totalProduitsHT * TVA_RATE;
        const totalProduitsTTC = totalProduitsHT + tvaProduitsAmount;
        
        return {
            totalProduitsHT,
            tvaProduitsAmount,
            totalProduitsTTC,
            sousTotal: totalProduitsTTC
        };
    };

    const handleReset = () => {
        reset();
    };

    const inPromotion = auth.promotion !== 0;

    useEffect(() => {
        if (data.mode_paiement === 'autre') {
            if (selectedClient) {
                if (selectedClient?.fidelite?.points && selectedClient?.fidelite?.points < configuration.seuil_utilisation) {
                    setUtilisablePoints(false);
                } else {
                    if (data.montant_total > selectedClient?.fidelite?.points * configuration.valeur_point) {
                        setUtilisablePoints(false);
                        toast.error('Le montant de la vente est supérieur au montant des points disponibles');
                    } else {
                        setUtilisablePoints(true);
                        toast.success('Le client a assez de points pour payer la vente');
                    }
                }
            }
        } else {
            setUtilisablePoints(false);
        }
    }, [data.mode_paiement, selectedClient, data.montant_total, configuration]);

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle vente" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('ventes.index')}>
                            <Button variant="outline" size="icon">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">Nouvelle vente</h1>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-3 py-1">
                            Vendeur: {auth.user.name}
                        </Badge>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Colonne de gauche - Produits */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Catalogue</CardTitle>
                                    <div className="relative w-full max-w-sm">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Rechercher un produit..."
                                            className="pl-9"
                                            onChange={(e) => debouncedSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Tabs defaultValue="produits" className="w-full">
                                    <div className="px-6">
                                        <TabsList className="w-full">
                                            <TabsTrigger value="produits" className="flex-1">Produits</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="produits" className="m-0">
                                        <ScrollArea className="h-[500px] px-6 py-4">
                                            {filteredProduits && filteredProduits.length > 0 ? (
                                                <div className="border rounded-lg">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[200px]">Produit</TableHead>
                                                                <TableHead>Stock</TableHead>
                                                                <TableHead>Prix</TableHead>
                                                                <TableHead className="text-right">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {filteredProduits.map((produit: any) => (
                                                                <TableRow 
                                                                    key={produit.id} 
                                                                    className={produit.stock_disponible <= 0 ? 'opacity-60' : ''}
                                                                >
                                                                    <TableCell className="font-medium">{produit.name}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant={produit.stock_disponible > 0 ? "default" : "destructive"}>
                                                                            {produit.stock_disponible}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {FrancCongolais(produit.prix_vente)}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="secondary"
                                                                            onClick={() => handleAddItem(produit, 'produit')}
                                                                            disabled={produit.stock_disponible <= 0}
                                                                        >
                                                                            <Plus className="h-4 w-4 mr-2" />
                                                                            Ajouter
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-sm text-muted-foreground">
                                                        Aucun produit trouvé
                                                    </p>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Colonne de droite - Panier et client */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Panier */}
                        <Card className="flex flex-col">
                            <CardHeader className="pb-3 flex items-center justify-between">
                                <CardTitle className="flex items-center">
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Panier ({data.items.length})
                                </CardTitle>
                                {data.items.length > 0 && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={handleReset}
                                    >
                                        <Trash className="h-4 w-4 mr-2" />
                                        Vider
                                    </Button>
                                )}
                            </CardHeader>
                            
                            <CardContent>
                                <ScrollArea className="flex-1 max-h-[350px] pr-4 overflow-y-auto">
                                    {data.items.length > 0 ? (
                                        <div className="space-y-2">
                                            {data.items.map((item, index) => (
                                                <Card key={index} className="overflow-hidden p-1">
                                                    <CardContent className="p-1">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <h4 className="font-medium">{item.nom}</h4>
                                                                <Badge variant={item.type === 'produit' ? 'default' : 'secondary'} className="mt-1">
                                                                    {item.type === 'produit' ? 'Produit' : 'N/A'}
                                                                </Badge>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveItem(index)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Quantité</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    max={item.type === 'produit' ? item.stock_disponible : undefined}
                                                                    value={item.quantite}
                                                                    onChange={(e) => {
                                                                        const newQuantite = parseInt(e.target.value) || 1;
                                                                        // Validation de la quantité
                                                                        if (item.type === 'produit' && item.stock_disponible && newQuantite > item.stock_disponible) {
                                                                            toast.error(`Quantité maximale: ${item.stock_disponible}`);
                                                                            return;
                                                                        }
                                                                        handleUpdateItem(index, 'quantite', Math.max(1, newQuantite));
                                                                    }}
                                                                    className="w-full"
                                                                    // Désactiver si pas de stock pour les produits
                                                                    disabled={item.type === 'produit' && (!item.stock_disponible || item.stock_disponible <= 0)}
                                                                />
                                                                {item.type === 'produit' && item.stock_disponible && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Stock: {item.stock_disponible}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Prix unitaire</Label>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    disabled={!inPromotion}
                                                                    value={item.prix_unitaire}
                                                                    onChange={(e) => {
                                                                        const newPrix = parseFloat(e.target.value) || 0;
                                                                        handleUpdateItem(index, 'prix_unitaire', Math.max(0, newPrix));
                                                                    }}
                                                                    className="w-full"
                                                                />
                                                                {!inPromotion && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Modification désactivée
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="mt-3 flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">
                                                                Sous-total
                                                            </span>
                                                            <span className="font-medium">
                                                                {FrancCongolais(item.montant_total)}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <ShoppingCart className="h-8 w-8 mx-auto text-muted-foreground" />
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Votre panier est vide
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Ajoutez des produits
                                            </p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>

                            {data.items.length > 0 && (
                                <CardFooter className="flex flex-col border-t mt-auto">
                                    <div className="w-full space-y-3 py-3">
                                        {(() => {
                                            const totaux = calculerTotauxDetailles();
                                            return (
                                                <>
                                                    <div className="flex justify-between font-medium">
                                                        <span>Sous-total</span>
                                                        <span>
                                                            {FrancCongolais(totaux.sousTotal)}
                                                        </span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                        
                                        <div className="grid gap-2">
                                            <Label htmlFor="mode_paiement">Mode de paiement</Label>
                                            <Select
                                                value={data.mode_paiement}
                                                onValueChange={(value) => setData('mode_paiement', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionnez un mode de paiement" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(modes_paiement).map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span>
                                                {FrancCongolais(data.montant_total)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='flex'>
                                        <ClientManager 
                                            onClientSelected={(client) => {
                                                setSelectedClient(client);
                                                setData('client_id', client.id.toString());
                                            }}
                                            currentClientId={data.client_id}
                                            clients={clients}
                                        />
                                    </div>
                                    
                                    {data.mode_paiement === 'autre' && (
                                        <Button 
                                            className="w-full mt-2"
                                            type="submit" 
                                            onClick={handleSubmit}
                                            disabled={!utilisablePoints}
                                        >
                                            {processing ? 'Enregistrement...' : 'Valider la vente'}
                                        </Button>
                                    )}
                                    {data.mode_paiement !== 'autre' && (
                                        <Button 
                                            className="w-full mt-2"
                                            type="submit" 
                                            onClick={handleSubmit}
                                            disabled={processing || data.items.length === 0 || !data.client_id}
                                        >
                                            {processing ? 'Enregistrement...' : 'Valider la vente'}
                                        </Button>
                                    )}
                                    
                                    {selectedClient && (
                                        <div className="w-full space-y-1 py-3 bg-muted/50 p-3 rounded-md mt-2">
                                            <p className="font-medium">Client sélectionné : </p>
                                            <p>{selectedClient.name}</p>
                                            {selectedClient.telephone && <p className="text-sm">{selectedClient.telephone}</p>}

                                            {selectedClient.fidelite && configuration && (
                                            <Badge
                                                variant={
                                                configuration.seuil_utilisation > selectedClient.fidelite.points
                                                    ? "destructive"
                                                    : "secondary"
                                                }
                                                className={
                                                configuration.seuil_utilisation > selectedClient.fidelite.points
                                                    ? "bg-red-500"
                                                    : "bg-blue-500"
                                                }
                                            >
                                                Points : {selectedClient.fidelite.points} vaut{" "}
                                                {FrancCongolais(selectedClient.fidelite.points * configuration.valeur_point)} 
                                            </Badge>
                                            )}
                                        </div>
                                        )}
                                </CardFooter>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}