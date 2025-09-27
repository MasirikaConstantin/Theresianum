import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { type NavItem } from '@/types';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';

export function NavMenuItem({ item }: { item: NavItem }) {
  const page = usePage();
  const [isOpen, setIsOpen] = useState(item.isOpen || false);

  const hasItems = item.items && item.items.length > 0;

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild={!hasItems}
          isActive={item.href ? page.url.startsWith(item.href) : false}
          onClick={hasItems ? () => setIsOpen(!isOpen) : undefined}
          tooltip={{ children: item.title }}
        >
          {hasItems ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          ) : (
            <Link href={item.href || '#'} prefetch>
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.title}</span>
            </Link>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>

      {hasItems && isOpen && (
        <div className="ml-4">
          <SidebarMenu>
            {item.items.map((subItem) => (
              <NavMenuItem key={`${item.title}-${subItem.title}`} item={subItem} />
            ))}
          </SidebarMenu>
        </div>
      )}
    </>
  );
}