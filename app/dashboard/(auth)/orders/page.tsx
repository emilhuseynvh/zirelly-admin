"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DownloadIcon,
  EyeIcon,
  FilterXIcon,
  SearchIcon,
  TrendingUpIcon
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { API_BASE, getToken } from "@/lib/api/base";
import {
  buildOrdersParams,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  type OrdersFilter
} from "@/lib/api/orders";
import type { OrderStatus } from "@/lib/api/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Gözləyir",
  paid: "Yeni sifariş",
  preparing: "Çatdırılmaya hazırlanır",
  shipped: "Çatdırılmaya verildi",
  delivered: "Çatdırıldı",
  cancelled: "Ləğv edilib"
};

const STATUS_DOT: Record<OrderStatus, string> = {
  pending: "bg-amber-500",
  paid: "bg-sky-500",
  preparing: "bg-blue-500",
  shipped: "bg-indigo-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500"
};

type SortField = NonNullable<OrdersFilter["sort"]>;

interface Filters {
  search: string;
  status: OrderStatus | "";
  from: string;
  to: string;
  minTotal: string;
  maxTotal: string;
  promocode: "" | "any" | "none";
  perPage: number;
}

const EMPTY_FILTERS: Filters = {
  search: "",
  status: "",
  from: "",
  to: "",
  minTotal: "",
  maxTotal: "",
  promocode: "",
  perPage: 20
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

export default function OrdersPage() {
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>("id");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [exporting, setExporting] = useState(false);

  const [updateStatus] = useUpdateOrderStatusMutation();

  const filter: OrdersFilter = useMemo(
    () => ({
      page,
      per_page: applied.perPage,
      status: applied.status,
      search: applied.search,
      from: applied.from,
      to: applied.to,
      min_total: applied.minTotal,
      max_total: applied.maxTotal,
      promocode: applied.promocode,
      sort,
      dir
    }),
    [applied, page, sort, dir]
  );

  const { data, isLoading, isFetching } = useGetOrdersQuery(filter);

  const activeFilterCount = [
    applied.search,
    applied.status,
    applied.from,
    applied.to,
    applied.minTotal,
    applied.maxTotal,
    applied.promocode
  ].filter(Boolean).length;

  const applyFilters = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setPage(1);
    setApplied({ ...draft, search: draft.search.trim() });
  };

  const resetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
    setSort("id");
    setDir("desc");
  };

  const toggleSort = (field: SortField) => {
    if (sort === field) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setSort(field);
      setDir("desc");
    }
    setPage(1);
  };

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`#${id} → ${STATUS_LABELS[status]}`);
    } catch {
      toast.error("Status dəyişdirilə bilmədi.");
    }
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const params = buildOrdersParams({ ...filter, page: undefined, per_page: undefined });
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/orders/export?${params.toString()}`, {
        headers: {
          Accept: "text/csv",
          ...(token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {})
        }
      });

      if (!response.ok) throw new Error(String(response.status));

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sifarisler-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV faylı yükləndi.");
    } catch {
      toast.error("Export alınmadı.");
    } finally {
      setExporting(false);
    }
  };

  const sortIndicator = (field: SortField) =>
    sort === field ? (
      dir === "asc" ? (
        <ArrowUpIcon className="size-3.5" />
      ) : (
        <ArrowDownIcon className="size-3.5" />
      )
    ) : null;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Sifarişlər" description="Bütün sifarişləri izlə və idarə et" />
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/statistics">
              <TrendingUpIcon />
              Statistika
            </Link>
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            <DownloadIcon />
            {exporting ? "Hazırlanır..." : "CSV export"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={applyFilters} className="grid gap-3 pb-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Axtarış</Label>
              <Input
                value={draft.search}
                onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                placeholder="Sifariş #, ad, email, telefon, promokod..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Status</Label>
              <Select
                value={draft.status || "all"}
                onValueChange={(v) =>
                  setDraft({ ...draft, status: v === "all" ? "" : (v as OrderStatus) })
                }>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün statuslar</SelectItem>
                  {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Tarix aralığı</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={draft.from}
                  onChange={(e) => setDraft({ ...draft, from: e.target.value })}
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="date"
                  value={draft.to}
                  onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Məbləğ aralığı (₼)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.minTotal}
                  onChange={(e) => setDraft({ ...draft, minTotal: e.target.value })}
                  placeholder="Min"
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.maxTotal}
                  onChange={(e) => setDraft({ ...draft, maxTotal: e.target.value })}
                  placeholder="Max"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Promokod</Label>
              <Select
                value={draft.promocode || "all"}
                onValueChange={(v) =>
                  setDraft({ ...draft, promocode: v === "all" ? "" : (v as "any" | "none") })
                }>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Fərqi yoxdur</SelectItem>
                  <SelectItem value="any">Promokodla</SelectItem>
                  <SelectItem value="none">Promokodsuz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Səhifədə</Label>
              <Select
                value={String(draft.perPage)}
                onValueChange={(v) => setDraft({ ...draft, perPage: Number(v) })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} sifariş
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2 md:col-span-2">
              <Button type="submit">
                <SearchIcon />
                Tətbiq et
              </Button>
              {activeFilterCount > 0 && (
                <Button type="button" variant="outline" onClick={resetFilters}>
                  <FilterXIcon />
                  Sıfırla
                  <Badge variant="secondary">{activeFilterCount}</Badge>
                </Button>
              )}
              {data && (
                <span className="text-muted-foreground ml-auto pb-2 text-sm">
                  Cəmi: <b>{data.meta.total}</b> sifariş
                </span>
              )}
            </div>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">
                  <button
                    type="button"
                    onClick={() => toggleSort("id")}
                    className="flex cursor-pointer items-center gap-1">
                    # {sortIndicator("id")}
                  </button>
                </TableHead>
                <TableHead>Müştəri</TableHead>
                <TableHead className="w-56">Status</TableHead>
                <TableHead className="text-right">Məhsul</TableHead>
                <TableHead>Promokod</TableHead>
                <TableHead className="text-right">Endirim</TableHead>
                <TableHead className="text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort("total")}
                    className="ml-auto flex cursor-pointer items-center gap-1">
                    Cəmi {sortIndicator("total")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => toggleSort("created_at")}
                    className="flex cursor-pointer items-center gap-1">
                    Tarix {sortIndicator("created_at")}
                  </button>
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody className={isFetching ? "opacity-60" : undefined}>
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
                    <Select
                      value={order.status}
                      onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}>
                      <SelectTrigger size="sm" className="w-full">
                        <span className="flex items-center gap-2">
                          <span
                            className={`size-2 shrink-0 rounded-full ${STATUS_DOT[order.status]}`}
                          />
                          {STATUS_LABELS[order.status]}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                          <SelectItem key={s} value={s}>
                            <span
                              className={`mr-1 inline-block size-2 rounded-full ${STATUS_DOT[s]}`}
                            />
                            {STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
