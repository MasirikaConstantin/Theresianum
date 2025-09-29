import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const FrancCongolais = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'CDF'
    }).format(montant).replace('CDF', 'FC');
};

export const Dollar = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'USD'
    }).format(montant).replace('$US', '$');
};

export const DateHeure = (date: string) => {
    return format(new Date(date), 'PPP', { locale: fr });
};