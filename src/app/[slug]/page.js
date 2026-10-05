import { notFound } from "next/navigation";
import PublicPage from "@/components/public-page/PublicPage";
import { getPublicPageBySlug } from "@/lib/professionalPage/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPublicPageBySlug(slug);

  if (!page) {
    return {
      title: "Pagina no encontrada | BIUI",
    };
  }

  return {
    title: `${page.professional.name} | BIUI`,
    description: page.hero.text,
  };
}

export default async function ProfessionalPublicPage({ params }) {
  const { slug } = await params;
  const page = await getPublicPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <PublicPage page={page} />;
}
