// components/ui/sidebar-item.tsx
'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './sidebar';
import { type NavItem } from '@/types';

export function SidebarItem({ item }: { item: NavItem }) {
  const { url } = usePage();
  const [isOpen, setIsOpen] = useState(item.isOpen || false);
  const hasItems = item.items && item.items.length > 0;

  // Détermine si l'item ou ses enfants sont actifs
  const isActive = item.href ? url.startsWith(item.href) : 
                  item.items?.some(subItem => url.startsWith(subItem.href));

  // Ouvre automatiquement le menu si un enfant est actif
  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
        size="lg"
        className='  font-size-2xl font-bold hover:text-black active:text-black'
          asChild={!hasItems}
          isActive={isActive}
          onClick={hasItems ? () => setIsOpen(!isOpen) : undefined}
        >
          {hasItems ? (
            <div className="flex items-center justify-between w-full ">
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
            <Link href={item.href || '#'} className="flex items-center gap-2">
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.title}</span>
            </Link>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>

      {hasItems && isOpen && (
        <div className="ml-4">
          <SidebarMenu>
            {item.items?.map((subItem) => (
              <SidebarMenuItem key={`${item.title}-${subItem.title}`}>
                <SidebarMenuButton asChild isActive={url.startsWith(subItem.href)} 
                size="md"
                tooltip={subItem.title}
                >
                  <Link href={subItem.href || '#'} className="flex items-center gap-2 pl-6">
                    {subItem.icon && <subItem.icon className="h-4 w-4" />}
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      )}
    </>
  );
}