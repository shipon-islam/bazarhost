import { notFound } from "next/navigation";
import { getProductById, products } from "@/data/products";
import OrderForm from "@/components/OrderForm";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const product = getProductById(params.id);
  if (!product) notFound();

  return <OrderForm product={product} />;
}
