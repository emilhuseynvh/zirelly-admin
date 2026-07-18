"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { useGetOrderQuery, useUpdateOrderStatusMutation } from "@/lib/api/orders";
import type { OrderStatus } from "@/lib/api/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Gözləyir",
  paid: "Ödənilib",
  cancelled: "Ləğv edilib"
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

export default function OrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data, isLoading } = useGetOrderQuery(id, { skip: Number.isNaN(id) });
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();

  const order = data?.data;

  const handleStatusChange = async (status: OrderStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success("Status yeniləndi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Status yenilənmədi.");
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground py-8 text-center">Yüklənir...</p>;
  }

  if (!order) {
    return <p className="text-muted-foreground py-8 text-center">Sifariş tapılmadı.</p>;
  }

  return (
    <>
      <PageHeader title={`Sifariş #${order.id}`} description={formatDate(order.created_at)}>
        <div className="flex items-center gap-2">
          <Select
            value={order.status}
            onValueChange={(v) => handleStatusChange(v as OrderStatus)}
            disabled={updating}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeftIcon />
              Geri
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Müştəri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">
              {order.user?.name} {order.user?.surname}
            </p>
            <p className="text-muted-foreground">{order.user?.email}</p>
            {order.user?.phone && <p className="text-muted-foreground">{order.user.phone}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Məbləğ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ara cəm</span>
              <span>{order.subtotal.toFixed(2)} ₼</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Endirim {order.promocode_code ? `(${order.promocode_code})` : ""}
              </span>
              <span>
                {order.discount_amount > 0 ? `−${order.discount_amount.toFixed(2)} ₼` : "—"}
              </span>
            </div>
            <div className="flex justify-between border-t pt-1 font-semibold">
              <span>Cəmi</span>
              <span>{order.total.toFixed(2)} ₼</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ödəniş</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {order.transactions?.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2">
                <div className="leading-tight">
                  <Badge
                    variant={
                      t.status === "success"
                        ? "default"
                        : t.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }>
                    {t.status}
                  </Badge>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {t.method} · {t.reference}
                  </p>
                </div>
                <span className="font-medium">{t.amount.toFixed(2)} ₼</span>
              </div>
            ))}
            {(!order.transactions || order.transactions.length === 0) && (
              <p className="text-muted-foreground">Tranzaksiya yoxdur.</p>
            )}
            {order.paid_at && (
              <p className="text-muted-foreground border-t pt-2 text-xs">
                Ödənilib: {formatDate(order.paid_at)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Məhsullar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Məhsul</TableHead>
                <TableHead className="text-right">Qiymət</TableHead>
                <TableHead className="text-right">Say</TableHead>
                <TableHead className="text-right">Cəmi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.product_id ? (
                      <Link
                        href={`/dashboard/products/${item.product_id}`}
                        className="hover:underline">
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.unit_price.toFixed(2)} ₼</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right font-medium">
                    {item.line_total.toFixed(2)} ₼
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
