import { Auth, Salle, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Salles', href: '/salles' },
    { title: 'Modifier la salle', href: '#' },
];

export default function SalleEdit({ auth, vocations,salle,flash }: { auth: Auth; vocations: string[],salle :Salle,flash: { error: string; success: string } }) {
    const { data, setData, errors, put, processing } = useForm({
        nom: salle.nom,
        capacite_max: salle.capacite_max,
        vocation: salle.vocation,
        prix_journee: salle.prix_journee,
        prix_nuit: salle.prix_nuit,
        equipements: salle.equipements,
        disponible: salle.disponible
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('salles.update', salle.id));
    };
    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);
    const getVocationLabel = (vocation: string) => {
        switch (vocation) {
            case 'journee': return 'Journée';
            case 'nuit': return 'Nuit';
            case 'mixte': return 'Mixte';
            default: return vocation;
        }
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Modifier la salle" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('salles.show', salle.ref)}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Modifier la salle</h1>
                </div>

                <div className="w-full">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="nom">Nom de la salle *</Label>
                                <Input
                                    id="nom"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    placeholder="Ex: Salle Cristal, Salle des Fêtes..."
                                    required
                                />
                                {errors.nom && <p className="text-sm text-red-600">{errors.nom}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capacite_max">Capacité maximale *</Label>
                                <Input
                                    id="capacite_max"
                                    type="number"
                                    min="1"
                                    value={data.capacite_max}
                                    onChange={(e) => setData('capacite_max', parseInt(e.target.value))}
                                    required
                                />
                                {errors.capacite_max && <p className="text-sm text-red-600">{errors.capacite_max}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vocation">Vocation *</Label>
                                <Select value={data.vocation} onValueChange={(value) => setData('vocation', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vocations.map(vocation => (
                                            <SelectItem key={vocation} value={vocation}>
                                                {getVocationLabel(vocation)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.vocation && <p className="text-sm text-red-600">{errors.vocation}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prix_journee">Prix journée ($) *</Label>
                                <Input
                                    id="prix_journee"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.prix_journee}
                                    onChange={(e) => setData('prix_journee', parseFloat(e.target.value))}
                                    required
                                />
                                {errors.prix_journee && <p className="text-sm text-red-600">{errors.prix_journee}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prix_nuit">Prix nuit ($) *</Label>
                                <Input
                                    id="prix_nuit"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.prix_nuit}
                                    onChange={(e) => setData('prix_nuit', parseFloat(e.target.value))}
                                    required
                                />
                                {errors.prix_nuit && <p className="text-sm text-red-600">{errors.prix_nuit}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="equipements">Équipements *</Label>
                                <Textarea
                                    id="equipements"
                                    value={data.equipements}
                                    onChange={(e) => setData('equipements', e.target.value)}
                                    placeholder="Sonorisation, Projecteur, Cuisine équipée, Tables, Chaises..."
                                    rows={4}
                                    required
                                />
                                {errors.equipements && <p className="text-sm text-red-600">{errors.equipements}</p>}
                            </div>

                            <div className="space-y-2 flex items-center gap-3">
                                <Switch
                                    checked={data.disponible}
                                    onCheckedChange={(checked) => setData('disponible', checked)}
                                />
                                <Label htmlFor="disponible">Disponible immédiatement</Label>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Modification...' : 'Modifier la salle'}
                            </Button>
                            <Link href={route('salles.show', salle.ref)}>
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