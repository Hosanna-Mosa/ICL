import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Coins,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    url: '/admin/products',
    icon: Package,
  },
  {
    title: 'Orders',
    url: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Coins',
    url: '/admin/coins',
    icon: Coins,
  },
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings,
  },
];

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const { logout, user } = useAuth();
  const location = useLocation();

  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar 
      className="bg-sidebar border-sidebar-border"
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-sidebar-border">
          {!isCollapsed ? (
            <Logo size="md" className="text-sidebar-foreground" />
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">IC</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isItemActive = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`
                        transition-all duration-200 rounded-lg mx-2
                        ${isItemActive 
                          ? 'bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                        }
                      `}
                    >
                      <NavLink to={item.url} end={item.url === '/admin'}>
                        <item.icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
                        {!isCollapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section & Logout */}
        <div className="p-4 border-t border-sidebar-border space-y-4">
          {!isCollapsed && user && (
            <div className="px-2">
              <p className="text-sm text-sidebar-foreground font-medium truncate">
                {user.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user.email}
              </p>
            </div>
          )}
          
          <Button
            onClick={handleLogout}
            variant="outline"
            size={isCollapsed ? 'icon' : 'sm'}
            className="w-full border-sidebar-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
            {!isCollapsed && 'Logout'}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};