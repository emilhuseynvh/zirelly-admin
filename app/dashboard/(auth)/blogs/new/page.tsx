import { PageHeader } from "@/components/admin/page-header";
import { BlogForm } from "../blog-form";

export default function NewBlogPage() {
  return (
    <>
      <PageHeader title="Yeni bloq" description="Yeni bloq yazısı yarat" />
      <BlogForm />
    </>
  );
}
