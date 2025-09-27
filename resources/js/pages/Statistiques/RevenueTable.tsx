import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RevenueData {
  date: string;
  total: number;
}

interface RevenueTableProps {
  data: RevenueData[];
  itemsPerPage?: number;
}

export function RevenueTableWithPagination({ 
  data, 
  itemsPerPage = 30 
}: RevenueTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    
    <div className="space-y-4 mt-6 mb-6 w-full h-full">
        <ScrollArea className="h-128 w-full rounded-md border-white ">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium">
                {format(new Date(item.date), 'PPPP', {locale: fr})}
              </TableCell>
              <TableCell className="text-right font-bold">
                {item.total.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'USD'
                }).replace('$US', '$')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        
      </Table>
      </ScrollArea>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
            </PaginationItem>
            
            <PaginationItem>
              <span className="text-sm">
                Page {currentPage} sur {totalPages}
              </span>
            </PaginationItem>
            
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

    </div>
  );
}