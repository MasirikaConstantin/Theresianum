import { Agent, Auth, Contrat, PageProps, Succursale } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MonDatePicker } from '@/components/example-date-picker';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';

interface FormProps {
    
    typesContrat: string[];
}

export default function Form({ contrat, agents, succursales, typesContrat }: {agents :Agent,contrat :Contrat, succursales : Succursale, typesContrat : any}) {
    const { data, setData, post, put, processing, errors } = useForm({
        agent_id: contrat?.agent_id || '',
        duree: contrat?.duree || '',
        date_debut: contrat?.date_debut ? format(new Date(contrat?.date_debut), 'yyyy-MM-dd') : '',
        date_fin: contrat?.date_fin ? format(new Date(contrat?.date_fin), 'yyyy-MM-dd') : '',
        type_contrat: contrat?.type_contrat || '',
        anciennete: contrat?.anciennete || '',
        fonction: contrat?.fonction || '',
        salaire_base: contrat?.salaire_base || '',
        succursale_id: contrat?.succursale_id || '',
        is_active: contrat?.is_active || false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (contrat?.id) {
            put(route('contrats.update', contrat.id));
        } else {
            post(route('contrats.store'));
        }
    };
    return (


        <div className="p-6">
            <form onSubmit={submit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="agent_id">Agent</Label>
                        <Select
                            value={data.agent_id.toString()}
                            onValueChange={(value) => setData('agent_id', parseInt(value))}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un agent" />
                            </SelectTrigger>
                            <SelectContent>
                                {agents.map((agent) => (
                                    <SelectItem key={agent.id} value={agent.id.toString()}>
                                        {`${agent.nom} ${agent.postnom} ${agent.prenom}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.agent_id && <p className="text-sm text-red-600">{errors.agent_id}</p>}
                        <Alert className='mt-2 bg-card' variant="default">
                            <AlertDescription>
                                Seul les agents actifs peuvent avoir un contrat.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <div>
                        <Label htmlFor="type_contrat">Type de Contrat</Label>
                        <Select
                            value={data.type_contrat}
                            onValueChange={(value) => setData('type_contrat', value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                                {typesContrat.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.type_contrat && <p className="text-sm text-red-600">{errors.type_contrat}</p>}
                    </div>

                    <div>
                        <MonDatePicker
                            label="Date Début"
                            value={data.date_debut}
                            onChange={(dateString) => setData('date_debut', dateString)}
                            />
                        {errors.date_debut && <p className="text-sm text-red-600">{errors.date_debut}</p>}
                    </div>

                    <div>
                        <MonDatePicker
                            label="Date Fin (optionnel)"
                            value={data.date_fin}
                            onChange={(dateString) => setData('date_fin', dateString)}
                            />
                        {errors.date_fin && <p className="text-sm text-red-600">{errors.date_fin}</p>}
                    </div>

                    <div>
                        <Label htmlFor="duree">Durée</Label>
                        <Input
                            id="duree"
                            value={data.duree}
                            onChange={(e) => setData('duree', e.target.value)}
                            placeholder="Ex: 1 an, 6 mois..."
                            
                        />
                        {errors.duree && <p className="text-sm text-red-600">{errors.duree}</p>}
                    </div>

                    <div>
                        <Label htmlFor="role">Fonction <span className="text-red-500">*</span></Label>
                        <Select
                            value={data.fonction}
                            onValueChange={(value) => setData('fonction', value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une fonction" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Administrateur</SelectItem>
                                <SelectItem value="ressource_humaine">Ressource Humaine</SelectItem>
                                <SelectItem value="communicateur">Communicateur</SelectItem>
                                <SelectItem value="caissière">Caissière</SelectItem>
                                <SelectItem value="manager">Gestionnaire</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                                <SelectItem value="assistant_direction">Assistant Direction</SelectItem>
                                <SelectItem value="charge_vente_client">Charge vente client</SelectItem>
                                <SelectItem value="coiffeuse">Coiffeuse</SelectItem>
                                <SelectItem value="maquilleuse">Maquilleuse  </SelectItem>
                                <SelectItem value="cleaner">Cleaner</SelectItem>
                                <SelectItem value="estheticienne">Esthéticienne</SelectItem>
                                <SelectItem value="prothesiste">Prothésiste</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.fonction && <p className="text-sm text-red-600">{errors.fonction}</p>}
                                    </div>

                    <div>
                        <Label htmlFor="succursale_id">Succursale (optionnel)</Label>
                        <Select
                            value={data.succursale_id?.toString() || ''}
                            onValueChange={(value) => setData('succursale_id', value ? parseInt(value) : null)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une succursale" />
                            </SelectTrigger>
                            <SelectContent>
                                {succursales.map((succursale) => (
                                    <SelectItem key={succursale.id} value={succursale.id.toString()}>
                                        {succursale.nom}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.succursale_id && <p className="text-sm text-red-600">{errors.succursale_id}</p>}
                    </div>

                    <div>
                        <Label htmlFor="salaire_base">Salaire de Base (optionnel)</Label>
                        <Input
                            id="salaire_base"
                            value={data.salaire_base || ''}
                            onChange={(e) => setData('salaire_base', e.target.value)}
                            type="number"
                        />
                        {errors.salaire_base && <p className="text-sm text-red-600">{errors.salaire_base}</p>}
                    </div>

                    <div>
                        <Label htmlFor="anciennete">Ancienneté (optionnel)</Label>
                        <Input
                            id="anciennete"
                            value={data.anciennete || ''}
                            onChange={(e) => setData('anciennete', e.target.value)}
                            placeholder="Ex: 2 ans, 6 mois..."
                        />
                        {errors.anciennete && <p className="text-sm text-red-600">{errors.anciennete}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', Boolean(checked))}
                        />
                        <Label htmlFor="is_active">Contrat Actif</Label>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                        {contrat?.id ? 'Mettre à jour' : 'Créer'}
                    </Button>
                </div>
            </form>
        </div>
    );
}