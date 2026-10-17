import { getProducts } from "@/lib/products";
import CcBuilder from "@/components/CcBuilder";

export const metadata = {
  title: "CC Builder | Bangal Computer",
  description: "আপনার CCTV সিস্টেমের জন্য CC Camera, recorder ও accessories বেছে নিন।",
};

async function productsFor(subcategory) {
  const result = await getProducts({
    category: "security",
    subcategory,
    limit: 100,
    sort: "featured",
  });
  return result.items || [];
}

export default async function CcBuilderPage() {
  const [cameras, packages, dvrs, xvrs, accessories] = await Promise.all([
    productsFor("cc-camera"),
    productsFor("cc-camera-package"),
    productsFor("dvr"),
    productsFor("xvr"),
    productsFor("cc-camera-accessories"),
  ]);

  return (
    <CcBuilder
      cameras={cameras}
      packages={packages}
      recorders={[...dvrs, ...xvrs]}
      accessories={accessories}
    />
  );
}
