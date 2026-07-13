"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { useDeleteBlogMutation, useGetBlogsQuery } from "@/lib/api/blogs";

export default function BlogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetBlogsQuery({ page });
  const [deleteBlog] = useDeleteBlogMutation();

  const handleDelete = async (id: number) => {
    try {
      await deleteBlog(id).unwrap();
      toast.success("Blog silindi.");
    } catch {
      toast.error("Silinmə alınmadı.");
    }
  };

  return (
    <>
      <PageHeader title="Blogs" description="Manage blog posts">
        <Button asChild>
          <Link href="/dashboard/blogs/new">
            <PlusIcon />
            New blog
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>
                    {blog.image ? (
                      <Image
                        src={blog.image}
                        alt={blog.title ?? ""}
                        width={48}
                        height={36}
                        unoptimized
                        className="h-9 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="bg-muted h-9 w-12 rounded" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell className="text-muted-foreground">{blog.slug}</TableCell>
                  <TableCell>
                    <Badge variant={blog.is_published ? "default" : "secondary"}>
                      {blog.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" asChild>
                      <Link href={`/dashboard/blogs/${blog.id}`}>
                        <PencilIcon className="size-4" />
                      </Link>
                    </Button>
                    <ConfirmDelete onConfirm={() => handleDelete(blog.id)} />
                  </TableCell>
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                    No blogs yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {data && data.meta.last_page > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                {data.meta.current_page} / {data.meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.meta.last_page}
                onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
