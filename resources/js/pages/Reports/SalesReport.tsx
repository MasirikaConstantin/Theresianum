import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSalesReport } from '@/hooks/useSalesReport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import SalesStats from './SalesStats';
import SalesChart from './SalesChart';
import { SalesReportPageProps } from '@/types/report';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { MonDatePicker } from '@/components/example-date-picker';

const reportSchema = z.object({
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().min(1, "La date de fin est requise"),
  user_id: z.string().nullable().optional(),
  succursale_id: z.string().nullable().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

const SalesReport: React.FC<SalesReportPageProps> = ({ vendeurs, filters: initialFilters, auth }) => {
  const { stats, loading, error, generateReport, printReport } = useSalesReport();
  const [selectedVendeur, setSelectedVendeur] = useState<string>(initialFilters?.user_id?.toString() || '');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      start_date: initialFilters?.start_date,
      end_date: initialFilters?.end_date,
      user_id: initialFilters?.user_id?.toString() || null,
    }
  });
  
  const onSubmit = (data: ReportFormData) => {
    // Convertir les valeurs en nombres si elles existent
    const filters = {
      ...data,
      user_id: data.user_id ? parseInt(data.user_id) : '',
    };
    
    generateReport(filters as any);
  
  };

  const handlePrint = () => {
    const formData = watch();
    const printFilters = {
      ...formData,
      user_id: formData.user_id ? parseInt(formData.user_id) : '',
      type: 'detailed' as const,
      export: 'pdf' as const
    };
    
    printReport(printFilters as any);
    
  };

  const handleVendeurChange = (value: string) => {
    setSelectedVendeur(value);
    setValue('user_id', value === 'all' ? null : value);
  };
  
  return (
    <AppLayout auth={auth} breadcrumbs={[
      { title: 'Rapports', href: '/reports' },
      { title: 'Rapport des Ventes', href: '/reports/sales-report' },
    ]}>
        <Head title="Rapport des Ventes" />
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rapport des Ventes</h1>
        {stats && (
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres du Rapport</CardTitle>
          <CardDescription>Sélectionnez les critères pour générer votre rapport</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <MonDatePicker
                onChange={(date) => setValue('start_date', date)}
                label='Date de début'
                
                  className={cn(errors.start_date && 'border-red-500')}
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm">{errors.start_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <MonDatePicker
                onChange={(date) => setValue('end_date', date)}
                label='Date de fin' 
                
                  className={cn(errors.end_date && 'border-red-500')}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm">{errors.end_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Vendeur</Label>
                <Select value={selectedVendeur} onValueChange={handleVendeurChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un vendeur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les vendeurs</SelectItem>
                    {vendeurs.map((vendeur) => (
                      <SelectItem key={vendeur.id} value={vendeur.id.toString()}>
                        {vendeur.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Générer le Rapport
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {stats && (
        <div className="space-y-6">
          <SalesStats stats={stats} />
          <SalesChart stats={stats} />
        </div>
      )}
    </div></AppLayout>
  );
};

export default SalesReport;