import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Yeni məhsul" description="Yeni məhsul yarat" />
      <ProductForm />
    </>
  );
}
