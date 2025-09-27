import AppLayout from '@/layouts/app-layout';
import { Auth, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Categorie } from '@/types';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Produits',
        href: '/produits',
    },
    {
        title: 'Créer un produit',
        href: '/produits/create',
    },
];

export default function ProduitCreate({ auth, categories }: { auth: Auth, categories: Categorie[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        prix_achat: 0,
        prix_vente: 0,
        actif: true,
        categorie_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('produits.store'), {
            onError: () => {
                toast.error('Veuillez corriger les erreurs dans le formulaire');
            },
        });
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Créer un produit" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('produits.index')}>
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Créer un nouveau produit</h1>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom du produit</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nom du produit"
                            required
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="grid gap-2 ">
                        <Label htmlFor="categorie_id">Catégorie</Label>
                        <Select
                            value={data.categorie_id}
                            onValueChange={(value) => setData('categorie_id', value)}
                            required
                        >
                            <SelectTrigger className="w-full mt-2">
                                <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                {categories.map((categorie) => (
                                    <SelectItem key={categorie.id} value={String(categorie.id)}>
                                        {categorie.nom}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.categorie_id && <p className="text-sm text-red-500">{errors.categorie_id}</p>}
                    </div>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (optionnel)</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Description du produit"
                            rows={4}
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="prix_achat">Prix d'achat (FC)</Label>
                            <Input
                                id="prix_achat"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.prix_achat}
                                onChange={(e) => setData('prix_achat', parseFloat(e.target.value))}
                                required
                            />
                            {errors.prix_achat && <p className="text-sm text-red-500">{errors.prix_achat}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="prix_vente">Prix de vente (FC)</Label>
                            <Input
                                id="prix_vente"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.prix_vente}
                                onChange={(e) => setData('prix_vente', parseFloat(e.target.value))}
                                required
                            />
                            {errors.prix_vente && <p className="text-sm text-red-500">{errors.prix_vente}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="actif"
                            checked={data.actif}
                            onCheckedChange={(checked) => setData('actif', checked)}
                        />
                        <Label htmlFor="actif">Produit actif</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Link href={route('produits.index')}>
                            <Button variant="outline">Annuler</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}