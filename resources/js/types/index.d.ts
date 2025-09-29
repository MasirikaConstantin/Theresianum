import { DateTimeDuration } from '@internationalized/date';
import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    succursale?: Succursale;
    pendingTransfersCount?: number;
    promotion?: Promotion;
}
export interface Promotion{
    is_actif: boolean;
}
export interface Categorie {
    id: number;
    ref: string;
    nom: string;
    description: string;
    creted_by: User;
    updated_by: User;
    enregistre_par: User;
    modifie_par: User;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    enregistre_par?: {
        id: number
        name: string
        email: string
      }
      modifie_par?: {
        id: number
        name: string
        email: string
      }
    deleted_at: string | null;
}
export interface ProduitStats {
    categorie_id: number;
    categorie_nom: string;
    total_produits: number;
    total_ventes: number;
    chiffre_affaire: number;
    stock_moyen: number;
    produits_en_alerte: number;
    marge_moyenne: number;
    top_produits: {
      id: number;
      nom: string;
      ventes: number;
    }[];
    evolution_mensuelle: {
      mois: string;
      ventes: number;
      chiffre_affaire: number;
    }[];
  }
export interface Conge {
    id: number;
    ref: string;
    agent:Agent;
    type: string;
    date_debut: string;
    date_fin: string;
    duree_jours: number;
    motif: string;
    statut: string;
    commentaire?: string;
    created_at: string;
    approbateur?: User;
    canApprove: boolean;
}
export interface Entreprise{
    nom : string;
    adresse : string;
    rccm : string;
    id_nat : string;
    telephone : string;
    email : string;
    logo_url : string;
}
export interface Configuration{
    actif: boolean
    created_at: DateTimeDuration
    id: number
    ratio_achat: number
    ref: string
    seuil_utilisation: number
    updated_at: DateTimeDuration
    valeur_point: number
}
export interface Agent {
    id: number;
    created_at: DateTimeDuration;
    updated_at: DateTimeDuration;
    deleted_at: DateTimeDuration;
        matricule: string;
        numero_cnss: string;
        nom: string;
        date_naissance: string;
        lieu_naissance: string;
        postnom: string;
        prenom: string;
        sexe: string;
        telephone?: string;
        adresse?: string;
        date_naissance?: string;
        lieu_naissance?: string;
        etat_civil?: string;
        avatar?: string;
        signature?: string;
        avatar_url?: string;
        signature_url?: string;
        ref: string;
        province_origine?: string;
        territoire_origine?: string;
        district_origine?: string;
        commune_origine?: string;
        email?: string;
        role?: string;
        succursale_id?: string;
        statut?: string;
        nombre_enfant?: number;
    succursales: Succursale[];
    succursale: Succursale;
    contrats: Contrat[];
}
export interface Reference{
    id : number,
    ref : string,
    nom : string,
    fonction : string
}
export interface Promotion {
    id: number;
    ref: string;
    is_actif: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
export interface Vente {
    id: number;
    ref: string;
    client_id: number;
    succursale_id: number;
    vendeur_id: number;
    remise: number;
    montant_total: number;
    mode_paiement: string;
    code: string;
    caisse_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    client?: Client;
    succursale?: Succursale;
    vendeur?: User;
    caisse?: Caisse;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}
export interface Depense {
    id:number,
    libelle : string,
    montant : number,
    description:  string,
    ref : string
}
export interface Pointage {
    id : number,
    agent_id: number,
    date: string,
    heure_arrivee: string,
    heure_depart: string,
    statut: string,
    statut_arrivee: string,
    statut_depart: string,
    justifie: boolean,
    justification: string,
    notes: string,
    ref: string,
    created_at: string,
    updated_at: string,
    deleted_at: string,
    agent: Agent,
    created_by: User,
    updated_by: User,
    ref: string
}

interface PaieFormProps {
    agents: Agent[];
    nextRef?: string;
    defaultPeriod?: {
        start: string;
        end: string;
        emission: string;
    };
    paie?: {
        id?: number;
        ref?: string;
        agent_id?: number;
        date_debut_periode?: string;
        date_fin_periode?: string;
        date_emission?: string;
        salaire_base?: number;
        heures_supplementaires?: number;
        conges_payes?: number;
        pecule_conge?: number;
        gratification?: number;
        prime_fidelite?: number;
        prime_diverse?: number;
        allocation_familiale?: number;
        allocation_epouse?: number;
        afm_gratification?: number;
        cotisation_cnss?: number;
        impot_revenu?: number;
        prets_retenus?: number;
        avance_salaire?: number;
        paie_negative?: number;
        autres_regularisations?: number;
        net_a_payer?: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}
export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href?: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[]; // Pour les sous-menus
    isOpen?: boolean; // Pour gérer l'état ouvert/fermé
    roles?: string[];

}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    flash: {
        error?: string;
        success?: string;
        message?: string;
    };
    succursales?: Succursale[];
    succursale?: Succursale;
    clients?: Client[];
    client?: Client;
    services?: Service[];
    service?: Service;
    auth: Auth;
    [key: string]: unknown;
}
export type Currency = {
    id: number;
    name: string;
    code: string;
    symbol: string;
    exchange_rate: number;
    is_active: boolean;
    is_default: boolean;
    ref: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
export type Client = {
    id: number;
    name: string;
    telephone: string | null;
    email: string | null;
    notes: string | null;
    ref: string;
    succursale_id: number | null;
    enregistrer_par_id: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    succursale?: Succursale;
    enregistre_par?: User;
    fidelite ?:Fidelite
};
export type Fidelite = {
    id: number
    ref: string
    client_id: 4
    points: number
}

export type Service = {
    id: number;
    name: string;
    description: string | null;
    duree_minutes: number;
    prix: number;
    actif: boolean;
    ref: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    enregistre_par?: User;
};
export type Contrat = {
    id: number;
    ref: string;
    agent_id: number;
    succursale_id: number;
    date_debut: string;
    date_fin: string;
    created_at: string;
    type_contrat: string;
    duree : string;
    anciennete :string;
    fonction: string;
    salaire_base: string;
    is_active: boolean;
    updated_at: string;
    created_by: User;
    updated_by: User;
    deleted_at: string | null;
    agent?: User;
    succursale?: Succursale;
    caisse?: Caisse;
}

   
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_url?: string;
    email_verified_at: string | null;
    created_at: string;
    role: string;
    ref: string;
    telephone?: string;
    adresse?: string;
    succursale_id: number | null;
    is_active: boolean;
    updated_at: string;
    succursale?: Succursale;
    [key: string]: unknown; // This allows for additional properties...
}
export type Produit = {
    id: number;
    name: string;
    stock_succursales: Array<{
        succursale_id: number;
        quantite: number;
    }>;
}

