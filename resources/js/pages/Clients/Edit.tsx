import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs = (clientName: string): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Clients',
        href: '/clients',
    },
    {
        title: `Modifier ${clientName}`,
        href: '#',
    },
];

export default function ClientEdit({ auth, client }: { auth: Auth; client: any }) {
    const { data, setData, put, processing, errors } = useForm({
        name: client.name,
        telephone: client.telephone,
        email: client.email,
        notes: client.notes,
        succursale_id: client.succursale_id,
        date_naissance: client.date_naissance,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('clients.update', client.ref), {
            onError: () => {
                toast.error('Veuillez corriger les erreurs dans le formulaire');
            },
        });
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs(client.name)}>
            <Head title={`Modifier ${client.name}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('clients.index')}>
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Modifier {client.name}</h1>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nom du client"
                                required
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="telephone">Téléphone (optionnel)</Label>
                            <Input
                                id="telephone"
                                value={data.telephone || ''}
                                onChange={(e) => setData('telephone', e.target.value)}
                                placeholder="Numéro de téléphone"
                            />
                            {errors.telephone && <p className="text-sm text-red-500">{errors.telephone}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email (optionnel)</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email || ''}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Email du client"
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="succursale_id">Branche (optionnel)</Label>
                            <Select
                                value={data.succursale_id?.toString() || ''}
                                onValueChange={(value) => setData('succursale_id', value ? parseInt(value) : null)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez une branche" />
                                </SelectTrigger>
                                <SelectContent>
                                    {usePage<SharedData>().props?.succursales?.map((succursale) => (
                                        <SelectItem key={succursale.id} value={succursale.id.toString()}>
                                            {succursale.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.succursale_id && <p className="text-sm text-red-500">{errors.succursale_id}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="date_naissance">Date de naissance (optionnel)</Label>
                            <Input
                                id="date_naissance"
                                type="date"
                                value={data.date_naissance}
                                onChange={(e) => setData('date_naissance', e.target.value)}
                                placeholder="Date de naissance"
                            />
                            {errors.date_naissance && <p className="text-sm text-red-500">{errors.date_naissance}</p>}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes (optionnel)</Label>
                        <Textarea
                            id="notes"
                            value={data.notes || ''}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Notes sur le client"
                            rows={4}
                        />
                        {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Link href={route('clients.index')}>
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