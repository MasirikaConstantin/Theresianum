import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {  Wallet, AlertCircle } from 'lucide-react';
import { Auth, auth, BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FrancCongolais } from '@/hooks/Currencies';

interface Caisse {
    id: number;
    ref: string;
    solde: string;
}

interface Props {
    caisses: Caisse[];
    auth: Auth;
}

export default function DepenseCreate({ caisses, auth }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Depenses', href: '/depenses' },
        { title: 'Nouvelle dépense', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        caisse_id: '',
        libelle: '',
        montant: '',
        description: ''
    });

    const [selectedCaisse, setSelectedCaisse] = useState<Caisse | null>(null);
    const [soldeInsuffisant, setSoldeInsuffisant] = useState(false);

    // Mettre à jour la caisse sélectionnée
    useEffect(() => {
        if (data.caisse_id) {
            const caisse = caisses.find(c => c.id.toString() === data.caisse_id);
            setSelectedCaisse(caisse || null);
        } else {
            setSelectedCaisse(null);
        }
    }, [data.caisse_id, caisses]);

    // Vérifier le solde lorsque le montant ou la caisse change
    useEffect(() => {
        if (selectedCaisse && data.montant) {
            const montant = parseFloat(data.montant) || 0;
            setSoldeInsuffisant(montant > parseFloat(selectedCaisse.solde));
        } else {
            setSoldeInsuffisant(false);
        }
    }, [data.montant, selectedCaisse]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (soldeInsuffisant) {
            toast.error('Le montant dépasse le solde disponible de la caisse');
            return;
        }

        if (parseFloat(data.montant) <= 0) {
            toast.error('Le montant doit être supérieur à 0');
            return;
        }

        post(route('depenses.store'), {
            onError: () => {
                toast.error('Erreur lors de l\'enregistrement de la dépense');
            }
        });
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Enregistrer une dépense" />
            
            <div className="container py-6 px-4">
                <Card>
                    <CardHeader className="flex items-center justify-between mb-6">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Wallet className="h-6 w-6" />
                            Nouvelle dépense
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className=" ">
                            {soldeInsuffisant && (
                                <Alert variant="destructive" className="mb-6 bg-red-300">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Attention</AlertTitle>
                                    <AlertDescription>
                                        Le montant saisi dépasse le solde disponible de cette caisse.
                                        Solde actuel: {FrancCongolais(parseFloat(selectedCaisse?.solde || '0'))}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={submit} className="space-y-6 ">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="caisse_id">Caisse</Label>
                                        <Select
                                            value={data.caisse_id}
                                            onValueChange={(value) => setData('caisse_id', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une caisse" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {caisses.map((caisse) => (
                                                    <SelectItem 
                                                        key={caisse.id} 
                                                        value={caisse.id.toString()}
                                                        disabled={parseFloat(caisse.solde) <= 0}
                                                    >
                                                        Ventes Journalières - Solde: {FrancCongolais(parseFloat(caisse.solde))}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.caisse_id && <p className="text-sm text-red-500">{errors.caisse_id}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="libelle" >Raison</Label>
                                        <Input
                                            id="libelle"
                                            value={data.libelle}
                                            onChange={(e) => setData('libelle', e.target.value)}
                                            required
                                        />
                                        {errors.libelle && <p className="text-sm text-red-500">{errors.libelle}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="montant">Montant (FC)</Label>
                                        <Input
                                            id="montant"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={data.montant}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Empêcher les valeurs négatives
                                                if (parseFloat(value) >= 0) {
                                                    setData('montant', value);
                                                }
                                            }}
                                            required
                                        />
                                        {errors.montant && <p className="text-sm text-red-500">{errors.montant}</p>}
                                        {selectedCaisse && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Solde disponible: {FrancCongolais(parseFloat(selectedCaisse.solde))}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="description">Description (optionnel)</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 ">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('depenses.index')}>
                                            Annuler
                                        </Link>
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={processing || soldeInsuffisant}
                                    >
                                        Enregistrer la dépense
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}