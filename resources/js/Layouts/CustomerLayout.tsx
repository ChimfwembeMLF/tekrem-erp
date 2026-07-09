import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/Components/ui/sheet';
import {
    Home,
    User,
    FolderOpen,
    CreditCard,
    MessageSquare,
    HelpCircle,
    Settings,
    LogOut,
    Menu,
    Users,
    FileText,
    Building,
    Megaphone,
    Mail,
    ShoppingBag,
    Heart,
    Truck,
    MapPin,
} from 'lucide-react';
import NotificationComponent from '@/Components/NotificationComponent';
import useRoute from '@/Hooks/useRoute';
import ApplicationMark from '@/Components/ApplicationMark';
import { ThemeToggle } from '@/Components/ThemeProvider';
import useTypedPage from '@/Hooks/useTypedPage';
import SupportChatWidget from '@/Components/Support/SupportChatWidget';
import ShopGuestMerge from '@/Components/Shop/ShopGuestMerge';
import AppProvider from '@/Providers/AppProvider';

interface User {
    id: number;
    name: string;
    email: string;
    profile_photo_url?: string;
}

interface Props {
    children: React.ReactNode;
}
const navigation = [
  {
    name: 'Dashboard',
    href: 'customer.dashboard',
    icon: Home,
  },
  {
    name: 'Projects',
    href: 'customer.projects.index',
    icon: FolderOpen,
  },
  {
    name: 'Finance',
    href: 'customer.finance.index',
    icon: CreditCard,
  },
  {
    name: 'Messages',
    href: 'customer.conversations.index',
    icon: Mail, // changed from MessageSquare
  },
  {
    name: 'Communications',
    href: 'customer.communications.index',
    icon: Megaphone, // distinct from Messages
  },
  {
    name: 'Support',
    href: 'customer.support.index',
    icon: HelpCircle,
  },
  {
    name: 'Shop orders',
    href: 'shop.orders',
    icon: ShoppingBag,
  },
  {
    name: 'Wishlist',
    href: 'shop.wishlist',
    icon: Heart,
  },
  {
    name: 'Track shipment',
    href: 'shop.tracking',
    icon: Truck,
  },
  {
    name: 'Profile',
    href: 'customer.profile.show',
    icon: Settings,
  },
  {
    name: 'Delivery addresses',
    href: 'customer.profile.addresses.index',
    icon: MapPin,
  },
];
export default function CustomerLayout({ children }: Props) {
    const { auth } = usePage().props as any;
    const user = auth.user as User;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const route = useRoute();
    const page = useTypedPage();
    const settings: any = page.props.settings;

    const isActive = (routeName: string) => {
        return route().current()?.startsWith(routeName.replace('.index', '').replace('.show', ''));
    };
    
    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center px-6">
                <Link href={route('customer.dashboard')} className="flex items-center space-x-2">
                    <ApplicationMark />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-4 py-4">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={route(item.href)}
                            className={cn(
                                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                        >
                            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            <div className=" p-4">
                <div className="flex items-center space-x-3">
                    {/* <ThemeToggle /> */}
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile_photo_url} alt={user.name} />
                        <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AppProvider>
        <div className="min-h-screen bg-background">
            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card">
                    <SidebarContent />
                </div>
            </div>

            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <div className="lg:pl-64">
                    {/* Top navigation */}
                    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 sm:px-6 lg:px-8">
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 lg:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open sidebar</span>
                            </Button>
                        </SheetTrigger>

                        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
                            <NotificationComponent />
                            <ThemeToggle />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-9 w-9 shrink-0 rounded-full p-0"
                                        title={user.name}
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.profile_photo_url} alt={user.name} />
                                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                                {user.name
                                                    .split(' ')
                                                    .filter(Boolean)
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={route('customer.profile.show')}>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={route('customer.profile.edit')}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={route('customer.support.create')}>
                                            <HelpCircle className="mr-2 h-4 w-4" />
                                            <span>Support</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={route('logout')} method="post">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Page content */}
                    <main className="py-6">
                        <div className="px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </main>
                </div>

                <SheetContent side="left" className="w-64 p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            <SupportChatWidget />
            <ShopGuestMerge />
        </div>
        </AppProvider>
    );
}
