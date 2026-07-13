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
import { useDeleteProductMutation, useGetProductsQuery } from "@/lib/api/products";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetProductsQuery({ page });
  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id).unwrap();
      toast.success("Məhsul silindi.");
    } catch {
      toast.error("Silinmə alınmadı.");
    }
  };

  return (
    <>
      <PageHeader title="Products" description="Manage products">
        <Button asChild>
          <Link href="/dashboard/products/new">
            <PlusIcon />
            New product
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
                <TableHead>Price</TableHead>
                <TableHead>Final price</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.title ?? ""}
                        width={48}
                        height={36}
                        unoptimized
                        className="h-9 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="bg-muted h-9 w-12 rounded" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.price} ₼</TableCell>
                  <TableCell>
                    {product.final_price} ₼
                    {product.discount != null && (
                      <Badge variant="secondary" className="ml-2">
                        -{product.discount}
                        {product.discount_type === "percent" ? "%" : " ₼"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.rating.average} ({product.rating.count})
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" asChild>
                      <Link href={`/dashboard/products/${product.id}`}>
                        <PencilIcon className="size-4" />
                      </Link>
                    </Button>
                    <ConfirmDelete onConfirm={() => handleDelete(product.id)} />
                  </TableCell>
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                    No products yet.
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
