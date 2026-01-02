'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import LiquidEther from '@/components/ui/liquid-ether';

export default function HeroSection() {
  return (
    <section className="relative bg-background text-foreground py-12 md:py-16 overflow-hidden">
      {/* LiquidEther background */}
      <LiquidEther
        colors={{
          light: ['#a855f7', '#6366f1', '#3b82f6', '#ec4899'],
          dark: ['#7c3aed', '#4f46e5', '#2563eb', '#db2777'],
        }}
        speed={0.002}
        intensity={0.8}
      />

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-background/30 dark:bg-background/50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-2 text-sm font-medium bg-secondary/80 backdrop-blur-sm border border-border"
          >
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            Trusted by 10,000+ travelers
          </Badge>

          {/* Main heading */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Book Your Bus Tickets
            <span className="block bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Fast & Easy
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base md:text-lg lg:text-xl mb-6 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience reliable and comfortable bus journeys across the country. Book your tickets in just a few clicks!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <Button
              size="lg"
              className="font-semibold px-6 py-5 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group w-full sm:w-auto"
              asChild
            >
              <Link href="#search">
                Search Trips
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="font-semibold px-6 py-5 text-base backdrop-blur-sm transition-all duration-300 hover:scale-105 w-full sm:w-auto border-2"
              asChild
            >
              <Link href="/promotions">View Promotions</Link>
            </Button>
          </div>

          {/* Features */}
          <div className="flex flex-wrap *:flex-[1_1_150px] gap-4 max-w-3xl mx-auto">
            {[
              {
                icon: MapPin,
                iconColor: 'text-yellow-500',
                title: '250+ Routes',
                description: 'Nationwide coverage',
              },
              {
                icon: Calendar,
                iconColor: 'text-green-500',
                title: 'Instant Booking',
                description: 'Real-time availability',
              },
              {
                icon: Star,
                iconColor: 'text-orange-500',
                title: 'Best Prices',
                description: 'Exclusive discounts',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="max-md:gap-0 max-md:py-0 bg-card/60 backdrop-blur-sm border border-border hover:bg-card/80 transition-all duration-300 hover:shadow-lg"
                >
                  <CardContent className="p-4 text-center">
                    <Icon className={`w-7 h-7 mb-2 mx-auto ${feature.iconColor}`} />
                    <h3 className="font-semibold mb-1 text-card-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
