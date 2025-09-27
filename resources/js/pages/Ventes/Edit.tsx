import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Auth, Client, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ChevronLeft, Plus, X, Search, ShoppingCart, Trash, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import debounce from 'lodash.debounce';
import ClientManager from '@/components/ClientManager';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { fr } from 'date-fns/locale';

import { format } from 'date-fns';

type Item = {
    id?: string;
    produit_id?: string | null;
    service_id?: string | null;
    quantite: number;
    prix_unitaire: number;
    remise: number;
    remise_montant: number;
    remise_pourcentage: number;
    montant_total: number;
    type: 'produit' | 'service';
    nom: string;
    stock_disponible?: number;
};

const TVA_RATE = 0.16; // 16% de TVA

export default function VenteEdit({ auth, vente }: { auth: Auth, vente: any }) {
    const { clients, succursales, produits, services, modes_paiement } = usePage<SharedData>().props;
    const currentSuccursale = auth.user.succursale_id;

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
            title: `Éditer vente #${vente.ref}`,
            href: `/ventes/${vente.id}/edit`,
        },
    ];

    // Transformer les items de vente existants
    const transformVenteItems = (venteItems: any[]): Item[] => {
        return venteItems.map(item => ({
            id: item.id,
            produit_id: item.produit_id?.toString() || null,
            service_id: item.service_id?.toString() || null,
            quantite: item.quantite,
            prix_unitaire: parseFloat(item.prix_unitaire),
            remise: parseFloat(item.remise) || 0,
            remise_montant: parseFloat(item.remise) || 0,
            remise_pourcentage: (parseFloat(item.remise) / (parseFloat(item.prix_unitaire) * item.quantite) * 100 || 0),
            montant_total: parseFloat(item.montant_total),
            type: item.produit_id ? 'produit' : 'service',
            nom: item.produit?.name || item.service?.name || 'Article supprimé',
            stock_disponible: item.produit?.stock_succursales?.find(
                (s: any) => s.succursale_id === currentSuccursale
            )?.quantite
        }));
    };

    const { data, setData, put, processing, errors, reset } = useForm({
        client_id: vente.client_id?.toString() || '',
        succursale_id: vente.succursale_id || currentSuccursale || '',
        remise_montant: parseFloat(vente.remise) || 0,
        remise: parseFloat(vente.remise) || 0,
        remise_pourcentage: 0, // Calculé dynamiquement
        montant_total: parseFloat(vente.montant_total) || 0,
        mode_paiement: vente.mode_paiement || 'espèces',
        items: transformVenteItems(vente.items || []) as Item[],
    });

    const [selectedClient, setSelectedClient] = useState<Client | null>(vente.client || null);
    const [searchTerm, setSearchTerm] = useState('');
    const [originalStock, setOriginalStock] = useState<{[key: string]: number}>({});

    // Calculer la remise en pourcentage
    const calculerRemisePourcentage = (montant: number, pourcentage: number) => {
        return montant * (pourcentage / 100);
    };

    // Stocker le stock original des produits lors du chargement
    useEffect(() => {
        const stockOriginal: {[key: string]: number} = {};
        data.items.forEach(item => {
            if (item.type === 'produit' && item.produit_id) {
                const produit = produits?.find((p: any) => p.id.toString() === item.produit_id);
                if (produit) {
                    const stock = produit.stock_succursales?.find(
                        (s: any) => s.succursale_id === currentSuccursale
                    );
                    // Stock disponible = stock actuel + quantité déjà vendue
                    stockOriginal[item.produit_id] = (stock?.quantite || 0) + item.quantite;
                }
            }
        });
        setOriginalStock(stockOriginal);
    }, []);

    // Filtrer les produits avec stock ajusté
   // Filtrer les produits avec stock ajusté
    const filteredProduits = produits
        ?.filter((produit: any) => 
        produit.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        .map((produit: any) => {
        const stock = produit.stock_succursales?.find(
            (s: any) => s.succursale_id === currentSuccursale
        );
        let stockDisponible = stock ? stock.quantite : 0;
        
        // Ajouter la quantité déjà vendue si ce produit était dans la vente originale
        const quantiteVendue = data.items
            .filter(item => item.produit_id === produit.id.toString())
            .reduce((sum, item) => sum + item.quantite, 0);
        
        stockDisponible += quantiteVendue;

        return {
            ...produit,
            stock_disponible: stockDisponible,
        };
        });

    const filteredServices = services?.filter((service: any) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).map((service: any) => ({
        ...service,
        stock_disponible: null
    }));

    // Recalculer le montant total
    useEffect(() => {
        const calculerMontantTotal = () => {
            const produits = data.items.filter(item => item.type === 'produit');
            const services = data.items.filter(item => item.type === 'service');
            
            const totalProduitsHT = produits.reduce((sum, item) => sum + item.montant_total, 0);
            const tvaProduitsAmount = totalProduitsHT * TVA_RATE;
            const totalProduitsTTC = totalProduitsHT + tvaProduitsAmount;
            const totalServices = services.reduce((sum, item) => sum + item.montant_total, 0);
            
            const sousTotal = totalProduitsTTC + totalServices;
            
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
    }, [data.items, data.remise_pourcentage, data.remise_montant]);

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

    const handleAddItem = useCallback((item: any, type: 'produit' | 'service') => {
        // Vérification du stock pour les produits
        if (type === 'produit') {
            if (item.stock_disponible <= 0) {
                toast.error('Stock insuffisant pour ce produit');
                return;
            }
            
            const quantiteExistante = data.items
                .filter(i => i.produit_id === item.id.toString())
                .reduce((sum, i) => sum + i.quantite, 0);
                
            if (quantiteExistante >= item.stock_disponible) {
                toast.error('Quantité demandée dépasse le stock disponible');
                return;
            }
        }

        const existingItemIndex = data.items.findIndex(
            i => (type === 'produit' && i.produit_id === item.id.toString()) || 
                 (type === 'service' && i.service_id === item.id.toString())
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
                [type === 'produit' ? 'produit_id' : 'service_id']: item.id.toString(),
                quantite: 1,
                prix_unitaire: type === 'produit' ? item.prix_vente : item.prix,
                remise: 0,
                remise_montant: 0,
                remise_pourcentage: 0,
                montant_total: type === 'produit' ? item.prix_vente : item.prix,
                type,
                nom: item.name,
                stock_disponible: type === 'produit' ? item.stock_disponible : undefined,
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.client_id) {
            toast.error('Veuillez sélectionner un client');
            return;
        }
        
        if (data.items.length === 0) {
            toast.error('Veuillez ajouter au moins un produit ou service');
            return;
        }
        
        put(route('ventes.update', vente.id), {
            onSuccess: () => {
                toast.success('Vente modifiée avec succès');
                router.visit(route('ventes.index'));
            },
            onError: (errors) => {
                console.error('Erreurs:', errors);
                if (errors.items) {
                    toast.error('Erreur avec les articles du panier');
                } else if (errors.client_id) {
                    toast.error(errors.client_id);
                } else {
                    toast.error('Erreur lors de la modification de la vente');
                }
            },
        });
    };

    // Fonction helper pour calculer les totaux détaillés
    const calculerTotauxDetailles = () => {
        const produits = data.items.filter(item => item.type === 'produit');
        const services = data.items.filter(item => item.type === 'service');
        
        const totalProduitsHT = produits.reduce((sum, item) => sum + item.montant_total, 0);
        const tvaProduitsAmount = totalProduitsHT * TVA_RATE;
        const totalProduitsTTC = totalProduitsHT + tvaProduitsAmount;
        const totalServices = services.reduce((sum, item) => sum + item.montant_total, 0);
        
        return {
            totalProduitsHT,
            tvaProduitsAmount,
            totalProduitsTTC,
            totalServices,
            sousTotal: totalProduitsTTC + totalServices
        };
    };

    const handleReset = () => {
        setData('items', transformVenteItems(vente.items || []));
        toast.info('Panier réinitialisé aux valeurs originales');
    };

    const canOnlyAddDiscount = auth.user.role === 'gerant' ;
    const canAddProducts = auth.user.role === 'admin';
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Éditer vente #${vente.ref}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('ventes.index')}>
                            <Button variant="outline" size="icon">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Éditer vente #{vente.ref}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Créée le {format(new Date(vente.created_at), 'PPp', {locale:fr})}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-3 py-1">
                            Branche: {succursales?.find((s: any) => s.id === currentSuccursale)?.nom || 'Non définie'}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                            Vendeur: {vente.vendeur?.name || auth.user.name}
                        </Badge>
                    </div>
                </div>
                
                <div className={`${canAddProducts ? 'grid' : 'mt-3 w-96  justify-center'} grid-cols-1 lg:grid-cols-12 gap-6`}  >
                    {/* Colonne de gauche - Produits et Services */}
                    <div className="lg:col-span-8 space-y-6">
                    {canOnlyAddDiscount && (
                        <Alert variant="destructive" className='mb-2'>
                            <AlertTitle>Attention</AlertTitle>
                            <AlertDescription>
                                <p>Vous n'avez pas le droit d'ajouter des produits ou services.</p>
                                <p>Vous pouvez seulement modifier le prix des produits ou services.</p>
                            </AlertDescription>
                        </Alert>
                    )}
                    {canAddProducts && (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center">
                                        <Edit className="h-5 w-5 mr-2" />
                                        Modifier le catalogue
                                    </CardTitle>
                                    
                                    <div className="relative w-full max-w-sm">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Rechercher un produit ou service..."
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
                                            <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="produits" className="m-0">
                                        <ScrollArea className="h-[500px] px-6 py-4">
                                            {filteredProduits?.length > 0 ? (
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
                                                                        <Badge variant={produit.stock_disponible > 0 ? "success" : "destructive"}>
                                                                            {produit.stock_disponible}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {new Intl.NumberFormat('fr-FR', {
                                                                            style: 'currency',
                                                                            currency: 'USD'
                                                                        }).format(produit.prix_vente).replace('$US', '$ ')}
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

                                    <TabsContent value="services" className="m-0">
                                        <ScrollArea className="h-[500px] px-6 py-4">
                                            {filteredServices?.length > 0 ? (
                                                <div className="border rounded-lg">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[200px]">Service</TableHead>
                                                                <TableHead>Durée</TableHead>
                                                                <TableHead>Prix</TableHead>
                                                                <TableHead className="text-right">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {filteredServices.map((service: any) => (
                                                                <TableRow key={service.id}>
                                                                    <TableCell className="font-medium">
                                                                        <div>
                                                                            {service.name}
                                                                            {service.description && (
                                                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                                                                    {service.description.slice(0, 20)+'...'}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline">
                                                                            {service.duree_minutes} min
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {new Intl.NumberFormat('fr-FR', {
                                                                            style: 'currency',
                                                                            currency: 'USD'
                                                                        }).format(service.prix).replace('$US', '$ ')}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="secondary"
                                                                            onClick={() => handleAddItem(service, 'service')}
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
                                                        Aucun service trouvé
                                                    </p>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    )}
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
                                        disabled={!canAddProducts}
                                    >
                                        <Trash className="h-4 w-4 mr-2" />
                                        Réinitialiser
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
                                                                <div className="flex gap-1 mt-1">
                                                                    <Badge variant={item.type === 'produit' ? 'default' : 'secondary'}>
                                                                        {item.type === 'produit' ? 'Produit' : 'Service'}
                                                                    </Badge>
                                                                    {item.id && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            Original
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={!canAddProducts}
                                                                onClick={() => handleRemoveItem(index)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Quantité</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    
                                                                    max={item.type === 'produit' ? item.stock_disponible : undefined}
                                                                    value={item.quantite}
                                                                    onChange={(e) => handleUpdateItem(index, 'quantite', parseInt(e.target.value))}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Prix unitaire</Label>
                                                                <Input
                                                                    type="number"
                                                                    step="1"
                                                                    
                                                                    value={item.prix_unitaire}
                                                                    onChange={(e) => handleUpdateItem(index, 'prix_unitaire', parseFloat(e.target.value))}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                            {/*<div className="space-y-1">
                                                                <Label className="text-xs">Remise (%)</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="1"
                                                                    value={item.remise_pourcentage}
                                                                    onChange={(e) => handleUpdateItem(index, 'remise_pourcentage', parseFloat(e.target.value))}
                                                                    className="w-full"
                                                                />
                                                            </div>*/}
                                                        </div>
                                                        
                                                        <div className="mt-3 flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">
                                                                Sous-total
                                                            </span>
                                                            <span className="font-medium">
                                                                {new Intl.NumberFormat('fr-FR', {
                                                                    style: 'currency',
                                                                    currency: 'USD'
                                                                }).format(item.montant_total).replace('$US', '$ ')}
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
                                                Ajoutez des produits ou services
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
                                                    {totaux.totalProduitsHT > 0 && (
                                                        <>
                                                            <div className="flex justify-between text-sm">
                                                                <span>Produits (HT)</span>
                                                                <span>
                                                                    {new Intl.NumberFormat('fr-FR', {
                                                                        style: 'currency',
                                                                        currency: 'USD'
                                                                    }).format(totaux.totalProduitsHT).replace('$US', '$ ')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>TVA ({(TVA_RATE * 100).toFixed(0)}%)</span>
                                                                <span>
                                                                    {new Intl.NumberFormat('fr-FR', {
                                                                        style: 'currency',
                                                                        currency: 'USD'
                                                                    }).format(totaux.tvaProduitsAmount).replace('$US', '$ ')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>Produits (TTC)</span>
                                                                <span>
                                                                    {new Intl.NumberFormat('fr-FR', {
                                                                        style: 'currency',
                                                                        currency: 'USD'
                                                                    }).format(totaux.totalProduitsTTC).replace('$US', '$ ')}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                    
                                                    {totaux.totalServices > 0 && (
                                                        <div className="flex justify-between text-sm">
                                                            <span>Services</span>
                                                            <span>
                                                                {new Intl.NumberFormat('fr-FR', {
                                                                    style: 'currency',
                                                                    currency: 'USD'
                                                                }).format(totaux.totalServices).replace('$US', '$ ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex justify-between font-medium">
                                                        <span>Sous-total</span>
                                                        <span>
                                                            {new Intl.NumberFormat('fr-FR', {
                                                                style: 'currency',
                                                                currency: 'USD'
                                                            }).format(totaux.sousTotal).replace('$US', '$ ')}
                                                        </span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                        
                                        {/*<div className="grid gap-2">
                                            <Label htmlFor="remise">Remise globale (%)</Label>
                                            <Input
                                                id="remise"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={data.remise_pourcentage}
                                                onChange={(e) => handleRemiseGlobaleChange(parseFloat(e.target.value) || 0, 'pourcentage')}
                                            />
                                        </div>*/}
                                        
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
                                                    {modes_paiement.map((mode: string) => (
                                                        <SelectItem key={mode} value={mode}>
                                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span>
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'USD'
                                                }).format(data.montant_total).replace('$US', '$ ')}
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
                                    
                                    <Button 
                                        className="w-full mt-2"
                                        type="submit" 
                                        onClick={handleSubmit}
                                        disabled={processing || data.items.length === 0 || !data.client_id}
                                    >
                                        {processing ? 'Modification...' : 'Enregistrer les modifications'}
                                    </Button>
                                    
                                    {selectedClient && (
                                        <div className="w-full space-y-1 py-3 bg-muted/50 p-3 rounded-md mt-2">
                                            <p className="font-medium">Client sélectionné:</p>
                                            <p>{selectedClient.name}</p>
                                            {selectedClient.telephone && <p className="text-sm">{selectedClient.telephone}</p>}
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