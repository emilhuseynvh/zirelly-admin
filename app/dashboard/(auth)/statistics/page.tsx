"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { useGetOrderStatsQuery } from "@/lib/api/orders";
import type { OrderStatus } from "@/lib/api/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Gözləyir",
  paid: "Yeni sifariş",
  preparing: "Çatdırılmaya hazırlanır",
  shipped: "Çatdırılmaya verildi",
  delivered: "Çatdırıldı",
  returned: "Qaytarıldı",
  cancelled: "Ləğv edilib"
};

const STATUS_VARIANTS: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  paid: "default",
  preparing: "secondary",
  shipped: "outline",
  delivered: "default",
  returned: "outline",
  cancelled: "destructive"
};

const revenueChartConfig = {
  revenue: { label: "Gəlir (₼)", color: "var(--chart-1)" }
} satisfies ChartConfig;

const ordersChartConfig = {
  orders: { label: "Sifariş", color: "var(--chart-2)" }
} satisfies ChartConfig;

const shortDate = (date: string) =>
  new Date(date).toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit" });

export default function StatisticsPage() {
  const [days, setDays] = useState(30);

  const { data: statsData, isLoading } = useGetOrderStatsQuery({ days });
  const stats = statsData?.data;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Statistika" description="Satış və sifariş göstəriciləri" />
        <Button variant="outline" asChild>
          <Link href="/dashboard/orders">
            Bütün sifarişlər
            <ArrowRightIcon />
          </Link>
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Yüklənir...</p>}

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
                    <Badge variant={STATUS_VARIANTS[row.status]}>
                      {STATUS_LABELS[row.status]}
                    </Badge>
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
