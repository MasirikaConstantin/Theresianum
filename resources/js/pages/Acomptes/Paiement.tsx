import React, { useEffect, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps, Vente, HistoriquePaiement, BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, PlusCircle, History, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function VentePaiement({ auth, reservation, historiquePaiements, flash }: PageProps) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        montant: '',
        mode_paiement: '',
    });


    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            reset();
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // Permettre les nombres décimaux avec 2 décimales maximum
        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
            setData('montant', value);
        }
    };
    

    const getMontantNumber = () => {
        if (data.montant === '') return 0;
        
        // Forcer 2 décimales et éviter les erreurs d'arrondi
        const number = parseFloat(data.montant);
        return Math.round(number * 100) / 100; // Arrondir à 2 décimales
    };
    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const montantNumber = getMontantNumber();
    
        
        if (montantNumber <= 0) {
            toast.error('Le montant doit être supérieur à 0');
            return;
        }
    
        // Correction de l'erreur d'arrondi avec une tolérance
        const tolerance = 0.009; // Tolérance pour les erreurs d'arrondi
        if (montantNumber > (resteAPayer + tolerance)) {
            toast.error(`Le montant ne peut pas dépasser le reste à payer : ${formatCurrency(resteAPayer)}`);
            return;
        }
    
        // Convertir le montant en nombre avant l'envoi avec précision
        const formData = {
            ...data,
            montant: parseFloat(montantNumber.toFixed(2)) // Forcer 2 décimales
        };
    
        console.log('Données envoyées:', formData);
    
        post(route('acomptes.paiement.process', reservation.ref), {
            data: formData,
            onSuccess: () => {
                toast.success('Paiement enregistré avec succès');
                reset();
            },
            onError: (errors) => {
                console.error('Erreurs:', errors);
                if (errors.montant) {
                    toast.error(errors.montant);
                } else {
                    toast.error('Erreur lors de l\'enregistrement du paiement');
                }
            },
        });
    };

    const formatCurrency = (amount: number) => {
        // Éviter les erreurs d'arrondi dans l'affichage
        const roundedAmount = Math.round(amount * 100) / 100;
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(roundedAmount) + ' $';
    };
    
    // Calculer le reste à payer avec précision
    const resteAPayer = Math.round((reservation.prix_total - reservation.montant_payer) * 100) / 100;

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'PPPp', {locale:fr});
    };

    const breadcrumbs = (venteRef: string): BreadcrumbItem[] => [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Acomptes',
            href: '/acomptes',
        },
        {
            title: `Acompte ${venteRef}`,
            href: '#',
        },
    ];

    const montantNumber = getMontantNumber();
    const paiementFait = reservation.montant_payer === reservation.prix_total;
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs(reservation.ref)}>
            <Head title={`Paiement Vente - ${reservation.ref}`} />
            
            <div className="container mx-auto px-4 py-8">
                {/* En-tête */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-2xl font-bold  flex items-center">
                                <CreditCard className="h-6 w-6 mr-2" />
                                Paiement de la reservation
                            </h1>
                            <Link href={route('acomptes.show', reservation.ref)}>
                                <Button variant="outline" className="flex items-center">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Retour
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Informations de la reservation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-blue-800">Référence</h3>
                                <p className="text-lg text-blue-800">{reservation.ref}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-green-800">Montant Total</h3>
                                <p className="text-lg text-green-800">{formatCurrency(reservation.prix_total)}</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-orange-800">Reste à Payer</h3>
                                <p className="text-lg text-orange-800">{formatCurrency(resteAPayer)}</p>
                            </div>
                        </div>

                        {/* Statut */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="font-semibold mr-2">Statut :</span>
                                <Badge 
                                    variant={reservation.statut_paiement === 'paye' ? 'default' : 'destructive'}
                                    className={reservation.statut_paiement === 'paye' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-white'}
                                >
                                    {reservation.statut_paiement === 'paye' ? 'Payé' : 'Non Soldé'}
                                </Badge>
                            </div>
                            <div>
                                <span className="font-semibold">Client :</span>
                                <span className="ml-2">{reservation.client?.telephone || 'Non spécifié'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulaire de paiement */}
                    {!paiementFait && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <PlusCircle className="h-5 w-5 mr-2" />
                                    Nouveau Paiement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                {/* Montant */}
                                <div className="mb-4">
                                    <Label htmlFor="montant" className="mb-2">
                                        Montant du paiement *
                                    </Label>
                                    <Input
                                        type="text"
                                        id="montant"
                                        value={data.montant}
                                        onChange={handleMontantChange}
                                        className="w-full"
                                        placeholder="0.00"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Maximum : {formatCurrency(resteAPayer)}
                                    </p>
                                    {errors.montant && (
                                        <p className="text-red-500 text-sm mt-1">{errors.montant}</p>
                                    )}
                                </div>

                                {/* Mode de paiement */}
                                <div className="mb-6">
                                    <Label htmlFor="mode_paiement" className="mb-2">
                                        Mode de paiement *
                                    </Label>
                                    <Select
                                        value={data.mode_paiement}
                                        onValueChange={(value) => setData('mode_paiement', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez un mode de paiement" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="espèces">Espèces</SelectItem>
                                            <SelectItem value="carte">Carte</SelectItem>
                                            <SelectItem value="chèque">Chèque</SelectItem>
                                            <SelectItem value="autre">Points de fidélité</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.mode_paiement && (
                                        <p className="text-red-500 text-sm mt-1">{errors.mode_paiement}</p>
                                    )}
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full"
                                    disabled={processing || montantNumber <= 0 || !data.mode_paiement}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {processing ? 'Enregistrement...' : 'Enregistrer le Paiement'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    )}

                    {/* Historique des paiements */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <History className="h-5 w-5 mr-2" />
                                Historique des Paiements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {historiquePaiements.length > 0 ? (
                                <div className="space-y-4">
                                    {historiquePaiements.map((paiement) => (
                                        <div key={paiement.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-blue-800">
                                                        {formatCurrency(paiement.montant)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatDate(paiement.created_at)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Par {paiement.operateur.name}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                    {paiement.mode_paiement.charAt(0).toUpperCase() + paiement.mode_paiement.slice(1)}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Receipt className="h-12 w-12 mx-auto mb-4" />
                                    <p>Aucun paiement enregistré pour cette reservation.</p>
                                </div>
                            )}

                            {/* Résumé des paiements */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold">Total payé :</span>
                                    <span className="font-bold text-green-200">
                                        {formatCurrency(reservation.montant_payer)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Reste à payer :</span>
                                    <span className="font-bold text-orange-200">
                                        {formatCurrency(resteAPayer)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}