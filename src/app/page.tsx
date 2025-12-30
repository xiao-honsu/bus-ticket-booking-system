import { HeroSection, SearchForm, PopularRoutes, ServicesSection, PromotionsSection } from '@/containers/landing-page';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <div id="search" className="container mx-auto px-4 -mt-10 relative z-20">
        <SearchForm />
      </div>
      <PromotionsSection />
      <ServicesSection />
      <PopularRoutes />
    </main>
  );
}
