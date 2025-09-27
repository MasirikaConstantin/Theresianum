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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Services',
        href: '/services',
    },
    {
        title: 'Créer un service',
        href: '/services/create',
    },
];

export default function ServiceCreate({ auth }: { auth: Auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        duree_minutes: 30,
        prix: 0,
        actif: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('services.store'), {
            onError: (e: any) => {
                console.log(e);
                toast.error('Veuillez corriger les erreurs dans le formulaire');
            },
        });
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Créer un service" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('services.index')}>
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Créer un nouveau service</h1>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom du service</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nom du service"
                            required
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (optionnel)</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Description du service"
                            rows={4}
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="duree_minutes">Durée (minutes)</Label>
                            <Input
                                id="duree_minutes"
                                type="number"
                                min="1"
                                value={data.duree_minutes}
                                onChange={(e) => setData('duree_minutes', parseInt(e.target.value))}
                                required
                            />
                            {errors.duree_minutes && <p className="text-sm text-red-500">{errors.duree_minutes}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="prix">Prix ($)</Label>
                            <Input
                                id="prix"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.prix}
                                onChange={(e) => setData('prix', parseFloat(e.target.value))}
                                required
                            />
                            {errors.prix && <p className="text-sm text-red-500">{errors.prix}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="actif"
                            checked={data.actif}
                            onCheckedChange={(checked) => setData('actif', checked)}
                        />
                        <Label htmlFor="actif">Service actif</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Link href={route('services.index')}>
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