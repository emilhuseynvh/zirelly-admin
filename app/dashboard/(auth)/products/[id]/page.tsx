"use client";

import { use } from "react";

import { PageHeader } from "@/components/admin/page-header";
import { useGetProductQuery } from "@/lib/api/products";
import { ProductForm } from "../product-form";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useGetProductQuery(Number(id));

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!data) return <p className="text-muted-foreground">Product not found.</p>;

  return (
    <>
      <PageHeader title="Edit product" description={data.data.slug} />
      <ProductForm product={data.data} />
    </>
  );
}
