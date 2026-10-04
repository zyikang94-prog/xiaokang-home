import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Landmark, TrendingUp, Wallet } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import DataBackup from '@/components/DataBackup';

const NAV = [
  { path: '/', label: '家庭总览', icon: LayoutDashboard, end: true },
  { path: '/income', label: '家庭收入', icon: TrendingUp, end: false },
  { path: '/expense', label: '家庭支出', icon: Wallet, end: false },
  { path: '/assets', label: '资产负债', icon: Landmark, end: false },
];

export const Layout = () => {
  const { pathname } = useLocation();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2.5 px-1.5 py-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Home className="size-4.5" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <div className="font-serif text-lg leading-tight font-semibold text-sidebar-foreground">
                小康之家
              </div>
              <div className="text-[11px] text-sidebar-foreground/60">家庭财产管理</div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {NAV.map((item) => {
              const isActive = item.end
                ? pathname === item.path
                : pathname.startsWith(item.path);
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                    <NavLink to={item.path} end={item.end}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center justify-between px-1.5 group-data-[collapsible=icon]:justify-center">
            <span className="text-[11px] text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
              数据备份
            </span>
            <DataBackup />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex items-center px-4 pt-4 md:hidden">
          <SidebarTrigger />
        </div>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>

      <Toaster richColors position="top-center" />
    </SidebarProvider>
  );
};
