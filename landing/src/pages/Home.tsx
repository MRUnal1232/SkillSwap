import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SearchChanged } from "@/components/SearchChanged";
import { Mission } from "@/components/Mission";
import { Solution } from "@/components/Solution";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <SearchChanged />
        <Mission />
        <Solution />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
