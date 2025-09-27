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
    { title: 'Modifier alerte', href: '#' },
];

export default function AlertEdit({ alert, produits, rendezvous, auth }: { 
    alert: any;
    produits: any[];
    rendezvous: any[];
    auth: Auth;
}) {
    const { data, setData, put, processing, errors } = useForm({
        notes: alert.notes,
        produit_id: alert.produit_id,
        rendezvou_id: alert.rendezvou_id,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('alerts.update', alert.ref), {
            onSuccess: () => toast.success('Alerte mise à jour avec succès'),
            onError: () => toast.error('Une erreur est survenue'),
        });
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Modifier alerte ${alert.ref}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Modifier l'alerte {alert.ref}</h1>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="grid gap-2">
    <Label>Associer à un produit</Label>
    <Select
      value={data.produit_id ? data.produit_id.toString() : "null"}
      onValueChange={(value) => setData('produit_id', value === "null" ? null : value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Sélectionner un produit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="null">Aucun produit</SelectItem>
        {produits.map((produit) => (
          <SelectItem key={produit.id} value={produit.id.toString()}>
            {produit.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  <div className="grid gap-2">
    <Label>Associer à un rendez-vous</Label>
    <Select
      value={data.rendezvou_id ? data.rendezvou_id.toString() : "null"}
      onValueChange={(value) => setData('rendezvou_id', value === "null" ? null : value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Sélectionner un rendez-vous" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="null">Aucun rendez-vous</SelectItem>
        {rendezvous.map((rendezvou) => (
          <SelectItem key={rendezvou.id} value={rendezvou.id.toString()}>
            {rendezvou.title} - {new Date(rendezvou.date).toLocaleDateString()}
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
                            {processing ? 'Mise à jour...' : 'Mettre à jour'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}