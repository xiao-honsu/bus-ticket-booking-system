import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import StoreProvider from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import { cookies } from 'next/headers';
import { InitialAuthState } from '@/lib/store';
import { ThemeProvider } from '@/components/theme-provider';
import { ChatWidget } from '@/components/ChatWidget';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Bus Ticket Booking System',
  description: 'Book your bus tickets online with ease',
};

export const dynamic = 'force-dynamic';

// Helper to parse user-info cookie safely
async function getInitialAuthFromCookies(): Promise<InitialAuthState | undefined> {
  try {
    const cookieStore = await cookies();
    const userInfoCookie = cookieStore.get('user-info');
    const refreshToken = cookieStore.get('refreshToken');

    // Only consider authenticated if both user-info and refreshToken exist
    if (userInfoCookie?.value && refreshToken?.value) {
      const userInfo = JSON.parse(userInfoCookie.value);

      // Validate required fields
      if (userInfo.id && userInfo.role) {
        return {
          user: {
            id: userInfo.id,
            role: userInfo.role,
            name: userInfo.name, // May be undefined, will be fetched via sync
            email: userInfo.email, // May be undefined, will be fetched via sync
          },
          isAuthenticated: true,
        };
      }
    }
  } catch (error) {
    // Cookie parsing failed - return undefined (guest state)
    console.warn('[Layout] Failed to parse auth cookies:', error);
  }

  return undefined;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read auth state from cookies on server-side
  const initialAuth = await getInitialAuthFromCookies();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <StoreProvider initialAuth={initialAuth}>
            <div className="h-screen overflow-auto">
              <Navbar />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
            <Toaster />
            <ChatWidget />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
