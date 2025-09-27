import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';

interface StockSuccursaleFormProps {
    auth: Auth;
    stock?: any;
    produits: any[];
    succursales: any[];
}

export default function StockSuccursaleForm({ auth, stock, produits, succursales }: StockSuccursaleFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        produit_id: stock?.produit_id || '',
        succursale_id: stock?.succursale_id || '',
        quantite: stock?.quantite || 0,
        seuil_alerte: stock?.seuil_alerte || 5,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Stocks par Branche',
            href: '/stock-succursales',
        },
        {
            title: stock ? 'Modifier Stock' : 'Créer Stock',
            href: '#',
        },
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (stock) {
            put(route('stock-succursales.update', stock.ref), {
                onSuccess: () => toast.success('Stock mis à jour avec succès'),
                onError: () => toast.error('Une erreur est survenue'),
            });
        } else {
            post(route('stock-succursales.store'), {
                onSuccess: () => toast.success('Stock créé avec succès'),
                onError: () => toast.error('Une erreur est survenue'),
            });
        }
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={stock ? 'Modifier Stock' : 'Créer Stock'} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {stock ? 'Modifier le Stock' : 'Créer un Nouveau Stock'}
                    </h1>
                    <Link href={route('stock-succursales.index')}>
                        <Button variant="outline">Retour à la liste</Button>
                    </Link>
                </div>
                
                <form onSubmit={submit} className="grid gap-6">
                    <div className="grid gap-4">
                    <div className="grid gap-2">
                            <Label htmlFor="produit_id">Produit</Label>
                            <Combobox
                                options={produits.map(produit => ({
                                    value: produit.id.toString(),
                                    label: `${produit.name}${produit.type === "a_utiliser" ? " (Accessoire)" : ""}`,
                                    // Vous pouvez ajouter d'autres propriétés si nécessaire
                                }))}
                                value={data.produit_id}
                                onChange={(value) => setData('produit_id', value)}
                                disabled={!!stock}
                                placeholder="Sélectionner un produit"
                                searchPlaceholder="Rechercher un produit..."
                                emptyText="Aucun produit trouvé"
                            />
                            {errors.produit_id && (
                                <p className="text-sm font-medium text-destructive">{errors.produit_id}</p>
                            )}
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="succursale_id">Branche</Label>
                            <Select
                                value={data.succursale_id}
                                onValueChange={(value) => setData('succursale_id', value)}
                                disabled={!!stock}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une succursale" />
                                </SelectTrigger>
                                <SelectContent>
                                    {succursales.map((succursale) => (
                                        <SelectItem key={succursale.id} value={succursale.id.toString()}>
                                            {succursale.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.succursale_id && (
                                <p className="text-sm font-medium text-destructive">{errors.succursale_id}</p>
                            )}
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="quantite">Quantité en stock</Label>
                            <Input
                                id="quantite"
                                type="number"
                                min="0"
                                value={data.quantite}
                                onChange={(e) => setData('quantite', parseInt(e.target.value))}
                            />
                            {errors.quantite && (
                                <p className="text-sm font-medium text-destructive">{errors.quantite}</p>
                            )}
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="seuil_alerte">Seuil d'alerte</Label>
                            <Input
                                id="seuil_alerte"
                                type="number"
                                min="1"
                                value={data.seuil_alerte}
                                onChange={(e) => setData('seuil_alerte', parseInt(e.target.value))}
                            />
                            {errors.seuil_alerte && (
                                <p className="text-sm font-medium text-destructive">{errors.seuil_alerte}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <Button type="submit" disabled={processing}>
                            {stock ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}