import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
interface StockFormProps {
    auth: Auth;
    stock?: any;
    produits: any[];
}

export default function StockForm({ auth, stock, produits }: StockFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        produit_id: stock?.produit_id?.toString() || '', // Convertir en string si nécessaire
        quantite: stock?.quantite || 0,
        quantite_alerte: stock?.quantite_alerte || 5,
        actif: stock?.actif ?? true,
        prix: stock?.prix || 0,
        description: stock?.description || '',
    });

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
            title: stock ? 'Modifier Stock' : 'Créer Stock',
            href: '#',
        },
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (stock) {
            put(route('stocks.update', stock.ref), {
                onSuccess: () => toast.success('Stock mis à jour avec succès'),
                onError: () => toast.error('Une erreur est survenue'),
            });
        } else {
            post(route('stocks.store'), {
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
                    <Link href={route('stocks.index')}>
                        <Button variant="outline">Retour à la liste</Button>
                    </Link>
                </div>
                
                <form onSubmit={submit} className="grid gap-6">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="produit_id">Produit</Label>
                            <Select
                                value={data.produit_id}
                                onValueChange={(value) => setData('produit_id', value)}
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
                            {errors.produit_id && (
                                <p className="text-sm font-medium text-destructive">{errors.produit_id}</p>
                            )}
                        </div>
                        <div className="grid gap-2 grid-cols-2">
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
                            <Label htmlFor="quantite">Prix (Vide si inchangé)</Label>
                            <Input
                                id="quantite"
                                type="number"
                                min="0"
                                value={data.prix}
                                onChange={(e) => setData('prix', parseInt(e.target.value))}
                            />
                            {errors.prix && (
                                <p className="text-sm font-medium text-destructive">{errors.prix}</p>
                            )}
                        </div>
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="quantite_alerte">Seuil d'alerte</Label>
                            <Input
                                id="quantite_alerte"
                                type="number"
                                min="1"
                                value={data.quantite_alerte}
                                onChange={(e) => setData('quantite_alerte', parseInt(e.target.value))}
                            />
                            {errors.quantite_alerte && (
                                <p className="text-sm font-medium text-destructive">{errors.quantite_alerte}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="quantite_alerte">Description (optionnel)</Label>
                            <Textarea
                                id="quantite_alerte"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && (
                                <p className="text-sm font-medium text-destructive">{errors.description}</p>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Switch
                                id="actif"
                                checked={data.actif}
                                onCheckedChange={(checked) => setData('actif', checked)}
                            />
                            <Label htmlFor="actif">Stock actif</Label>
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