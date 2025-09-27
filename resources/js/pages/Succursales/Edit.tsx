import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Branches',
        href: '/succursales',
    },
    {
        title: 'Modifier une branche',
        href: '#',
    },
];

export default function SuccursaleEdit({ auth, succursale }: { auth: Auth; succursale: any }) {
    const { data, setData, put, processing, errors } = useForm({
        nom: succursale.nom,
        adresse: succursale.adresse,
        telephone: succursale.telephone,
        email: succursale.email,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('succursales.update', succursale.id), {
            onError: () => {
                toast.error('Veuillez corriger les erreurs dans le formulaire');
            },
        });
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${succursale.nom}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('succursales.index')}>
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Modifier {succursale.nom}</h1>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="nom">Nom</Label>
                            <Input
                                id="nom"
                                value={data.nom}
                                onChange={(e) => setData('nom', e.target.value)}
                                placeholder="Nom de la branche"
                                required
                            />
                            {errors.nom && <p className="text-sm text-red-500">{errors.nom}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="telephone">Téléphone</Label>
                            <Input
                                id="telephone"
                                value={data.telephone}
                                onChange={(e) => setData('telephone', e.target.value)}
                                placeholder="Numéro de téléphone"
                                required
                            />
                            {errors.telephone && <p className="text-sm text-red-500">{errors.telephone}</p>}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="adresse">Adresse</Label>
                        <Textarea
                            id="adresse"
                            value={data.adresse}
                            onChange={(e) => setData('adresse', e.target.value)}
                            placeholder="Adresse complète"
                            required
                        />
                        {errors.adresse && <p className="text-sm text-red-500">{errors.adresse}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email (optionnel)</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Email de contact"
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <Link href={route('succursales.index')}>
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