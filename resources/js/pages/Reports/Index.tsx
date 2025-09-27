import { BreadcrumbItem, PageProps, Auth } from '@/types'
import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, formatDate } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/layouts/app-layout'
import { fr } from 'date-fns/locale'

interface ReportProps extends PageProps {
  ventes: Array<{
    id: number
    code: string
    montant_total: string
    created_at: string
    vendeur: {
      name: string
    }
    vente_produits: Array<{
      id: number
      quantite: number
      prix_unitaire: number
      remise: number
      montant_total: string
      produit?: {
        name: string
      }
      service?: {
        name: string
      }
    }>
  }>
  depenses: Array<{
    id: number
    libelle: string
    montant: string
    description: string
    created_at: string
    user: {
      name: string
    }
  }>
  vendeurs: Array<{
    id: number
    name: string
  }>
  filters: {
    start_date: string
    end_date: string
    user_id?: number
  }
  auth: Auth
}

export default function Reports({ auth, ventes, depenses, vendeurs, filters }: ReportProps) {
  const totalVentes = ventes.reduce((sum, vente) => sum + parseFloat(vente.montant_total), 0)
  const totalDepenses = depenses.reduce((sum, depense) => sum + parseFloat(depense.montant), 0)
  const beneficeNet = totalVentes - totalDepenses

  const generatePdfUrl = () => {
    const params = new URLSearchParams()
    params.append('start_date', filters.start_date)
    params.append('end_date', filters.end_date)
    if (filters.user_id) params.append('user_id', filters.user_id.toString())
    return `/reports/pdf?${params.toString()}`
  }

  const breadcrumbs : BreadcrumbItem[]  = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: 'Rapports', href: route('reports.index') },
  ]
  return (
    <AppLayout
      auth={auth}
      breadcrumbs={breadcrumbs}
    >
      <Head title="Rapports" />

      <div className="space-y-6 p-6">
        <Card>
        <div className="flex items-center justify-between mx-4">
          <h2 className="text-xl font-semibold leading-tight text-gray-800">Rapports de vente du {formatDate(filters.start_date, 'PPPP', { locale: fr })} au  {formatDate(filters.end_date, 'PPPP', { locale: fr })}</h2>
          <Button asChild>
            <a href={generatePdfUrl()} target="_blank">
              Exporter en PDF
            </a>
          </Button>
        </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="get" className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filters.start_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.start_date ? format(new Date(filters.start_date), 'PPP', { locale: fr }) : 'Sélectionner une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      locale={fr}
                      selected={new Date(filters.start_date)}
                      onSelect={(date) => {
                        if (date) {
                          window.location.search = new URLSearchParams({
                            ...filters,
                            start_date: format(date, 'yyyy-MM-dd'),
                          }).toString()
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filters.end_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.end_date ? format(new Date(filters.end_date), 'PPP', { locale: fr }) : 'Sélectionner une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      locale={fr}
                      selected={new Date(filters.end_date)}
                      onSelect={(date) => {
                        if (date) {
                          window.location.search = new URLSearchParams({
                            ...filters,
                            end_date: format(date, 'yyyy-MM-dd'),
                          }).toString()
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_id">Vendeur</Label>
                <Select
                    value={filters.user_id?.toString() || undefined}
                    onValueChange={(value) => {
                        const params = new URLSearchParams(filters)
                        if (value) params.set('user_id', value)
                        else params.delete('user_id')
                        window.location.search = params.toString()
                    }}
                    >
                    <SelectTrigger>
                        <SelectValue placeholder="Tous les vendeurs" />
                    </SelectTrigger>
                    <SelectContent>
                        {vendeurs.map((vendeur) => (
                        <SelectItem key={vendeur.id} value={vendeur.id.toString()}>
                            {vendeur.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
              </div>

              {/*<div className="flex items-end">
                <Button type="submit" className="w-full">
                  Appliquer
                </Button>
              </div>*/}
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total ventes</CardTitle>
              <Badge variant="outline" className="">
                +{totalVentes.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVentes.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}</div>
              <p className="text-xs text-muted-foreground">
                {ventes.length} vente{ventes.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total dépenses</CardTitle>
              <Badge variant="outline" className="text-red-600">
                -{totalDepenses.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDepenses.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}</div>
              <p className="text-xs text-muted-foreground">
                {depenses.length} dépense{depenses.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bénéfice net</CardTitle>
              <Badge variant="outline" className={beneficeNet >= 0 ? 'text-green-200' : 'text-red-600'}>
                {beneficeNet >= 0 ? '+' : ''}
                {beneficeNet.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${beneficeNet >= 0 ? 'text-green-200' : 'text-red-600'}`}>
                {beneficeNet.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(filters.start_date), 'PPP', { locale: fr })} - {format(new Date(filters.end_date), 'PPP', { locale: fr })}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Détail des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code vente</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Produit/Service</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Vendeur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventes.length > 0 ? (
                  ventes.flatMap((vente) =>
                    vente.vente_produits.map((item) => (
                      <TableRow key={`${vente.id}-${item.id}`}>
                        <TableCell>{vente.code}</TableCell>
                        <TableCell>{format(new Date(vente.created_at), 'PPPp', { locale: fr })}</TableCell>
                        <TableCell>{item.produit ? 'Produit' : 'Service'}</TableCell>
                        <TableCell>{item.produit?.name.slice(0,45) || item.service?.name.slice(0,45)}</TableCell>
                        <TableCell>{item.quantite}</TableCell>
                        <TableCell>{item.prix_unitaire.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}</TableCell>
                        <TableCell>{item.montant_total.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}</TableCell>
                        <TableCell>{vente.vendeur.name}</TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Aucune vente trouvée pour cette période
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {depenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Détail des dépenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Utilisateur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depenses.map((depense) => (
                    <TableRow key={depense.id}>
                      <TableCell>{format(new Date(depense.created_at), 'PPPp', { locale: fr })}</TableCell>
                      <TableCell>{depense.libelle}</TableCell>
                      <TableCell className="text-red-600">
                        -{parseFloat(depense.montant).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}
                      </TableCell>
                      <TableCell>{depense.description ? depense.description.slice(0, 50) + '...' : depense.description}</TableCell>
                      <TableCell>{depense.user.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}