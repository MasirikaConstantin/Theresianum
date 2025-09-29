import AppLayout from '@/layouts/app-layout';
import { Auth, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Chambres', href: '/chambres' },
    { title: 'Créer une chambre', href: '#' },
];

export default function ChambreCreate({ auth, types, flash }: { auth: Auth; types: string[]; flash: { error: string; success: string } }) {
    const { data, setData, errors, post, processing } = useForm({
        numero: '',
        type: 'simple',
        prix: 0,
        capacite: 1,
        equipements: '',
        nom: '',
        statut: 'disponible'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('chambres.store'));
    };

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Créer une chambre" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('chambres.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Créer une nouvelle chambre</h1>
                </div>

                <div className="w-full">
                    <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                                <Label htmlFor="nom">Nom de la chambre (Comme une description) *</Label>
                                <Textarea
                                    id="nom"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    placeholder="Ex: Chambre Pour une personne"
                                    required
                                />
                                {errors.nom && <p className="text-sm text-red-600">{errors.nom}</p>}
                            </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="numero">Numéro de chambre *</Label>
                                <Input
                                    id="numero"
                                    value={data.numero}
                                    onChange={(e) => setData('numero', e.target.value)}
                                    placeholder="Ex: 101"
                                    required
                                />
                                {errors.numero && <p className="text-sm text-red-600">{errors.numero}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type de chambre *</Label>
                                <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map(type => (
                                            <SelectItem key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prix">Prix ($) *</Label>
                                <Input
                                    id="prix"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.prix}
                                    onChange={(e) => setData('prix', parseFloat(e.target.value))}
                                    required
                                />
                                {errors.prix && <p className="text-sm text-red-600">{errors.prix}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capacite">Capacité (personnes) *</Label>
                                <Input
                                    id="capacite"
                                    type="number"
                                    min="1"
                                    value={data.capacite}
                                    onChange={(e) => setData('capacite', parseInt(e.target.value))}
                                    required
                                />
                                {errors.capacite && <p className="text-sm text-red-600">{errors.capacite}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="equipements">Équipements</Label>
                                <Textarea
                                    id="equipements"
                                    value={data.equipements}
                                    onChange={(e) => setData('equipements', e.target.value)}
                                    placeholder="TV, WiFi, Climatisation, Mini-bar..."
                                    rows={3}
                                />
                                {errors.equipements && <p className="text-sm text-red-600">{errors.equipements}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="statut">Statut *</Label>
                                <Select value={data.statut} onValueChange={(value) => setData('statut', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="disponible">Disponible</SelectItem>
                                        <SelectItem value="nettoyage">Nettoyage</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.statut && <p className="text-sm text-red-600">{errors.statut}</p>}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Création...' : 'Créer la chambre'}
                            </Button>
                            <Link href={route('chambres.index')}>
                                <Button type="button" variant="outline">
                                    Annuler
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}