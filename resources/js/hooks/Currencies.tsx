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
    }).format(montant).replace('USD', '$');
};