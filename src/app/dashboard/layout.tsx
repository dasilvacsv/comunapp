'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Importa tu utilidad cn de shadcn/ui

// Componentes UI (Asegúrate de tenerlos instalados desde shadcn/ui)
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Iconos
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  Menu,
  Heart,
  Settings,
} from 'lucide-react';

// --- Definición de la Navegación ---
const navigation = [
  { name: 'Panel Principal', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Registros', href: '/dashboard/registros', icon: Users },
  { name: 'Solicitudes', href: '/dashboard/solicitudes', icon: FileText },
  { name: 'Reportes', href: '/dashboard/reportes', icon: BarChart3 },
];

const userNavigation = [
    { name: 'Mi Perfil', href: '/dashboard/perfil', icon: Settings },
];


// --- Componente Principal del Layout ---
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Estado de Carga
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no hay sesión después de cargar, no renderizar nada
  if (!session) {
    return null;
  }
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={cn(
            "flex flex-col flex-1 transition-all duration-300 ease-in-out",
            isCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}>
          <Header session={session} getInitials={getInitials} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

// --- Componente Sidebar ---
function Sidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (isCollapsed: boolean) => void }) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-10 hidden h-full flex-col border-r bg-white transition-all duration-300 ease-in-out dark:bg-slate-900 dark:border-slate-800 lg:flex",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <Heart className="h-6 w-6 text-blue-600" />
          {!isCollapsed && <span className="text-slate-900 dark:text-white">Gestión</span>}
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} pathname={pathname} isCollapsed={isCollapsed} />
        ))}
      </nav>
    </aside>
  );
}

// --- Componente Header ---
function Header({ session, getInitials }: { session: any, getInitials: (name?: string | null) => string }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-white px-4 dark:bg-slate-900 dark:border-slate-800 sm:px-6">
       <MobileNav />
       <div className="flex items-center gap-4 ml-auto">
         <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline-block">
             Bienvenido, <span className="font-medium">{session.user?.name}</span>
         </span>
         <UserNav session={session} getInitials={getInitials} />
       </div>
    </header>
  );
}

// --- Componente para cada item de navegación ---
function NavItem({ item, pathname, isCollapsed }: { item: any, pathname: string, isCollapsed: boolean }) {
  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
  
  const linkContent = (
    <>
      <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-slate-500 dark:text-slate-400")} />
      {!isCollapsed && <span className="ml-3">{item.name}</span>}
    </>
  );
  
  const linkClasses = cn(
    "flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
    isActive 
      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300" 
      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
    isCollapsed && "justify-center"
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={item.href} className={linkClasses}>
            {linkContent}
            <span className="sr-only">{item.name}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.name}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link href={item.href} className={linkClasses}>
      {linkContent}
    </Link>
  );
}

// --- Componente de Navegación Móvil ---
function MobileNav() {
  const pathname = usePathname();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <Heart className="h-6 w-6 text-blue-600" />
            <span>Gestión Social</span>
          </Link>
        </div>
        <nav className="grid gap-2 p-4 text-base font-medium">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                   isActive 
                     ? "bg-blue-50 text-blue-600"
                     : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

// --- Componente Menú del Usuario ---
function UserNav({ session, getInitials }: { session: any, getInitials: (name?: string | null) => string }) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? ''} />
            <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user?.name}</p>
            <p className="text-xs leading-none text-slate-500">
              {session.user?.email ?? 'Administrador'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userNavigation.map((item) => (
             <Link key={item.name} href={item.href} passHref>
                <DropdownMenuItem className="cursor-pointer">
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                </DropdownMenuItem>
             </Link>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}