export type Succursale = {
    id: number;
    nom: string;
    adresse: string;
    telephone: string;
    email?: string;
    date_creation: string;
    ref: string;
    created_at: string;
    updated_at: string;
};

interface RendezVousCountProps {
    initialCount: number;
}

interface PageProps {
    auth: {
        user: {
            succursale_id: number | null;
            id: number;
            name: string;
            email: string;
            role : string
        };
    };
}
interface flash{
    error : string,
    success : string
}

const auth: {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}


declare module '@inertiajs/core' {
    interface PageProps {
        auth: {
            user: {
                id: number;
                name: string;
                email: string;
                role : string
                // Ajoutez d'autres propriétés utilisateur si nécessaire
            };
        };
        // Ajoutez d'autres propriétés globales partagées par toutes les pages
    }
}

interface PaieShowProps extends PageProps {
    paie: {
        id: number;
        ref: string;
        agent_id: number;
        matricule: string;
        nom_complet: string;
        fonction: string;
        affectation: string;
        numero_cnss: string;
        anciennete: string;
        date_debut_periode: string;
        date_fin_periode: string;
        date_emission: string;
        salaire_base: number;
        heures_supplementaires: number;
        conges_payes: number;
        pecule_conge: number;
        gratification: number;
        prime_fidelite: number;
        prime_diverse: number;
        allocation_familiale: number;
        allocation_epouse: number;
        afm_gratification: number;
        cotisation_cnss: number;
        impot_revenu: number;
        prets_retenus: number;
        avance_salaire: number;
        paie_negative: number;
        autres_regularisations: number;
        remuneration_brute: number;
        total_retenues: number;
        net_imposable: number;
        net_a_payer: number;
        created_at: string;
        updated_at: string;
        created_by: {
            name: string;
        };
        updated_by?: {
            name: string;
        };
    };
    agent: Agent;
    auth: Auth;  
    entreprise: {
        name: string;
        address: string;
        phone: string;
        email: string;
        cnss_number: string;
    };









    
}

interface Occupation {
    id: number;
    ref: string;
    date_occupation: string;
    statut: string;
    reservation_id: number;
    created_at: string;
}

interface Reservation {
    id: number;
    date_debut: string;
    date_fin: string;
    statut: string;
    prix_total: number;
    ref: string;
    client: {
        id: number;
        nom: string;
        prenom: string;
        email: string;
        telephone: string;
    };
    occupations: Occupation[];
}

interface Chambre {
    id: number;
    ref: string;
    numero: string;
    type: string;
    nom: string;
    prix: number;
    capacite: number;
    equipements: string;
    statut: string;
    created_at: string;
    updated_at: string;
    reservations: Reservation[];
    data: {
        from: number;
        to: number;
        total: number;
    }
}
