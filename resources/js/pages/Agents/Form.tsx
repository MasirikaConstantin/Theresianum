import { Auth, BreadcrumbItem, PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/pages/Agents/DatePicker';
import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { format } from 'date-fns';
import { MonDatePicker } from '@/components/example-date-picker';

interface AgentFormProps {
    agent?: {
        id?: number;
        matricule?: string;
        nom?: string;
        postnom?: string;
        prenom?: string;
        ref?: string;
        sexe?: string;
        telephone?: string;
        adresse?: string;
        date_naissance?: string;
        lieu_naissance?: string;
        etat_civil?: string;
        province_origine?: string;
        territoire_origine?: string;
        district_origine?: string;
        commune_origine?: string;
        numero_cnss?: string;
        email?: string;
        role?: string;
        succursale_id?: string;
        statut?: string;
        nombre_enfant?: number;
    };
    succursales: Array<{ id: string; name: string }>;
}

export default function Form({ auth, agent, succursales }: {auth: Auth, agent: AgentFormProps['agent'], succursales: AgentFormProps['succursales']}) {
    const { data, setData, post, put, processing, errors } = useForm({
        matricule: agent?.matricule || '',
        nom: agent?.nom || '',
        postnom: agent?.postnom || '',
        prenom: agent?.prenom || '',
        sexe: agent?.sexe || 'M',
        telephone: agent?.telephone || '',
        adresse: agent?.adresse || '',
        date_naissance: agent?.date_naissance || '',
        lieu_naissance: agent?.lieu_naissance || '',
        etat_civil: agent?.etat_civil || '',
        province_origine: agent?.province_origine || '',
        territoire_origine: agent?.territoire_origine || '',
        district_origine: agent?.district_origine || '',
        commune_origine: agent?.commune_origine || '',
        email: agent?.email || '',
        role: agent?.role || '',
        succursale_id: agent?.succursale_id || '',
        statut: agent?.statut || 'actif',
        numero_cnss: agent?.numero_cnss || '',
        avatar: null as File | null,
        signature: null as File | null,
        nombre_enfant: agent?.nombre_enfant || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        for (const key in data) {
            if (data[key as keyof typeof data] !== null && data[key as keyof typeof data] !== undefined) {
                formData.append(key, data[key as keyof typeof data] as string | Blob);
            }
        }

        if (agent?.ref) {
            put(route('personnels.update', agent.ref), formData);
        } else {
            post(route('personnels.store'), formData);
        }
    };

    const breadcrumbs : BreadcrumbItem[] = [
        { title: 'Accueil', href: route('dashboard') },
        { title: 'Personnel', href: route('personnels.index') },
        { title: agent?.id ? 'Modifier Agent' : 'Créer un Agent', href: route('personnels.create') },
    ];
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={breadcrumbs}
        >
            <Head title={agent?.id ? 'Modifier Agent' : 'Créer un Agent'} />

            <div className="p-6">
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl leading-tight">
                        {agent?.id ? 'Modifier Agent' : 'Créer un Agent'}
                    </h2>
                    <Link href={route('personnels.index')}>
                        <Button variant="outline">Retour</Button>
                    </Link>
                </div>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="nom">Nom <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="nom"
                                            value={data.nom}
                                            onChange={(e) => setData('nom', e.target.value)}
                                            required
                                        />
                                        {errors.nom && <p className="text-sm text-red-600">{errors.nom}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="postnom">Postnom <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="postnom"
                                            value={data.postnom}
                                            onChange={(e) => setData('postnom', e.target.value)}
                                            required
                                        />
                                        {errors.postnom && <p className="text-sm text-red-600">{errors.postnom}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="prenom">Prénom <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="prenom"
                                            value={data.prenom}
                                            onChange={(e) => setData('prenom', e.target.value)}
                                            required
                                        />
                                        {errors.prenom && <p className="text-sm text-red-600">{errors.prenom}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="sexe">Sexe <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={data.sexe}
                                            onValueChange={(value) => setData('sexe', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner le sexe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="M">Masculin</SelectItem>
                                                <SelectItem value="F">Féminin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.sexe && <p className="text-sm text-red-600">{errors.sexe}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="telephone">Téléphone</Label>
                                        <Input
                                            id="telephone"
                                            value={data.telephone}
                                            onChange={(e) => setData('telephone', e.target.value)}
                                        />
                                        {errors.telephone && <p className="text-sm text-red-600">{errors.telephone}</p>}
                                    </div>

                                    <div>
                                        <MonDatePicker
                                            label="Date de Naissance"
                                            value={data.date_naissance}
                                            onChange={(dateString) => setData('date_naissance', dateString)}
                                        />
                                        {errors.date_naissance && <p className="text-sm text-red-600">{errors.date_naissance}</p>}
                                    </div>
                                    

                                    <div>
                                        <Label htmlFor="lieu_naissance">Lieu de Naissance</Label>
                                        <Input
                                            id="lieu_naissance"
                                            value={data.lieu_naissance}
                                            onChange={(e) => setData('lieu_naissance', e.target.value)}
                                        />
                                        {errors.lieu_naissance && <p className="text-sm text-red-600">{errors.lieu_naissance}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="etat_civil">État Civil</Label>
                                        <Select
                                            value={data.etat_civil}
                                            onValueChange={(value) => setData('etat_civil', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner l'état civil" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="célibataire">Célibataire</SelectItem>
                                                <SelectItem value="marié(e)">Marié(e)</SelectItem>
                                                <SelectItem value="divorcé(e)">Divorcé(e)</SelectItem>
                                                <SelectItem value="veuf(ve)">Veuf(ve)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.etat_civil && <p className="text-sm text-red-600">{errors.etat_civil}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="nombre_enfant">Nombre d'enfants</Label>
                                        <Input
                                            id="nombre_enfant"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={data.nombre_enfant}
                                            onChange={(e) => setData('nombre_enfant', e.target.value)}
                                        />
                                        {errors.nombre_enfant && <p className="text-sm text-red-600">{errors.nombre_enfant}</p>}
                                    </div>

                                    {/*<div>
                                        <Label htmlFor="succursale_id">Succursale</Label>
                                        <Select
                                            value={data.succursale_id?.toString() || ""}
                                            onValueChange={(value) => setData('succursale_id', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner une succursale">
                                                {succursales.find(s => s.id.toString() === data.succursale_id?.toString())?.nom}
                                            </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                            {succursales.map((succursale) => (
                                                <SelectItem 
                                                key={succursale.id} 
                                                value={succursale.id.toString()}
                                                >
                                                {succursale.nom}
                                                </SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.succursale_id && <p className="text-sm text-red-600">{errors.succursale_id}</p>}
                                        </div>

                                    <div>
                                        <Label htmlFor="role">Rôle <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={data.role}
                                            onValueChange={(value) => setData('role', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un rôle" />
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
                                        {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                                    </div>
                                    */}

                                    <div>
                                        <Label htmlFor="statut">Statut <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={data.statut}
                                            onValueChange={(value) => setData('statut', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un statut" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="actif">Actif</SelectItem>
                                                <SelectItem value="inactif">Inactif</SelectItem>
                                                <SelectItem value="suspendu">Suspendu</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.statut && <p className="text-sm text-red-600">{errors.statut}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="numero_cnss">Numéro CNSS (Optionnel)</Label>
                                        <Input
                                            id="numero_cnss"
                                            value={data.numero_cnss}
                                            onChange={(e) => setData('numero_cnss', e.target.value)}
                                        />
                                        {errors.numero_cnss && <p className="text-sm text-red-600">{errors.numero_cnss}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="adresse">Adresse</Label>
                                        <Textarea
                                            id="adresse"
                                            value={data.adresse}
                                            onChange={(e) => setData('adresse', e.target.value)}
                                        />
                                        {errors.adresse && <p className="text-sm text-red-600">{errors.adresse}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="province_origine">Province d'Origine</Label>
                                        <Input
                                            id="province_origine"
                                            value={data.province_origine}
                                            onChange={(e) => setData('province_origine', e.target.value)}
                                        />
                                        {errors.province_origine && <p className="text-sm text-red-600">{errors.province_origine}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="territoire_origine">Territoire d'Origine</Label>
                                        <Input
                                            id="territoire_origine"
                                            value={data.territoire_origine}
                                            onChange={(e) => setData('territoire_origine', e.target.value)}
                                        />
                                        {errors.territoire_origine && <p className="text-sm text-red-600">{errors.territoire_origine}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="district_origine">District d'Origine</Label>
                                        <Input
                                            id="district_origine"
                                            value={data.district_origine}
                                            onChange={(e) => setData('district_origine', e.target.value)}
                                        />
                                        {errors.district_origine && <p className="text-sm text-red-600">{errors.district_origine}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="commune_origine">Commune d'Origine</Label>
                                        <Input
                                            id="commune_origine"
                                            value={data.commune_origine}
                                            onChange={(e) => setData('commune_origine', e.target.value)}
                                        />
                                        {errors.commune_origine && <p className="text-sm text-red-600">{errors.commune_origine}</p>}
                                    </div>

                                    
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        {agent?.id ? 'Mettre à jour' : 'Créer'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}