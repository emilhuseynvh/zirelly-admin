"use client";

import Link from "next/link";
import { useState } from "react";
import { EyeIcon, SearchIcon } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
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
import { useGetOrdersQuery, useGetOrderStatsQuery } from "@/lib/api/orders";
import type { OrderStatus } from "@/lib/api/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Gözləyir",
  paid: "Ödənilib",
  cancelled: "Ləğv edilib"
};

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  cancelled: "destructive"
};

const revenueChartConfig = {
  revenue: { label: "Gəlir (₼)", color: "var(--chart-1)" }
} satisfies ChartConfig;

const ordersChartConfig = {
  orders: { label: "Sifariş", color: "var(--chart-2)" }
} satisfies ChartConfig;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

const shortDate = (date: string) =>
  new Date(date).toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit" });

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}

export default function OrdersPage() {
  const [days, setDays] = useState(30);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: statsData } = useGetOrderStatsQuery({ days });
  const { data, isLoading } = useGetOrdersQuery({ page, status, search });

  const stats = statsData?.data;

  const applySearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <>
      <PageHeader title="Sifarişlər" description="Bütün sifarişləri izlə və idarə et" />

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Ümumi sifariş" value={String(stats.totals.orders)} />
            <StatCard title="Ödənilmiş" value={String(stats.totals.paid_orders)} />
            <StatCard title="Gəlir" value={`${stats.totals.revenue.toFixed(2)} ₼`} />
            <StatCard title="Endirim cəmi" value={`${stats.totals.discount_total.toFixed(2)} ₼`} />
            <StatCard title="Orta sifariş" value={`${stats.totals.average_order.toFixed(2)} ₼`} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Gəlir (günlük)</CardTitle>
                <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Son 7 gün</SelectItem>
                    <SelectItem value="30">Son 30 gün</SelectItem>
                    <SelectItem value="90">Son 90 gün</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueChartConfig} className="h-56 w-full">
                  <AreaChart data={stats.by_day}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={shortDate}
                    />
                    <YAxis tickLine={false} axisLine={false} width={48} />
                    <ChartTooltip content={<ChartTooltipContent />} labelFormatter={shortDate} />
                    <Area
                      dataKey="revenue"
                      type="monotone"
                      fill="var(--color-revenue)"
                      fillOpacity={0.2}
                      stroke="var(--color-revenue)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sifariş sayı (günlük)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={ordersChartConfig} className="h-56 w-full">
                  <BarChart data={stats.by_day}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={shortDate}
                    />
                    <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} labelFormatter={shortDate} />
                    <Bar dataKey="orders" fill="var(--color-orders)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Status üzrə</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.by_status.map((row) => (
                  <div key={row.status} className="flex items-center justify-between">
                    <OrderStatusBadge status={row.status} />
                    <span className="font-medium">{row.count}</span>
                  </div>
                ))}
                {stats.by_status.length === 0 && (
                  <p className="text-muted-foreground text-sm">Məlumat yoxdur.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ən çox satılan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.top_products.map((row) => (
                  <div key={row.title} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{row.title}</span>
                    <span className="text-muted-foreground shrink-0">
                      {row.quantity} əd · {row.revenue.toFixed(2)} ₼
                    </span>
                  </div>
                ))}
                {stats.top_products.length === 0 && (
                  <p className="text-muted-foreground text-sm">Məlumat yoxdur.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promokod istifadəsi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.promocodes.map((row) => (
                  <div key={row.code} className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-mono">{row.code}</span>
                    <span className="text-muted-foreground shrink-0">
                      {row.uses} dəfə · −{row.discount_total.toFixed(2)} ₼
                    </span>
                  </div>
                ))}
                {stats.promocodes.length === 0 && (
                  <p className="text-muted-foreground text-sm">Hələ istifadə yoxdur.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card className="mt-4">
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 pb-4">
            <form onSubmit={applySearch} className="flex flex-1 items-center gap-2">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Sifariş #, email, ad və ya promokod axtar..."
                className="max-w-xs"
              />
              <Button type="submit" variant="outline" size="icon">
                <SearchIcon />
              </Button>
            </form>
            <Select
              value={status || "all"}
              onValueChange={(v) => {
                setPage(1);
                setStatus(v === "all" ? "" : (v as OrderStatus));
              }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün statuslar</SelectItem>
                <SelectItem value="pending">Gözləyir</SelectItem>
                <SelectItem value="paid">Ödənilib</SelectItem>
                <SelectItem value="cancelled">Ləğv edilib</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Müştəri</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Məhsul</TableHead>
                <TableHead>Promokod</TableHead>
                <TableHead className="text-right">Endirim</TableHead>
                <TableHead className="text-right">Cəmi</TableHead>
                <TableHead>Tarix</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="text-muted-foreground py-8 text-center">
                    Yüklənir...
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div className="leading-tight">
                      <div>
                        {order.user?.name} {order.user?.surname}
                      </div>
                      <div className="text-muted-foreground text-xs">{order.user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">{order.items_count}</TableCell>
                  <TableCell className="font-mono text-sm">{order.promocode_code ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {order.discount_amount > 0 ? `−${order.discount_amount.toFixed(2)} ₼` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {order.total.toFixed(2)} ₼
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <EyeIcon />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-muted-foreground py-8 text-center">
                    Sifariş tapılmadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {data && data.meta.last_page > 1 && (
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}>
                Əvvəlki
              </Button>
              <span className="text-muted-foreground text-sm">
                {data.meta.current_page} / {data.meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.meta.last_page}
                onClick={() => setPage(page + 1)}>
                Növbəti
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-muted-foreground text-sm">{title}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
