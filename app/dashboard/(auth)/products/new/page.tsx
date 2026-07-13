import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="New product" description="Create a new product" />
      <ProductForm />
    </>
  );
}
