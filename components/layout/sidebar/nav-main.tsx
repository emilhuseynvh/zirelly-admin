"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  ArrowLeftRightIcon,
  ChevronRight,
  FileTextIcon,
  TruckIcon,
  HomeIcon,
  QuoteIcon,
  InfoIcon,
  MegaphoneIcon,
  LanguagesIcon,
  MailIcon,
  NewspaperIcon,
  PhoneIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TicketPercentIcon,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  items?: NavItem;
}[];

type NavGroup = {
  title: string;
  items: NavItem;
};

export const navItems: NavGroup[] = [
  {
    title: "Satış",
    items: [
      { title: "Promokodlar", href: "/dashboard/promocodes", icon: TicketPercentIcon }
    ]
  },
  {
    title: "Kontent",
    items: [
      { title: "Bloqlar", href: "/dashboard/blogs", icon: NewspaperIcon },
      { title: "Məhsullar", href: "/dashboard/products", icon: ShoppingBagIcon },
      { title: "Rəylər", href: "/dashboard/testimonials", icon: QuoteIcon },
      { title: "Mesajlar", href: "/dashboard/messages", icon: MailIcon }
    ]
  },
  {
    title: "Səhifələr",
    items: [
      { title: "Ana səhifə", href: "/dashboard/pages/home", icon: HomeIcon },
      { title: "Məhsullar səhifəsi", href: "/dashboard/pages/products", icon: ShoppingBagIcon },
      { title: "Haqqımızda", href: "/dashboard/pages/about", icon: InfoIcon },
      { title: "Əlaqə", href: "/dashboard/pages/contact", icon: PhoneIcon },
      { title: "Popup", href: "/dashboard/pages/popup", icon: MegaphoneIcon },
      { title: "Geri Qaytarma", href: "/dashboard/pages/legal/return-policy", icon: RotateCcwIcon },
      { title: "Məxfilik Siyasəti", href: "/dashboard/pages/legal/privacy-policy", icon: ShieldCheckIcon },
      { title: "Çatdırılma və Ödəmə", href: "/dashboard/pages/legal/delivery-payment", icon: TruckIcon },
      { title: "İstifadə Şərtləri", href: "/dashboard/pages/legal/terms-of-use", icon: FileTextIcon }
    ]
  },
  {
    title: "Tənzimləmələr",
    items: [
      { title: "Dillər", href: "/dashboard/languages", icon: LanguagesIcon },
      { title: "Yönləndirmələr", href: "/dashboard/redirects", icon: ArrowLeftRightIcon }
    ]
  }
];

export function NavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  return (
    <>
      {navItems.map((nav) => (
        <SidebarGroup key={nav.title}>
          <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {nav.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {Array.isArray(item.items) && item.items.length > 0 ? (
                    <>
                      <div className="hidden group-data-[collapsible=icon]:block">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton tooltip={item.title}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side={isMobile ? "bottom" : "right"}
                            align={isMobile ? "end" : "start"}
                            className="min-w-48 rounded-lg">
                            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                            {item.items?.map((subItem) => (
                              <DropdownMenuItem
                                className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                                asChild
                                key={subItem.title}>
                                <a href={subItem.href}>{subItem.title}</a>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Collapsible
                        className="group/collapsible block group-data-[collapsible=icon]:hidden"
                        defaultOpen={!!item.items.find((s) => pathname.startsWith(s.href))}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                            tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem, key) => (
                              <SidebarMenuSubItem key={key}>
                                <SidebarMenuSubButton
                                  className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                  isActive={pathname === subItem.href}
                                  asChild>
                                  <Link href={subItem.href}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  ) : (
                    <SidebarMenuButton
                      className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.title}
                      asChild>
                      <Link href={item.href}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
