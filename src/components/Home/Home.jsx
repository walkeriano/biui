import BenefitsSection from "@/components/Home/BenefitsSection";
import Header from "@/components/Header/Header";
import LandingFooter from "@/components/Home/LandingFooter";
import SubscriptionContactSection from "@/components/Home/SubscriptionContactSection";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-white text-foreground before:pointer-events-none before:absolute before:left-[-14rem] before:top-[-18rem] before:z-0 before:size-[42rem] before:rounded-full before:bg-[radial-gradient(circle,rgba(196,238,118,0.46)_0%,rgba(235,248,216,0.24)_42%,transparent_70%)] after:pointer-events-none after:absolute after:right-[-18rem] after:top-[5rem] after:z-0 after:size-[50rem] after:rounded-full after:bg-[radial-gradient(circle,rgba(57,173,18,0.16)_0%,rgba(0,38,30,0.08)_38%,transparent_68%)]">
      <div className="pointer-events-none absolute inset-x-0 bottom-[-18rem] z-0 h-[34rem] bg-[radial-gradient(circle_at_50%_50%,rgba(224,246,205,0.42)_0%,rgba(247,251,243,0.32)_34%,transparent_70%)]" />
      <div className="relative z-10 px-4 pt-9 sm:px-6 lg:px-8">
        <Header />
      </div>

      <BenefitsSection />
      <SubscriptionContactSection />
      <LandingFooter />
    </main>
  );
}
