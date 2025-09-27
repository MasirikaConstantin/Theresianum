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
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const breadcrumbs = (userName: string): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Utilisateurs',
        href: '/utilisateurs',
    },
    {
        title: `Modifier ${userName}`,
        href: '#',
    },
];

export default function UserEdit({ auth, user,is_admin }: { auth: Auth; user: any,is_admin: boolean }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        avatar: null as File | null,
        current_avatar: user.avatar,
        telephone: user.telephone,
        adresse: user.adresse,
        date_embauche: user.date_embauche,
        role: user.role,
        is_active: user.is_active,
        succursale_id: user.succursale_id,
    });
    const canUpdateRole = is_admin ;
    const canUpdateSuccursale = is_admin ;
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('utilisateurs.update', user.id), {
            onError: () => {
                toast.error('Veuillez corriger les erreurs dans le formulaire');
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('avatar', e.target.files[0]);
        }
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs(user.name)}>
            <Head title={`Modifier ${user.name}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('utilisateurs.index')}>
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Modifier {user.name}</h1>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={data.current_avatar ? `/storage/${data.current_avatar}` : undefined} />
                            <AvatarFallback>
                                {user.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nom de l'utilisateur"
                                required
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Email de l'utilisateur"
                                required
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        <div className="grid gap-2">
                            <Label htmlFor="date_embauche">Date d'embauche (optionnel)</Label>
                            <Input
                                id="date_embauche"
                                type="date"
                                disabled={!canUpdateRole}
                                value={data.date_embauche || ''}
                                onChange={(e) => setData('date_embauche', e.target.value)}
                            />
                            {errors.date_embauche && <p className="text-sm text-red-500">{errors.date_embauche}</p>}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="adresse">Adresse (optionnel)</Label>
                        <Textarea
                            id="adresse"
                            value={data.adresse || ''}
                            onChange={(e) => setData('adresse', e.target.value)}
                            placeholder="Adresse complète"
                        />
                        {errors.adresse && <p className="text-sm text-red-500">{errors.adresse}</p>}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="role">Rôle</Label>
                            <Select
                                value={data.role}
                                onValueChange={(value) => setData('role', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {canUpdateRole && (
                                        <SelectItem value="admin">Admin</SelectItem>
                                    )}
                                    <SelectItem value="gerant">D.R.H</SelectItem>
                                    <SelectItem value="coiffeur">Coiffeur</SelectItem>
                                    <SelectItem value="caissier">Caissier</SelectItem>
                                    <SelectItem value="aucun">Aucun</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                        </div>
                        {canUpdateSuccursale && (
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
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked)}
                        />
                        <Label htmlFor="is_active">Compte actif</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Link href={route('utilisateurs.index')}>
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

