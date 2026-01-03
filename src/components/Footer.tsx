import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-b from-gray-900 to-gray-950 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">BusTicket</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your trusted partner for safe and comfortable bus ticket booking across Vietnam
              </p>
            </div>
            {/* Social Media */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-gray-800 hover:bg-primary hover:text-primary-foreground transition-colors"
                asChild
              >
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-gray-800 hover:bg-primary hover:text-primary-foreground transition-colors"
                asChild
              >
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-gray-800 hover:bg-primary hover:text-primary-foreground transition-colors"
                asChild
              >
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Quick Links</h4>
            <nav>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                  >
                    <span className="relative">
                      Home
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                  >
                    <span className="relative">
                      Search Trips
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                  >
                    <span className="relative">
                      My Bookings
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                  >
                    <span className="relative">
                      About Us
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Support</h4>
            <nav>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/help"
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                  >
                    <span className="relative">
                      Help Center
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                  >
                    <span className="relative">
                      Terms of Service
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                  >
                    <span className="relative">
                      Privacy Policy
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                  >
                    <span className="relative">
                      FAQs
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <a href="mailto:talenthive.website@gmail.com" className="hover:text-white transition-colors">
                  talenthive.website@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <a href="tel:0762685089" className="hover:text-white transition-colors">
                  0762685089
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span>Ho Chi Minh City, Vietnam</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 text-center md:text-left">
            &copy; {currentYear} BusTicket. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/sitemap" className="hover:text-white transition-colors">
              Sitemap
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <Link href="/accessibility" className="hover:text-white transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
