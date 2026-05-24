import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import DashboardIcon from "@/assets/icons/dashboard.svg?react";
import SalesIcon from "@/assets/icons/sales.svg?react";
import OrderIcon from "@/assets/icons/order.svg?react";
import MenuIcon from "@/assets/icons/menu.svg?react";
import ReceiptIcon from "@/assets/icons/receipt.svg?react";
import AccountIcon from "@/assets/icons/account.svg?react";

const navItems = [
  { name: "Dashboard", icon: DashboardIcon, path: "/" },
  { name: "Sales", icon: SalesIcon, path: "/sales" },
  { name: "Order", icon: OrderIcon, path: "/order" },
  { name: "Menu", icon: MenuIcon, path: "/menu" },
  { name: "Receipt", icon: ReceiptIcon, path: "/receipts" },
  { name: "Account", icon: AccountIcon, path: "/account" },
];

export default function AppSidebar() {
  return (
    <Sidebar className="border-none">
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.name} className="h-25">
                <SidebarMenuButton asChild className="h-25">
                  <a href={`${item.path}`} className="flex-col">
                    <Icon style={{ width: "auto", height: "3.5rem" }} />
                    <p className="text-lg">{item.name}</p>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
