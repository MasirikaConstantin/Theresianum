import { router } from '@inertiajs/react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis
} from '@/components/ui/pagination';

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationData {
  current_page: number;
  data: any[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface PaginationProps {
  data: PaginationData;
}

export function PaginationComponent({ data }: PaginationProps) {
  if (!data || !data.links || data.links.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-end mt-4">
      <Pagination>
        <PaginationContent>
          {/* Bouton Précédent */}
          <PaginationItem>
            <PaginationPrevious 
              href={data.prev_page_url || '#'}
              onClick={(e) => {
                if (!data.prev_page_url) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                router.get(data.prev_page_url, {}, {
                  preserveState: true,
                  replace: true,
                  preserveScroll: true
                });
              }}
              className={!data.prev_page_url ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {/* Liens de pagination */}
          {data.links.slice(1, -1).map((link, index) => (
            <PaginationItem key={index}>
              {link.label === '...' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href={link.url || '#'}
                  onClick={(e) => {
                    if (!link.url) {
                      e.preventDefault();
                      return;
                    }
                    e.preventDefault();
                    router.get(link.url, {}, {
                      preserveState: true,
                      replace: true,
                      preserveScroll: true
                    });
                  }}
                  isActive={link.active}
                >
                  {link.label}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          {/* Bouton Suivant */}
          <PaginationItem>
            <PaginationNext 
              href={data.next_page_url || '#'}
              onClick={(e) => {
                if (!data.next_page_url) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                router.get(data.next_page_url, {}, {
                  preserveState: true,
                  replace: true,
                  preserveScroll: true
                });
              }}
              className={!data.next_page_url ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}