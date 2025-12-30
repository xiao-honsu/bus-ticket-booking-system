'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logout } from '@/lib/store/features/auth/authSlice';
import { useLogoutMutation } from '@/lib/store/services/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { clearAuthCookies } from '@/lib/utils/cookies';
import { Menu, Home, Search, Tag, Shield, LayoutDashboard, Ticket, LogOut } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const [logoutApi] = useLogoutMutation();

  // Force client-only rendering to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API to clear httpOnly cookies on backend
      await logoutApi({}).unwrap();
    } catch (error) {
      // Continue logout even if API call fails
      console.error('Logout API error:', error);
    }

    // Clear Redux state
    dispatch(logout());

    // Clear client-side cookies
    clearAuthCookies();

    // Clear localStorage and sessionStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    toast.success('Logged out successfully');
    setMobileMenuOpen(false);
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  const navigationLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/promotions', label: 'Promotions', icon: Tag },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-2xl font-bold text-primary transition-colors group-hover:text-primary/80">
              BusTicket
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1 items-center">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link key={link.href} href={link.href}>
                  <Button variant={'link'} className={`text-foreground gap-2 ${active ? 'underline' : ''}`}>
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}

            {!mounted ? (
              // Show skeleton during initial client-side mount to prevent hydration mismatch
              <div className="flex items-center gap-2 ml-2">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            ) : isAuthenticated && user ? (
              <>
                {(user?.role === 'admin' || user?.role === 'operator') && (
                  <Link href="/admin">
                    <Button variant={isActive('/admin') ? 'secondary' : 'ghost'} className="gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-2">
                      <Avatar className="h-10 w-10">
                        {user?.profilePictureUrl ? (
                          <Image
                            src={user.profilePictureUrl}
                            alt={user?.name || 'User'}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user?.name?.charAt(0).toUpperCase() || user?.role?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">
                            {user?.name ||
                              (user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} User` : 'User')}
                          </p>
                          {user?.role && (
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                              {user.role}
                            </Badge>
                          )}
                        </div>
                        {user?.email && <p className="text-xs text-muted-foreground leading-none">{user.email}</p>}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <Ticket className="mr-2 h-4 w-4" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-promotions" className="cursor-pointer">
                        <Tag className="mr-2 h-4 w-4" />
                        My Promotions
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Navigate through the app</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6 px-4">
                {/* User Info in Mobile */}
                {mounted && isAuthenticated && user && (
                  <>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
                      <Avatar className="h-12 w-12">
                        {user?.profilePictureUrl ? (
                          <Image
                            src={user.profilePictureUrl}
                            alt={user?.name || 'User'}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user?.name?.charAt(0).toUpperCase() || user?.role?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {user?.name ||
                              (user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} User` : 'User')}
                          </p>
                          {user?.role && (
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                              {user.role}
                            </Badge>
                          )}
                        </div>
                        {user?.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Navigation Links */}
                <div className="flex flex-col gap-2">
                  {navigationLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                        <Button variant={active ? 'secondary' : 'ghost'} className="w-full justify-start gap-3">
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Button>
                      </Link>
                    );
                  })}

                  {mounted && isAuthenticated && (user?.role === 'admin' || user?.role === 'operator') && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant={isActive('/admin') ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-3"
                      >
                        <Shield className="h-5 w-5" />
                        Admin
                      </Button>
                    </Link>
                  )}
                </div>

                <Separator />

                {/* Auth Actions */}
                {mounted && (
                  <div className="flex flex-col gap-2">
                    {isAuthenticated ? (
                      <>
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-3">
                            <LayoutDashboard className="h-5 w-5" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-3">
                            <Ticket className="h-5 w-5" />
                            My Bookings
                          </Button>
                        </Link>
                        <Link href="/my-promotions" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-3">
                            <Tag className="h-5 w-5" />
                            My Promotions
                          </Button>
                        </Link>
                        <Separator />
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="h-5 w-5" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Login
                          </Button>
                        </Link>
                        <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
