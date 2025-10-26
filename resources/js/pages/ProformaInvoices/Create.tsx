import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Chambre, Salle, Produit, ProformaInvoiceItem, ProformaInvoiceFormData, BreadcrumbItem, Auth, Client, Currency } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateSimple, Dollar, FrancCongolais } from '@/hooks/Currencies';
import ClientManager from '@/components/ClientManager';
import { Trash2Icon } from 'lucide-react';
import { RecherchePopover } from '@/components/RecherchePopover';

interface Props {
    chambres: Chambre[];
    salles: Salle[];
    produits: Produit[];
    auth: Auth;
    clients: Client[];
    currencies: Currency[]; // Ajouter les devises aux props
}

const Create: React.FC<Props> = ({ chambres, salles, produits, auth, clients, currencies }) => {
    const [selectedType, setSelectedType] = useState<'chambre' | 'salle' | 'produit'>('chambre');
    const [selectedItem, setSelectedItem] = useState<string>('');

    // Trouver la devise CDF (Franc Congolais)
    const cdfCurrency = currencies.find(currency => currency.code === 'CDF');
    const exchangeRate = cdfCurrency ? parseFloat(cdfCurrency.exchange_rate.toString()) : 2500; // Valeur par défaut

    const { data, setData, errors, processing } = useForm<ProformaInvoiceFormData & { montant_total: number }>({
        client_id: '',
        client_nom: '',
        client_email: '',
        client_telephone: '',
        client_adresse: '',
        date_facture: new Date().toISOString().split('T')[0],
        date_echeance: '',
        notes: '',
        items: [],
        montant_total: 0
    });

    // Synchroniser les items avec data.items
    const items = data.items || [];

    const getItemsByType = (type: 'chambre' | 'salle' | 'produit'): (Chambre | Salle | Produit)[] => {
        switch (type) {
            case 'chambre': return chambres;
            case 'salle': return salles;
            case 'produit': return produits;
            default: return [];
        }
    };

    const getDesignation = (type: 'chambre' | 'salle' | 'produit', itemId: number): string => {
        const items = getItemsByType(type);
        const item = items.find(i => i.id === itemId);
        
        switch (type) {
            case 'chambre': return item ? `Logement - ${(item as Chambre).nom}` : 'Logement';
            case 'salle': return item ? `Salle - ${(item as Salle).nom}` : 'Salle';
            case 'produit': return item ? (item as Produit).name : 'Produit';
            default: return 'Article';
        }
    };

    const getDefaultPrice = (type: 'chambre' | 'salle' | 'produit', itemId: number): number => {
        const items = getItemsByType(type);
        const item = items.find(i => i.id === itemId);
        
        if (!item) return 0;
        
        switch (type) {
            case 'chambre': 
                return parseFloat((item as Chambre).prix.toString());
            case 'salle': 
                return parseFloat((item as Salle).prix_journee.toString());
            case 'produit': 
                // Pour les produits, convertir FC en dollars
                const prixFC = parseFloat((item as Produit).prix_vente.toString());
                return prixFC / exchangeRate;
            default: return 0;
        }
    };

    const formatPriceDisplay = (type: 'chambre' | 'salle' | 'produit', itemId: number): string => {
        const items = getItemsByType(type);
        const item = items.find(i => i.id === itemId);
        
        if (!item) return '0 $';
        
        switch (type) {
            case 'chambre': 
                return `${Dollar(parseFloat((item as Chambre).prix.toString()))}`;
            case 'salle': 
                return `${Dollar(parseFloat((item as Salle).prix_journee.toString()))}`;
            case 'produit': 
                const prixFC = parseFloat((item as Produit).prix_vente.toString());
                const prixDollar = prixFC / exchangeRate;
                return `${Dollar(prixDollar)} (${prixFC.toLocaleString()} FC)`;
            default: return '0 $';
        }
    };

    const addItem = (): void => {
        if (!selectedItem) return;

        const itemId = parseInt(selectedItem);
        const prixUnitaire = getDefaultPrice(selectedType, itemId);
        
        const newItem: ProformaInvoiceItem = {
            type: selectedType,
            item_id: itemId,
            designation: getDesignation(selectedType, itemId),
            quantite: 1,
            prix_unitaire: prixUnitaire,
            date_item: new Date().toISOString().split('T')[0],
            montant_total: prixUnitaire
        };

        const updatedItems = [...items, newItem];
        setData({
            ...data,
            items: updatedItems,
            montant_total: calculateTotalFromItems(updatedItems)
        });
        setSelectedItem('');
    };

    const removeItem = (index: number): void => {
        const newItems = items.filter((_, i) => i !== index);
        setData({
            ...data,
            items: newItems,
            montant_total: calculateTotalFromItems(newItems)
        });
    };

    const updateItem = (index: number, field: keyof ProformaInvoiceItem, value: any): void => {
        const newItems = [...items];
        const updatedItem = { ...newItems[index], [field]: value };
        
        if (field === 'quantite' || field === 'prix_unitaire') {
            const quantite = field === 'quantite' ? value : updatedItem.quantite;
            const prix_unitaire = field === 'prix_unitaire' ? value : updatedItem.prix_unitaire;
            updatedItem.montant_total = quantite * prix_unitaire;
        }
        
        newItems[index] = updatedItem;
        
        setData({
            ...data,
            items: newItems,
            montant_total: calculateTotalFromItems(newItems)
        });
    };

    const calculateTotalFromItems = (itemsArray: ProformaInvoiceItem[]): number => {
        return itemsArray.reduce((total, item) => total + (item.montant_total || 0), 0);
    };

    const calculateTotal = (): number => {
        return calculateTotalFromItems(items);
    };

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        
        // S'assurer que le montant total est calculé avant envoi
        const itemsWithTotal = items.map(item => ({
            ...item,
            montant_total: item.quantite * item.prix_unitaire
        }));

        const finalMontantTotal = calculateTotalFromItems(itemsWithTotal);
        
        // Préparer les données avec montant_total
        const formData = {
            ...data,
            items: itemsWithTotal,
            montant_total: finalMontantTotal
        };
        
        router.post(route('proforma-invoices.store'), formData);
    };

    const handleClientSelected = (client: Client): void => {
        setData({
            ...data,
            client_id: client.id.toString(),
            client_nom: client.name,
            client_email: client.email || '',
            client_telephone: client.telephone || '',
            client_adresse: client.adresse || '',
        });
    };

    const currentItems = getItemsByType(selectedType);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: "/dashboard",
        },
        {
            title: "Factures Proforma",
            href: "/proforma-invoices",
        },
    ];


    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Créer une facture proforma" />
            
            <div className=" py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold tracking-tight mb-6">
                    Créer une facture proforma
                </h1>

                {/* Afficher les erreurs globales */}
                {errors.items && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {errors.items}
                    </div>
                )}

                <div className=" space-y-6">
                    {/* Formulaire principal */}
                    <Card className="spacebg-white-y-6">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold mb-4">Informations client</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <Label className="block text-sm font-medium mb-2">
                                    Sélection du client
                                </Label>
                                <ClientManager 
                                    onClientSelected={handleClientSelected}
                                    currentClientId={data.client_id}
                                    clients={clients}
                                />
                                {errors.client_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.client_id}</p>
                                )}
                            </div>
                        
                            {/* Ajout d'articles */}
                            <div className="rounded-lg mt-6 p-2">
                                <h2 className="text-lg font-semibold mb-4">Ajouter un article</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label>Type</Label>
                                        <Select
                                            value={selectedType}
                                            onValueChange={(value: 'chambre' | 'salle' | 'produit') => setSelectedType(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="chambre">Logement</SelectItem>
                                                    <SelectItem value="salle">Salle</SelectItem>
                                                    <SelectItem value="produit">Produit</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="article_id">Article *</Label>

                                        <RecherchePopover
                                            options={currentItems.map(item => ({
                                            value: item.id.toString(),
                                            label: `${'nom' in item ? item.nom : item.name} - ${Dollar(getDefaultPrice(selectedType, item.id))}`,
                                            originalData: item,
                                            }))}
                                            placeholder="Sélectionner un article"
                                            searchPlaceholder="Rechercher un article..."
                                            emptyMessage="Aucun article trouvé."
                                            value={selectedItem}
                                            onValueChange={setSelectedItem}
                                            className="w-full"
                                        />

                                        
                                        </div>



                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            onClick={addItem}
                                            disabled={!selectedItem}
                                        >
                                            Ajouter
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prévisualisation */}
                    <Card className="shadow rounded-lg">
                        <CardHeader>
                            <CardTitle>Prévisualisation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* En-tête facture */}
                            <div className="border-b pb-4 mb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold">FACTURE PROFORMA</h3>
                                        <p className="text-gray-600">N°: Généré automatiquement</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">Date: {DateSimple(data.date_facture)}</p>
                                        {data.date_echeance && (
                                            <p className="text-gray-600">Échéance: {DateSimple(data.date_echeance)}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Informations client */}
                            <div className="mb-6 bg-emerald-900 p-2 rounded-2xl">
                                <h4 className="font-semibold mb-2">Client:</h4>
                                <p>{data.client_nom || 'Nom du client'}</p>
                                {data.client_email && <p>{data.client_email}</p>}
                                {data.client_telephone && <p>{data.client_telephone}</p>}
                                {data.client_adresse && <p className="whitespace-pre-line">{data.client_adresse}</p>}
                            </div>

                            {/* Tableau des articles */}
                            <div className="mb-6">
                                <Table className="min-w-full divide-y">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="px-4 py-2 text-left text-xs font-medium uppercase">
                                                Date
                                            </TableHead>
                                            <TableHead className="px-4 py-2 text-left text-xs font-medium uppercase">
                                                Désignation
                                            </TableHead>
                                            <TableHead className="px-4 py-2 text-left text-xs font-medium uppercase">
                                                Effectif/Quantité
                                            </TableHead>
                                            <TableHead className="px-4 py-2 text-left text-xs font-medium uppercase">
                                                Montant $
                                            </TableHead>
                                            <TableHead className="px-4 py-2 text-left text-xs font-medium uppercase">
                                                Total $
                                            </TableHead>
                                            <TableHead className="px-4 py-2 text-left text-xs font-medium uppercase">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y">
                                        {items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="px-4 py-2 whitespace-nowrap text-sm">
                                                    <Input
                                                        type="date"
                                                        value={item.date_item}
                                                        onChange={e => updateItem(index, 'date_item', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className="px-4 py-2 whitespace-nowrap text-sm">
                                                    {item.designation}
                                                </TableCell>
                                                <TableCell className="px-4 py-2 whitespace-nowrap text-sm">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantite}
                                                        onChange={e => updateItem(index, 'quantite', parseInt(e.target.value) || 1)}
                                                    />
                                                </TableCell>
                                                <TableCell className="px-4 py-2 whitespace-nowrap text-sm">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={item.prix_unitaire}
                                                        onChange={e => updateItem(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                                                    />
                                                </TableCell>
                                                <TableCell className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                                    {Dollar(item.montant_total || 0)}
                                                </TableCell>
                                                <TableCell className="px-4 py-2 whitespace-nowrap text-sm">
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <Trash2Icon className="w-4 h-4 mr-2" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {items.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                                                    Aucun article ajouté
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={4} className="px-4 py-2 text-right text-sm font-medium">
                                                Total:
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-sm font-bold">
                                                {Dollar(calculateTotal())}
                                            </TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>

                            {/* Notes */}
                            <div>
                                <Label className="block text-sm font-medium mb-2">
                                    Notes
                                </Label>
                                <Textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Notes additionnelles..."
                                />
                            </div>

                            {/* Bouton de soumission */}
                            <div className="mt-6 flex justify-end">
                                <Button
                                    onClick={submit}
                                    disabled={processing || items.length === 0}
                                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {processing ? 'Création...' : 'Créer la facture proforma'}
                                </Button>
                            </div>

                            {/* Afficher les erreurs de validation */}
                            {Object.keys(errors).map((key) => (
                                key.includes('items.') && (
                                    <p key={key} className="text-red-500 text-sm mt-1">
                                        {errors[key]}
                                    </p>
                                )
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default Create;