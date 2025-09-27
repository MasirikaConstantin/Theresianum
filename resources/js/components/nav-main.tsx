// components/nav-main.tsx
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { SidebarItem } from '@/components/ui/sidebar-item';

export function NavMain({ items = [] }: { items: NavItem[] }) {
  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Onglets</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}