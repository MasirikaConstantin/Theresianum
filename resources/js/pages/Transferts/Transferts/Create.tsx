import { Head, Link, useForm } from '@inertiajs/react';
import { BreadcrumbItem, PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash } from 'lucide-react';
import { Auth, Produit } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';
interface Succursale {
    id: number;
    nom: string;
}

interface Props extends PageProps {
    succursales: Succursale[];
    produits: Produit[];
    auth: Auth;
}

interface TransfertItem {
    produit_id: string;
    quantite: string;
    succursale_destination_id: string;
}

export default function TransfertCreate({ auth, succursales, produits }: Props) {
    const [stockErrors, setStockErrors] = useState<Record<number, string>>({});

    const { data, setData, post, processing, errors } = useForm({
        note: '',
        items: [
            {
                produit_id: '',
                quantite: '',
                succursale_destination_id: '',
            } as TransfertItem,
        ],
    });
    const { flash } = usePage<SharedData>().props;
    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Vérifier les stocks avant soumission
        const newStockErrors: Record<number, string> = {};
        let hasErrors = false;

        data.items.forEach((item, index) => {
            const produitId = Number(item.produit_id);
            const quantite = Number(item.quantite);
            const available = getAvailableQuantity(produitId);

            if (quantite > available) {
                newStockErrors[index] = `Stock insuffisant. Disponible: ${available}`;
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setStockErrors(newStockErrors);
            toast( 'Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        post(route('transferts-central.store'), {
            onError: () => {
                toast('Une erreur est survenue lors de la création du transfert');
            },
            onSuccess: () => {
                toast('Transfert créé avec succès');
            },
        });
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            {
                produit_id: '',
                quantite: '',
                succursale_destination_id: '',
            },
        ]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
        
        // Supprimer l'erreur associée si elle existe
        const newErrors = {...stockErrors};
        delete newErrors[index];
        setStockErrors(newErrors);
    };

    const handleItemChange = (index: number, field: string, value: string) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData('items', newItems);

        // Vérifier le stock en temps réel pour la quantité
        if (field === 'quantite' && newItems[index].produit_id) {
            const produitId = Number(newItems[index].produit_id);
            const quantite = Number(value);
            const available = getAvailableQuantity(produitId);

            const newErrors = {...stockErrors};
            if (quantite > available) {
                newErrors[index] = `Stock insuffisant. Disponible: ${available}`;
            } else {
                delete newErrors[index];
            }
            setStockErrors(newErrors);
        }
    };

    const getAvailableQuantity = (produitId: number): number => {
        if (!produitId) return 0;
        const produit = produits.find(p => p.id === produitId);
        return produit?.stock?.quantite ?? 0;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Stocks',
            href: '/stocks',
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

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Créer un transfert" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Nouveau transfert</h1>
                    <Link href={route('transferts.index')}>
                        <Button variant="outline">Retour</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations du transfert</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4">
                                <div>
                                    <Label htmlFor="note">Note (optionnel)</Label>
                                    <Input
                                        id="note"
                                        value={data.note}
                                        onChange={(e) => setData('note', e.target.value)}
                                        placeholder="Note sur le transfert"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Articles à transférer</Label>
                                
                                {data.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg relative">
                                        {stockErrors[index] && (
                                            <div className="absolute -top-2 -right-2 bg-destructive text-dark text-xs px-2 py-1 rounded-md">
                                                {stockErrors[index]}
                                            </div>
                                        )}
                                        
                                        <div className="md:col-span-5">
                                            <Label>Produit</Label>
                                            <Select
                                                value={item.produit_id}
                                                onValueChange={(value) => handleItemChange(index, 'produit_id', value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un produit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {produits.map((produit) => (
                                                        <SelectItem 
                                                            key={produit.id} 
                                                            value={String(produit.id)}
                                                        >
                                                            {produit.name} - Stock: {produit.stock?.quantite ?? 0}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="md:col-span-3">
                                            <Label>Quantité</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantite}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value === '' || /^[1-9]\d*$/.test(value)) {
                                                        handleItemChange(index, 'quantite', value);
                                                    }
                                                }}
                                                placeholder="Quantité"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-3">
                                            <Label>Branche destination</Label>
                                            <Select
                                                value={item.succursale_destination_id}
                                                onValueChange={(value) => handleItemChange(index, 'succursale_destination_id', value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Destination" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {succursales.map((succursale) => (
                                                        <SelectItem key={succursale.id} value={String(succursale.id)}>
                                                            {succursale.nom}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="md:col-span-1 flex items-end">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeItem(index)}
                                                disabled={data.items.length === 1}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={addItem}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter un article
                                </Button>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Link href={route('transferts.index')}>
                                    <Button variant="outline" type="button">
                                        Annuler
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit" 
                                    disabled={processing || Object.keys(stockErrors).length > 0}
                                >
                                    {processing ? 'Enregistrement...' : 'Enregistrer le transfert'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}