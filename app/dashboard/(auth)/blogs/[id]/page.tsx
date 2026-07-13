"use client";

import { use } from "react";

import { PageHeader } from "@/components/admin/page-header";
import { useGetBlogQuery } from "@/lib/api/blogs";
import { BlogForm } from "../blog-form";

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useGetBlogQuery(Number(id));

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!data) return <p className="text-muted-foreground">Blog not found.</p>;

  return (
    <>
      <PageHeader title="Edit blog" description={data.data.slug} />
      <BlogForm blog={data.data} />
    </>
  );
}
