import { notFound } from "next/navigation";
import PublicPage from "@/components/public-page/PublicPage";
import { getPublicPageBySlug } from "@/lib/professionalPage/server";
import { getPublicPageMetadata } from "@/lib/professionalPage/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPublicPageBySlug(slug);

  return getPublicPageMetadata(page);
}

export default async function ProfessionalPublicPage({ params }) {
  const { slug } = await params;
  const page = await getPublicPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <PublicPage page={page} />;
}
