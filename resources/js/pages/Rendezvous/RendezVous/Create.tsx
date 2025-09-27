import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CreateRendezVous({ succursales, services }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        succursale_id: '',
        date_rdv: '',
        heure_debut: '',
        telephone: '',
        nom: '',
        prenom: '',
        email: '',
        date_naissance: '',
        heure_fin: '',
        notes: '',
        services: []
    });
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [confim, setConfirm] = useState(false)
    // Gestion de la sélection des services
    const handleServiceChange = (serviceId: string) => {
        const newSelectedServices = selectedServices.includes(serviceId)
          ? selectedServices.filter(id => id !== serviceId)
          : [...selectedServices, serviceId];
        
        setSelectedServices(newSelectedServices);
        // Mettez à jour immédiatement data.services
        setData('services', newSelectedServices);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Vérification des champs requis
        if(selectedServices.length === 0){
            toast.error('Veuillez sélectionner au moins un service');
            return;
        }
        if (!data.succursale_id || !data.date_rdv || !data.heure_debut ||
            (!data.nom || !data.telephone)) {
            console.log('Champs manquants');
            //console.log(data);
            return;
        }
        console.log(data);
        post(route('rendezvous.store'), {
            onSuccess: () => {
                reset();
                toast.success('Votre rendez-vous a été bien enregistré. Vous serez contacté d\'ici peu pour validation.');
                setConfirm(true);
                reset();
                closeModal();
            },
            onError: () => {
                toast.error('Une erreur est survenue');
            }
        });
    };

    // Fonction pour ouvrir le modal
    const openModal = (e: React.MouseEvent) => {
        e.preventDefault(); // Empêche la soumission du formulaire
        const modal = document.getElementById('my_modal_4') as HTMLDialogElement;
        modal?.showModal();
    };

    // Fonction pour fermer le modal
    const closeModal = () => {
        const modal = document.getElementById('my_modal_4') as HTMLDialogElement;
        modal?.close();
    };

    // Fonction pour confirmer la sélection
    const confirmSelection = () => {
        setData('services', selectedServices);
        closeModal();
    };
    

    return (
        <GuestLayout title="Prendre Rendez-vous">
            <Head>
                <title>Prendre Rendez-vous</title>
                <meta name="description" content="Prenez rendez-vous dans notre salon" />
                <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
                <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                <link href="https://cdn.jsdelivr.net/npm/daisyui@5/themes.css" rel="stylesheet" type="text/css" />
            </Head>
            <div className="card bg-base-100 shadow-xl max-w-3xl mx-auto">
                {confim &&(
                    <div role="alert" className="alert alert-success m-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Votre rendez-vous a été bien enregistré. Vous serez contacté d'ici peu pour validation.</span>
                        <span>Merci pour votre Fidelité.</span>
                    </div>
                )}

                <div className="card-body">
                    <h1 className="card-title text-3xl mb-6">Prendre un rendez-vous</h1>

                    <div className="divider text-lg font-medium">Informations Salon</div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Sélection du salon */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Salon</span>
                            </label>

                            {/* Sélecteur de salon */}
                            <select
                                className="select select-bordered w-full"
                                value={data.succursale_id}
                                onChange={(e) => setData('succursale_id', e.target.value)}
                                required
                            >
                                <option disabled value="">Sélectionnez un salon</option>
                                {succursales?.map((succursale: any) => (
                                    <option key={succursale.id} value={succursale.id}>
                                        {succursale.nom} - {succursale.adresse.slice(0, 20)}...
                                    </option>
                                ))}
                            </select>

                            {/* Affichage du salon sélectionné */}
                            {data.succursale_id && (
                                <div className="mt-3 p-3 bg-base-100 border border-base-300 rounded-box">
                                    {succursales?.find(s => s.id.toString() === data.succursale_id.toString()) && (
                                        <>
                                            <p className="font-medium">
                                                {succursales.find(s => s.id.toString() === data.succursale_id.toString()).nom}
                                            </p>
                                            <p className="text-sm opacity-75">
                                                {succursales.find(s => s.id.toString() === data.succursale_id.toString()).adresse}
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            {errors.succursale_id && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.succursale_id}</span>
                                </label>
                            )}
                        </div>

                        {/* Sélection de la date */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Date du rendez-vous</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered w-full"
                                min={new Date().toISOString().split('T')[0]}
                                value={data.date_rdv}
                                onChange={(e) => setData('date_rdv', e.target.value)}
                                required
                            />
                            {errors.date_rdv && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.date_rdv}</span>
                                </label>
                            )}
                        </div>

                        {/* Sélection du créneau horaire */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Heure du rendez-vous</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={data.heure_debut}
                                onChange={(e) => {
                                    // Mettre à jour l'heure de début
                                    setData('heure_debut', e.target.value);
                                    
                                    // Calculer et mettre à jour l'heure de fin (+1 heure)
                                    const heures = parseInt(e.target.value.slice(0, 2));
                                    const heureFin = `${(heures + 1).toString().padStart(2, '0')}:00`;
                                    setData('heure_fin', heureFin);
                                }}
                                required
                                >
                                <option disabled value="">Sélectionnez une heure</option>
                                <option value="09:00">09:00 - 10:00</option>
                                <option value="10:00">10:00 - 11:00</option>
                                <option value="11:00">11:00 - 12:00</option>
                                <option value="14:00">14:00 - 15:00</option>
                                <option value="15:00">15:00 - 16:00</option>
                                <option value="16:00">16:00 - 17:00</option>
                            </select>
                            
                            {/* Champ caché pour l'heure de fin (début + 1h) */}
                            <input 
                                type="hidden" 
                                name="heure_fin"
                                value={data.heure_debut.slice(0, 5)}
                            />
                            
                            {errors.heure_debut && (
                                <label className="label">
                                <span className="label-text-alt text-error">{errors.heure_debut}</span>
                                </label>
                            )}
                            </div>

                        <div className="divider text-lg font-medium">Informations Client</div>

                        

                        
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Nom</span> <span className="label-text-alt text-error">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full"
                                            value={data.nom}
                                            onChange={(e) => setData('nom', e.target.value)}
                                            required
                                        />
                                        {errors.nom && (
                                            <label className="label">
                                                <span className="label-text-alt text-error">{errors.nom}</span>
                                            </label>
                                        )}
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Email (optionnel)</span>
                                        </label>
                                        <input
                                            type="email"
                                            className="input input-bordered w-full"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            
                                        />
                                        {errors.email && (
                                            <label className="label">
                                                <span className="label-text-alt text-error">{errors.email}</span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Téléphone </span> <span className="label-text-alt text-error">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            className="input input-bordered w-full"
                                            value={data.telephone}
                                            onChange={(e) => setData('telephone', e.target.value)}
                                            required
                                        />
                                        {errors.telephone && (
                                            <label className="label">
                                                <span className="label-text-alt text-error">{errors.telephone}</span>
                                            </label>
                                        )}
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Date de naissance (optionnel)</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="input input-bordered w-full"
                                            value={data.date_naissance}
                                            onChange={(e) => setData('date_naissance', e.target.value)}
                                            
                                        />
                                        {errors.date_naissance && (
                                            <label className="label">
                                                <span className="label-text-alt text-error">{errors.date_naissance}</span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                        <div className="divider text-lg font-medium">Services souhaités</div>

                        {/* Bouton pour ouvrir le modal */}
                        <button 
                            type="button"
                            className="btn" 
                            onClick={openModal}
                        >
                            {selectedServices.length > 0 ? `${selectedServices.length} service(s) sélectionné(s)` : "Sélectionner les services"}
                        </button>

                        {/* Affichage des services sélectionnés */}
                        {selectedServices.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {services
                                    ?.filter(service => selectedServices.includes(service.id.toString()))
                                    .map(service => (
                                        <div key={service.id} className="card bg-base-100 border border-base-300 rounded-box p-4">
                                            <div className="flex flex-col gap-2">
                                                <span className="font-medium break-words">{service.name}</span>
                                                <div className="text-sm">
                                                    <span className="opacity-75">
                                                        Durée: {service.duree} min - Prix: {service.prix}$
                                                    </span>
                                                </div>
                                                {service.description && (
                                                    <div className="text-xs text-gray-500 break-words">
                                                        {service.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        )}

                        {/* Modal de sélection */}
                        <dialog id="my_modal_4" className="modal">
                            <div className="modal-box w-11/12 max-w-5xl">
                                <h3 className="font-bold text-lg">Services</h3>
                                <p className="py-4">Sélectionner les services</p>

                                <div className="form-control mb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {services?.map((service: any) => (
                                            <div key={service.id} className="card bg-base-100 border border-base-300 rounded-box p-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-primary flex-shrink-0"
                                                            checked={selectedServices.includes(service.id.toString())}
                                                            onChange={() => handleServiceChange(service.id.toString())}
                                                        />
                                                        <span className="font-medium break-words">{service.name}</span>
                                                    </label>
                                                    <div className="text-sm pl-8">
                                                        <span className="opacity-75">
                                                            Durée: {service.duree} min - Prix: {service.prix}$
                                                        </span>
                                                    </div>
                                                    {service.description && (
                                                        <div className="text-xs text-gray-500 break-words pl-8">
                                                            {service.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.services && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">{errors.services}</span>
                                        </label>
                                    )}
                                </div>

                                <div className="modal-action">
                                    <div className='flex justify-end space-x-2'>
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={closeModal}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={confirmSelection}
                                        >
                                            Confirmer ({selectedServices.length})
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </dialog>

                        {/* Notes */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Notes supplémentaires (optionnel)</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered h-24"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Précisez vos besoins..."
                            ></textarea>
                        </div>

                        {/* Bouton de soumission */}
                        <div className="card-actions justify-end mt-8">
                            <button
                                type="submit"
                                className={`btn btn-primary ${processing ? 'loading' : ''}`}
                                disabled={processing}
                            >
                                {processing ? '' : 'Confirmer le rendez-vous'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}