import PreviewAbout from "@/components/dashboard/MyPageView/components/preview/PreviewAbout";
import PreviewBooking from "@/components/dashboard/MyPageView/components/preview/PreviewBooking";
import PreviewContact from "@/components/dashboard/MyPageView/components/preview/PreviewContact";
import PreviewHero from "@/components/dashboard/MyPageView/components/preview/PreviewHero";
import PreviewServices from "@/components/dashboard/MyPageView/components/preview/PreviewServices";

export default function PreviewPage({
  availableDays,
  data,
  heroImage,
  profileImage,
  services,
}) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white">
      <PreviewHero data={data} heroImage={heroImage} />
      <PreviewServices data={data} services={services} />
      <PreviewAbout data={data} profileImage={profileImage} />
      <PreviewContact availableDays={availableDays} data={data} />
      <PreviewBooking availableDays={availableDays} data={data} />
    </div>
  );
}
