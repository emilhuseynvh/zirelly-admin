import { PageHeader } from "@/components/admin/page-header";
import { BlogForm } from "../blog-form";

export default function NewBlogPage() {
  return (
    <>
      <PageHeader title="New blog" description="Create a new blog post" />
      <BlogForm />
    </>
  );
}
