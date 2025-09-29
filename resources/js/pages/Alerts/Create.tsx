import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Auth } from '@/types';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Alertes', href: '/alerts' },
    { title: 'Nouvelle alerte', href: '#' },
];

export default function AlertCreate({ produits, rendezvous, auth, salles, chambres   }: { produits: any[]; rendezvous: any[]; auth: Auth; salles: any[]; chambres: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        notes: '',
        produit_id: '',
        rendezvou_id: '',
        salle_id: '',
        chambre_id: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('alerts.store'), {
            onSuccess: () => toast.success('Alerte créée avec succès'),
            onError: () => toast.error('Une erreur est survenue'),
        });
    };

    return (
        <AppLayout auth={auth}   breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle alerte" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Nouvelle alerte</h1>
                    <Link href={route('alerts.index')}>
                        <Button variant="outline">Retour à la liste</Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="grid gap-6">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (optionnel)</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Décrivez l'alerte..."
                            />
                            {errors.notes && (
                                <p className="text-sm font-medium text-destructive">{errors.notes}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>Associer à un produit</Label>
                                <Select
                                value={data.produit_id || undefined} // Utilisez undefined au lieu de ""
                                onValueChange={(value) => setData('produit_id', value || null)} // Stockez null si vide
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
                            </div>

                            <div className="grid gap-2">
                                <Label>Associer à une chambre</Label>
                                <Select
                                value={data.chambre_id || undefined} // Utilisez undefined au lieu de ""
                                onValueChange={(value) => setData('chambre_id', value || null)} // Stockez null si vide
                                >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une chambre" />
                                </SelectTrigger>
                                <SelectContent>
                                    {chambres.map((chambre) => (
                                    <SelectItem key={chambre.id} value={chambre.id.toString()}>
                                        {chambre.nom}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </div>


                            <div className="grid gap-2">
                                <Label>Associer à une salle</Label>
                                <Select
                                value={data.salle_id || undefined} // Utilisez undefined au lieu de ""
                                onValueChange={(value) => setData('salle_id', value || null)} // Stockez null si vide
                                >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une salle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {salles.map((salle) => (
                                    <SelectItem key={salle.id} value={salle.id.toString()}>
                                        {salle.nom}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </div>
                            </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="submit" disabled={processing}>
                            <AlertCircle className="mr-2 h-4 w-4" />
                            {processing ? 'Création...' : 'Créer l\'alerte'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}