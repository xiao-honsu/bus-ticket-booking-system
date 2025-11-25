import { HeroSection, SearchForm, PopularRoutes } from '@/containers/landing-page';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className="container mx-auto px-4">
        <SearchForm />
      </div>
      <PopularRoutes />
    </main>
  );
}
