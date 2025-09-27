import AppLayout from '@/layouts/app-layout';
import { Auth, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Transferts',
        href: '/transferts',
    },
    {
        title: 'Nouveau transfert',
        href: '#',
    },
];

interface StockInfo {
    quantite: number;
    succursale_id: string;
}

export default function TransfertCreate({ auth, produits, succursales, users, stocks,masuccursales }: { 
    auth: Auth;
    produits: any[];
    succursales: any[];
    users: any[];
    stocks: { [key: string]: { [key: string]: number } }; // Format: { produit_id: { succursale_id: quantite } }
    masuccursales: any[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        note: '',
        items: [{
            produit_id: '',
            quantite: 1,
            succursale_source_id: '',
            succursale_destination_id: '',
        }],
    });

    // Utilisateur connecté et sa succursale par défaut
    const userSuccursale = auth.user.succursale_id;
    
    // État pour suivre les stocks disponibles par produit et succursale
    const [stocksInfo, setStocksInfo] = useState<{ [key: string]: { [key: string]: number } }>(stocks || {});
    const [stockWarnings, setStockWarnings] = useState<{ [key: number]: boolean }>({});

    // Définir la succursale de l'utilisateur comme source par défaut
    useEffect(() => {
        if (userSuccursale && data.items[0].succursale_source_id === '') {
            const newItems = [...data.items];
            newItems.forEach(item => {
                if (item.succursale_source_id === '') {
                    item.succursale_source_id = userSuccursale.toString();
                }
            });
            setData('items', newItems);
        }
    }, [userSuccursale]);

    // Vérifier si une quantité dépasse le stock disponible
    useEffect(() => {
        const warnings = {};
        data.items.forEach((item, index) => {
            if (item.produit_id && item.succursale_source_id) {
                const stockDisponible = stocksInfo[item.produit_id]?.[item.succursale_source_id] || 0;
                warnings[index] = item.quantite > stockDisponible;
            }
        });
        setStockWarnings(warnings);
    }, [data.items, stocksInfo]);

    const addItem = () => {
        setData('items', [
            ...data.items,
            {
                produit_id: '',
                quantite: 1,
                succursale_source_id: userSuccursale?.toString() || '',
                succursale_destination_id: '',
            }
        ]);
    };

    const removeItem = (index: number) => {
        if (data.items.length <= 1) return;
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        
        // Si on change de produit, réinitialiser la quantité à 1
        if (field === 'produit_id') {
            newItems[index].quantite = 1;
        }
        
        setData('items', newItems);
    };

    const getStockDisponible = (produitId: string, succursaleId: string): number => {
        return stocksInfo[produitId]?.[succursaleId] || 0;
    };

    const getProduitNom = (produitId: string): string => {
        const produit = produits.find(p => p.id.toString() === produitId);
        return produit ? produit.name : '';
    };

    const getSuccursaleNom = (succursaleId: string): string => {
        const succursale = succursales.find(s => s.id.toString() === succursaleId);
        return succursale ? succursale.nom : '';
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Vérifier s'il y a des problèmes de stock
        const stockProblems = data.items.some((item, index) => stockWarnings[index]);
        
        if (stockProblems) {
            toast.error("Certains articles dépassent le stock disponible. Veuillez vérifier les quantités.");
            return;
        }
        
        post(route('transferts.store'), {
            onSuccess: () => toast.success('Transfert créé avec succès'),
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('Une erreur est survenue');
                }
            },
        });
    };

    // Vérifier si un formulaire est valide pour le résumé
    const isItemValid = (item: any) => {
        return item.produit_id && item.quantite && item.succursale_source_id && item.succursale_destination_id;
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Nouveau transfert" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulaire principal (2/3 de la largeur) */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold tracking-tight">Nouveau transfert</h1>
                            <Link href={route('transferts.index')}>
                                <Button variant="outline">Retour à la liste</Button>
                            </Link>
                        </div>
                        
                        <form onSubmit={submit} className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informations générales</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2">
                                        <Label htmlFor="note">Note (optionnel)</Label>
                                        <Input
                                            id="note"
                                            value={data.note}
                                            onChange={(e) => setData('note', e.target.value)}
                                            placeholder="Informations complémentaires sur ce transfert..."
                                        />
                                        {errors.note && (
                                            <p className="text-sm font-medium text-destructive">{errors.note}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Produits à transférer</CardTitle>
                                    <Button type="button" size="sm" onClick={addItem}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Ajouter un produit
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {data.items.map((item, index) => (
                                        <div key={index} className="mb-6 p-4 border rounded-lg bg-muted/30">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-medium flex items-center">
                                                    Produit #{index + 1}
                                                    {stockWarnings[index] && (
                                                        <Badge variant="destructive" className="ml-2">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Stock insuffisant
                                                        </Badge>
                                                    )}
                                                </h4>
                                                {data.items.length > 1 && (
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor={`produit-${index}`}>Produit</Label>
                                                    <Select
                                                        value={item.produit_id}
                                                        onValueChange={(value) => updateItem(index, 'produit_id', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un produit" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {produits.map((produit) => (
                                                                <SelectItem key={produit.id} value={produit.id.toString()}>
                                                                    {produit.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors[`items.${index}.produit_id`] && (
                                                        <p className="text-sm font-medium text-destructive">
                                                            {errors[`items.${index}.produit_id`]}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                <div className="grid gap-2">
                                                    <Label htmlFor={`quantite-${index}`}>
                                                        Quantité
                                                        {item.produit_id && item.succursale_source_id && (
                                                            <span className="text-xs text-muted-foreground ml-2">
                                                                (Stock disponible: {getStockDisponible(item.produit_id, item.succursale_source_id)})
                                                            </span>
                                                        )}
                                                    </Label>
                                                    <Input
                                                        id={`quantite-${index}`}
                                                        type="number"
                                                        min="1"
                                                        max={item.produit_id && item.succursale_source_id ? 
                                                            getStockDisponible(item.produit_id, item.succursale_source_id) : undefined}
                                                        value={item.quantite}
                                                        onChange={(e) => updateItem(index, 'quantite', parseInt(e.target.value) || 1)}
                                                        className={stockWarnings[index] ? "border-destructive" : ""}
                                                    />
                                                    {errors[`items.${index}.quantite`] && (
                                                        <p className="text-sm font-medium text-destructive">
                                                            {errors[`items.${index}.quantite`]}
                                                        </p>
                                                    )}
                                                    {stockWarnings[index] && (
                                                        <p className="text-sm font-medium text-destructive">
                                                            Quantité supérieure au stock disponible
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                                <div className="grid gap-2">
                                                    <Label htmlFor={`source-${index}`}>Branche source</Label>
                                                    {masuccursales ? (
                                                            <Select
                                                                value={item.succursale_source_id}
                                                                onValueChange={(value) => updateItem(index, 'succursale_source_id', value)}
                                                                >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Source" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {masuccursales.map((succursale) => (
                                                                        <SelectItem 
                                                                            key={succursale.id} 
                                                                            value={succursale.id.toString()}
                                                                            disabled={succursale.id.toString() === item.succursale_destination_id}
                                                                        >
                                                                            {succursale.nom}
                                                                            {succursale.id.toString() === userSuccursale?.toString() && 
                                                                                " (Votre succursale)"}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <Select
                                                                value={item.succursale_source_id}
                                                                onValueChange={(value) => updateItem(index, 'succursale_source_id', value)}
                                                                >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Source" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {succursales.map((succursale) => (
                                                                        <SelectItem 
                                                                            key={succursale.id} 
                                                                            value={succursale.id.toString()}
                                                                            disabled={succursale.id.toString() === item.succursale_destination_id}
                                                                        >
                                                                            {succursale.nom}
                                                                            {succursale.id.toString() === userSuccursale?.toString() && 
                                                                                " (Votre succursale)"}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    {errors[`items.${index}.succursale_source_id`] && (
                                                        <p className="text-sm font-medium text-destructive">
                                                            {errors[`items.${index}.succursale_source_id`]}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-1">
                                                    <ArrowRightLeft className="h-5 w-5 mx-auto hidden md:block" />
                                                </div>
                                                
                                                <div className="grid gap-2 ">
                                                    <Label htmlFor={`destination-${index}`}>Branche destination</Label>
                                                    <Select
                                                        value={item.succursale_destination_id}
                                                        onValueChange={(value) => updateItem(index, 'succursale_destination_id', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Destination" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {succursales.map((succursale) => (
                                                                <SelectItem 
                                                                    key={succursale.id} 
                                                                    value={succursale.id.toString()}
                                                                    disabled={succursale.id.toString() === item.succursale_source_id}
                                                                >
                                                                    {succursale.nom}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors[`items.${index}.succursale_destination_id`] && (
                                                        <p className="text-sm font-medium text-destructive">
                                                            {errors[`items.${index}.succursale_destination_id`]}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {item.produit_id && item.succursale_source_id && item.quantite > 
                                              getStockDisponible(item.produit_id, item.succursale_source_id) && (
                                                <Alert variant="destructive" className="mt-4">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        Attention: La quantité demandée ({item.quantite}) dépasse le stock disponible 
                                                        ({getStockDisponible(item.produit_id, item.succursale_source_id)})
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {errors.items && (
                                        <p className="text-sm font-medium text-destructive">{errors.items}</p>
                                    )}
                                </CardContent>
                            </Card>
                            
                            <div className="flex justify-end gap-2">
                                <Button type="submit" disabled={processing}>
                                    Enregistrer le transfert
                                </Button>
                            </div>
                        </form>
                    </div>
                    
                    {/* Résumé du transfert (1/3 de la largeur) */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Résumé du transfert</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.items.some(isItemValid) ? (
                                    <>
                                        <div className="text-sm mb-4">
                                            {data.note && (
                                                <div className="mb-2">
                                                    <span className="font-medium">Note:</span> {data.note}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">Total produits:</span> {data.items.length}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {data.items.filter(isItemValid).map((item, index) => (
                                                <div key={index} className="p-3 border rounded-md bg-background">
                                                    <div className="font-medium">{getProduitNom(item.produit_id)}</div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        Quantité: {item.quantite}
                                                    </div>
                                                    <div className="text-xs mt-2 flex items-center">
                                                        <span>{getSuccursaleNom(item.succursale_source_id)}</span>
                                                        <ArrowRightLeft className="h-3 w-3 mx-2" />
                                                        <span>{getSuccursaleNom(item.succursale_destination_id)}</span>
                                                    </div>
                                                    {stockWarnings[index] && (
                                                        <Badge variant="destructive" className="mt-2 text-xs">
                                                            Stock insuffisant
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {data.items.some((_, idx) => stockWarnings[idx]) && (
                                            <Alert variant="destructive" className="mt-4">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>
                                                    Certains produits dépassent le stock disponible.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        Complétez le formulaire pour voir le résumé du transfert
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}