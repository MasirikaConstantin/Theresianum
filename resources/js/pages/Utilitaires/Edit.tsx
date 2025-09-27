import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs = (produitName: string): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Utilitaires',
        href: '/utilitaires',
    },
    {
        title: `Modifier ${produitName}`,
        href: '#',
    },
];

export default function ProduitEdit({ auth, produit }: { auth: Auth; produit: any }) {
    const { data, setData, post, processing, errors, reset } = useForm({
            _method: 'PUT', // Important pour Laravel
            name: produit.name,
            avatar: null as File | null,
            current_avatar: produit.avatar,
            description: produit.description,
            prix_achat: produit.prix_achat,
            prix_vente: produit.prix_vente,
            actif: produit.actif,
            type: produit.type,
        });
    
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            
            post(route('utilitaires.update', produit.id), {
                onError: () => {
                    toast.error('Veuillez corriger les erreurs dans le formulaire');
                },
                preserveScroll: true,
                forceFormData: true, // Force l'utilisation de FormData
            });
        };
    
        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                setData('avatar', e.target.files[0]);
                
                // Prévisualisation
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setData('current_avatar', event.target.result as string);
                    }
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };
        const canUpdateStatus = auth.user.role === 'admin' ;

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs(produit.name)}>
            <Head title={`Modifier ${produit.name}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('utilitaires.index')}>
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Modifier {produit.name}</h1>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-6" >
                    
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
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (optionnel)</Label>
                        <Textarea
                            id="description"
                            value={data.description || ''}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Description du produit"
                            rows={4}
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>
                    {/**
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="prix_achat">Prix d'achat ($)</Label>
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
                            <Label htmlFor="prix_vente">Prix de vente ($)</Label>
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
                    </div> */}
                    {canUpdateStatus && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className='flex items-center gap-2'>
                            Type : 
                            <Badge variant="default" className="ml-2">
                                {data.type === "a_utiliser" ? "A Utiliser Comme accessoire" : "A Vendre"}
                            </Badge>

                            <Select
                                value={data.type}
                                onValueChange={(value) => setData('type', value)}
                                required
                            >
                                <SelectTrigger className="w-[180px] mt-2">
                                    <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="a_utiliser">A Utiliser Comme accessoire</SelectItem>
                                    <SelectItem value="a_vendre">A Vendre</SelectItem>
                                </SelectContent>
                            </Select>

                            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                        </div>

                        <div>
                            <Switch
                                id="actif"
                                checked={data.actif}
                                onCheckedChange={(checked) => setData('actif', checked)}
                            />
                            <Label htmlFor="actif">Produit actif</Label>
                        </div>
                    </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <Link href={route('utilitaires.index')}>
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