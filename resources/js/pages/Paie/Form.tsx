import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Agent, PaieFormProps } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/formatMoney';
import { toast } from 'sonner';
import AgentStats from './AgentsList';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { fr } from 'date-fns/locale';



export default function PaieForm({ defaultPeriod, paie, flash }: PaieFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        agent_id: paie?.agent_id || '',
        date_debut_periode: paie?.date_debut_periode ? format(new Date(paie.date_debut_periode), 'yyyy-MM-dd') : format(new Date(defaultPeriod?.start || ''), 'yyyy-MM-dd') || '',
        date_fin_periode: paie?.date_fin_periode ? format(new Date(paie.date_fin_periode), 'yyyy-MM-dd') : format(new Date(defaultPeriod?.end || ''), 'yyyy-MM-dd') || '',
        date_emission: paie?.date_emission ? format(new Date(paie.date_emission), 'yyyy-MM-dd') : format(new Date(defaultPeriod?.emission || ''), 'yyyy-MM-dd') || '',
        salaire_base: paie?.salaire_base || 0,
        heures_supplementaires: paie?.heures_supplementaires || 0,
        conges_payes: paie?.conges_payes || 0,
        pecule_conge: paie?.pecule_conge || 0,
        gratification: paie?.gratification || 0,
        prime_fidelite: paie?.prime_fidelite || 0,
        prime_diverse: paie?.prime_diverse || 0,
        allocation_familiale: paie?.allocation_familiale || 0,
        allocation_epouse: paie?.allocation_epouse || 0,
        afm_gratification: paie?.afm_gratification || 0,
        cotisation_cnss: paie?.cotisation_cnss || 0,
        impot_revenu: paie?.impot_revenu || 0,
        prets_retenus: paie?.prets_retenus || 0,
        avance_salaire: paie?.avance_salaire || 0,
        paie_negative: paie?.paie_negative || 0,
        autres_regularisations: paie?.autres_regularisations || 0,
        net_a_payer: paie?.net_a_payer || 0,
    });

    const [agents, setAgents] = useState<Agent[]>([]);

    // Fonction pour calculer les totaux
    const calculateTotals = () => {
        // Conversion explicite en nombres
        const salaireBase = Number(data.salaire_base) || 0;
        const heuresSupplementaires = Number(data.heures_supplementaires) || 0;
        const congesPayes = Number(data.conges_payes) || 0;
        const peculeConge = Number(data.pecule_conge) || 0;
        const gratification = Number(data.gratification) || 0;
        const primeFidelite = Number(data.prime_fidelite) || 0;
        const primeDiverse = Number(data.prime_diverse) || 0;
        const allocationFamiliale = Number(data.allocation_familiale) || 0;
        const allocationEpouse = Number(data.allocation_epouse) || 0;
        const afmGratification = Number(data.afm_gratification) || 0;

        const cotisationCnss = Number(data.cotisation_cnss) || 0;
        const impotRevenu = Number(data.impot_revenu) || 0;
        const pretsRetenus = Number(data.prets_retenus) || 0;
        const avanceSalaire = Number(data.avance_salaire) || 0;
        const paieNegative = Number(data.paie_negative) || 0;
        const autresRegularisations = Number(data.autres_regularisations) || 0;

        // Calcul des gains
        const gains = salaireBase 
            + heuresSupplementaires
            + congesPayes
            + peculeConge
            + gratification
            + primeFidelite
            + primeDiverse
            + allocationFamiliale
            + allocationEpouse
            + afmGratification;

        // Calcul des retenues
        const retenues = cotisationCnss
            + impotRevenu
            + pretsRetenus
            + avanceSalaire
            + paieNegative
            + autresRegularisations;

        const netAPayer = gains - retenues;

        return {
            remunerationBrute: gains,
            totalRetenues: retenues,
            netAPayer: netAPayer,
        };
    };

    const totals = calculateTotals();

    // Mettre à jour automatiquement le net_a_payer à chaque changement
    useEffect(() => {
        setData('net_a_payer', totals.netAPayer);
    }, [
        data.salaire_base, data.heures_supplementaires, data.conges_payes, 
        data.pecule_conge, data.gratification, data.prime_fidelite, data.prime_diverse,
        data.allocation_familiale, data.allocation_epouse, data.afm_gratification,
        data.cotisation_cnss, data.impot_revenu, data.prets_retenus,
        data.avance_salaire, data.paie_negative, data.autres_regularisations
    ]);

    useEffect(() => {
        axios.get(route('get-agent'), {
            params: {
                date: data.date_debut_periode,
                date_fin_periode: data.date_fin_periode,
            },
        })
            .then(response => {
                setAgents(response.data);
            })
            .catch(error => {
                console.error('Error fetching agents:', error);
            });
    }, [data.date_debut_periode, data.date_fin_periode]);

    if(flash?.success){
        toast.success(flash.success);
    }
    if(flash?.error){
        toast.error(flash.error);
    }

    const selectedAgent = agents.find(agent => agent.id === Number(data.agent_id));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // S'assurer que tous les champs sont bien inclus dans les données
        const formData = {
            ...data,
            // Forcer la conversion en nombres pour éviter les erreurs
            salaire_base: Number(data.salaire_base) || 0,
            heures_supplementaires: Number(data.heures_supplementaires) || 0,
            conges_payes: Number(data.conges_payes) || 0,
            pecule_conge: Number(data.pecule_conge) || 0,
            gratification: Number(data.gratification) || 0,
            prime_fidelite: Number(data.prime_fidelite) || 0,
            prime_diverse: Number(data.prime_diverse) || 0,
            allocation_familiale: Number(data.allocation_familiale) || 0,
            allocation_epouse: Number(data.allocation_epouse) || 0,
            afm_gratification: Number(data.afm_gratification) || 0,
            cotisation_cnss: Number(data.cotisation_cnss) || 0,
            impot_revenu: Number(data.impot_revenu) || 0,
            prets_retenus: Number(data.prets_retenus) || 0,
            avance_salaire: Number(data.avance_salaire) || 0,
            paie_negative: Number(data.paie_negative) || 0,
            autres_regularisations: Number(data.autres_regularisations) || 0,
            net_a_payer: totals.netAPayer, // Utiliser le calcul en temps réel
        };

        if (paie?.id) {
            put(route('paies.update', paie.id), {
                data: formData,
                onSuccess: () => {
                    toast.success('Bulletin de paie mis à jour avec succès.');
                },
                onError: (error) => {
                    toast.error('Erreur lors de la mise à jour.');
                    console.error('Erreurs:', error);
                }
            });
        } else {
            post(route('paies.store'), {
                data: formData,
                onSuccess: () => {
                    toast.success('Bulletin de paie créé avec succès.');
                },
                onError: (error) => {
                    toast.error('Erreur lors de la création.');
                    console.error('Erreurs:', error);
                }
            });
        }
    };
    console.log(data);

    // Fonction pour mettre à jour un champ et recalculer automatiquement
    const updateField = (field: string, value: number) => {
        setData(field as any, value);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Informations de base</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   

                    <div className="space-y-2">
                        <Label htmlFor="agent_id">Agent </Label>
                        <Select
                            value={String(data.agent_id)}
                            onValueChange={(value) => {
                                const agentId = Number(value);
                                const selectedAgent = agents.find(agent => agent.id === agentId);
                                setData({
                                    ...data,
                                    agent_id: agentId,
                                    salaire_base: Number(selectedAgent?.contrats[0]?.salaire_base) || 0
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un agent" />
                            </SelectTrigger>
                            <SelectContent>
                                {agents.map((agent) => (
                                    <SelectItem key={agent.id} value={String(agent.id)}>
                                        {agent.matricule} - {agent.nom} {agent.postnom} 
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.agent_id && <p className="text-sm text-red-500">{errors.agent_id}</p>}
                    </div>

                    {selectedAgent && (
                        <div className="space-y-2 ml-6">
                            <Label>Informations Agent</Label>
                            <div className="text-sm p-2 border rounded">
                                <p>Matricule: <span className="font-bold">{selectedAgent.matricule || 'Non renseigné'}</span></p>
                                <p>CNSS: <span className="font-bold">{selectedAgent.numero_cnss || 'Non renseigné'}</span></p>
                                <p>Enfants: <span className="font-bold">{selectedAgent.nombre_enfant || 0}</span></p>
                                <p>Fonction: <span className="font-bold">{selectedAgent.role === 'admin' ? 'Administrateur' : selectedAgent.role === 'ressource_humaine' ? 'Ressource Humaine' : selectedAgent.role === 'communicateur' ? 'Communicateur' : selectedAgent.role === 'caissière' ? 'Caissière' : selectedAgent.role === 'manager' ? 'Gestionnaire' : selectedAgent.role === 'agent' ? 'Agent' : selectedAgent.role === 'assistant_direction' ? 'Assistant Direction' : selectedAgent.role === 'charge_vente_client' ? 'Charge vente client' : selectedAgent.role === 'coiffeuse' ? 'Coiffeuse' : selectedAgent.role === 'maquilleuse' ? 'Maquilleuse' : selectedAgent.role === 'cleaner' ? 'Cleaner' : selectedAgent.role === 'estheticienne' ? 'Esthéticienne' : selectedAgent.role === 'prothesiste' ? 'Prothésiste' : 'Autre'}</span></p>
                            </div>
                            <AgentStats agent={selectedAgent} />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Période de paie</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Date début période</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !data.date_debut_periode && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {data.date_debut_periode ? (
                                        format(new Date(data.date_debut_periode), "PPP", { locale: fr })
                                    ) : (
                                        <span>Choisir une date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    locale={fr}
                                    selected={data.date_debut_periode ? new Date(data.date_debut_periode) : undefined}
                                    onSelect={(date) => {
                                        setData('date_debut_periode', date ? format(date, 'yyyy-MM-dd') : '');
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.date_debut_periode && <p className="text-sm text-red-500">{errors.date_debut_periode}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Date fin période</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !data.date_fin_periode && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {data.date_fin_periode ? (
                                        format(new Date(data.date_fin_periode), "PPP", { locale: fr })
                                    ) : (
                                        <span>Choisir une date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    locale={fr}
                                    selected={data.date_fin_periode ? new Date(data.date_fin_periode) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            const endDate = new Date(date);
                                            endDate.setDate(endDate.getDate() + 1);
                                            endDate.setMilliseconds(-1);
                                            setData('date_fin_periode', format(endDate, 'yyyy-MM-dd'));
                                        } else {
                                            setData('date_fin_periode', '');
                                        }
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.date_fin_periode && <p className="text-sm text-red-500">{errors.date_fin_periode}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Date d'émission</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !data.date_emission && "text-muted-foreground"
                                    )}  
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {data.date_emission ? (
                                        format(new Date(data.date_emission), "PPP", { locale: fr })
                                    ) : (
                                        <span>Choisir une date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    locale={fr}
                                    selected={data.date_emission ? new Date(data.date_emission) : undefined}
                                    onSelect={(date) => setData('date_emission', date ? format(date, 'yyyy-MM-dd') : '')}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.date_emission && <p className="text-sm text-red-500">{errors.date_emission}</p>}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600">Gains ({formatMoney(totals.remunerationBrute)})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="salaire_base">Salaire de base ($)</Label>
                            <Input
                                id="salaire_base"
                                type="number"
                                step="0.01"
                                value={data.salaire_base}
                                onChange={(e) => updateField('salaire_base', parseFloat(e.target.value) || 0)}
                            />
                            {errors.salaire_base && <p className="text-sm text-red-500">{errors.salaire_base}</p>}
                            {selectedAgent && (
                                <>
                                    {selectedAgent?.contrats[0] ? (
                                        <Alert>
                                            <AlertTitle>Attention</AlertTitle>
                                            <AlertDescription>
                                                Le salaire de base est le salaire inscrit dans le contrat.
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline">Salaire de base</Badge>
                                                    <Badge variant="outline">{selectedAgent?.contrats[0]?.salaire_base}$</Badge>
                                                    <Link href={`/contrats/${selectedAgent?.contrats[0]?.ref}`}>
                                                        <Button variant="outline" size="sm">Voir contrat</Button>
                                                    </Link>
                                                </div>
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <Alert>
                                            <AlertTitle>Attention</AlertTitle>
                                            <AlertDescription>
                                                Aucun contrat actif trouvé pour cet agent.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="heures_supplementaires">Heures supplémentaires ($)</Label>
                            <Input
                                id="heures_supplementaires"
                                type="number"
                                step="0.01"
                                value={data.heures_supplementaires}
                                onChange={(e) => updateField('heures_supplementaires', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="conges_payes">Congés payés ($)</Label>
                            <Input
                                id="conges_payes"
                                type="number"
                                step="0.01"
                                value={data.conges_payes}
                                onChange={(e) => updateField('conges_payes', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pecule_conge">Pécule de congé ($)</Label>
                            <Input
                                id="pecule_conge"
                                type="number"
                                step="0.01"
                                value={data.pecule_conge}
                                onChange={(e) => updateField('pecule_conge', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gratification">Gratification ($)</Label>
                            <Input
                                id="gratification"
                                type="number"
                                step="0.01"
                                value={data.gratification}
                                onChange={(e) => updateField('gratification', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prime_fidelite">Prime de fidélité ($)</Label>
                            <Input
                                id="prime_fidelite"
                                type="number"
                                step="0.01"
                                value={data.prime_fidelite}
                                onChange={(e) => updateField('prime_fidelite', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prime_diverse">Prime diverse ($)</Label>
                            <Input
                                id="prime_diverse"
                                type="number"
                                step="0.01"
                                value={data.prime_diverse}
                                onChange={(e) => updateField('prime_diverse', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="allocation_familiale">Allocation familiale ($)</Label>
                            <Input
                                id="allocation_familiale"
                                type="number"
                                step="0.01"
                                value={data.allocation_familiale}
                                onChange={(e) => updateField('allocation_familiale', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="allocation_epouse">Allocation épouse ($)</Label>
                            <Input
                                id="allocation_epouse"
                                type="number"
                                step="0.01"
                                value={data.allocation_epouse}
                                onChange={(e) => updateField('allocation_epouse', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="afm_gratification">AFM Gratification ($)</Label>
                            <Input
                                id="afm_gratification"
                                type="number"
                                step="0.01"
                                value={data.afm_gratification}
                                onChange={(e) => updateField('afm_gratification', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-600">Retenues ({formatMoney(totals.totalRetenues)})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cotisation_cnss">Cotisation CNSS ($)</Label>
                            <Input
                                id="cotisation_cnss"
                                type="number"
                                step="0.01"
                                value={data.cotisation_cnss}
                                onChange={(e) => updateField('cotisation_cnss', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="impot_revenu">Impôt sur le revenu ($)</Label>
                            <Input
                                id="impot_revenu"
                                type="number"
                                step="0.01"
                                value={data.impot_revenu}
                                onChange={(e) => updateField('impot_revenu', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prets_retenus">Prêts retenus ($)</Label>
                            <Input
                                id="prets_retenus"
                                type="number"
                                step="0.01"
                                value={data.prets_retenus}
                                onChange={(e) => updateField('prets_retenus', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="avance_salaire">Avance sur salaire ($)</Label>
                            <Input
                                id="avance_salaire"
                                type="number"
                                step="0.01"
                                value={data.avance_salaire}
                                onChange={(e) => updateField('avance_salaire', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paie_negative">Paie négative ($)</Label>
                            <Input
                                id="paie_negative"
                                type="number"
                                step="0.01"
                                value={data.paie_negative}
                                onChange={(e) => updateField('paie_negative', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="autres_regularisations">Autres retenues ($)</Label>
                            <Input
                                id="autres_regularisations"
                                type="number"
                                step="0.01"
                                value={data.autres_regularisations}
                                onChange={(e) => updateField('autres_regularisations', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Rémunération brute</Label>
                        <Input
                            value={formatMoney(totals.remunerationBrute)}
                            readOnly
                            className="bg-green-50 font-bold text-green-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Total retenues</Label>
                        <Input
                            value={formatMoney(totals.totalRetenues)}
                            readOnly
                            className="bg-red-50 font-bold text-red-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Net à payer</Label>
                        <Input
                            value={formatMoney(totals.netAPayer)}
                            readOnly
                            className="bg-blue-50 font-bold text-blue-600 text-lg"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" asChild>
                    <a href={route('paies.index')}>Annuler</a>
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Enregistrement...' : (paie?.id ? 'Mettre à jour' : 'Enregistrer')}
                </Button>
            </div>
        </form>
    );
}