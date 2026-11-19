import HeroPart from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import RecentEventsSection from "@/components/RecentEventsSection";
import GallerySection from "@/components/GallerySection";
import NewsletterSection from "@/components/NewsletterSection";

export const metadata = {
  title: "UNIQUE - Community Service & Social Development Events",
  description:
    "Empowering communities and transforming lives through grassroots volunteerism, environmental cleanups, winter relief drives, and social welfare initiatives.",
};

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* 1. Banner Section: Social development and community-service theme */}
      <HeroPart />

      {/* 2. Feature Section: Showcase key platform capabilities */}
      <FeaturesSection />

      {/* 3. Recent Upcoming Events Section: 6 recent events via MongoDB .limit(6) */}
      <RecentEventsSection />

      {/* 4. Gallery Section: Static photographs of past community service initiatives */}
      <GallerySection />

      {/* 5. Newsletter Section: Eye-catching newsletter subscription design */}
      <NewsletterSection />
    </main>
  );
}
