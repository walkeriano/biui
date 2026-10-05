import PublicAbout from "@/components/public-page/PublicAbout";
import PublicBookingSection from "@/components/public-page/PublicBookingSection";
import PublicContact from "@/components/public-page/PublicContact";
import PublicHeader from "@/components/public-page/PublicHeader";
import PublicHero from "@/components/public-page/PublicHero";
import PublicServices from "@/components/public-page/PublicServices";

export default function PublicPage({ page, previewMode = false }) {
  return (
    <main
      className="relative min-h-screen bg-[#f7fbf7] text-foreground"
      style={{ fontFamily: page.theme.textFont }}
    >
      <PublicHeader page={page} previewMode={previewMode} />
      <PublicHero page={page} />
      <PublicServices page={page} />
      <PublicAbout page={page} />
      <PublicBookingSection page={page} previewMode={previewMode} />
      <PublicContact page={page} />
    </main>
  );
}
