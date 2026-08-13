"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BadgeCheckIcon,
  BadgeXIcon,
  DownloadIcon,
  FilterXIcon,
  SearchIcon
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
import { buildUsersParams, useGetUsersQuery, type UsersFilter } from "@/lib/api/users";

type SortField = NonNullable<UsersFilter["sort"]>;

interface Filters {
  search: string;
  role: "user" | "admin" | "";
  verified: "yes" | "no" | "";
  from: string;
  to: string;
  perPage: number;
}

const EMPTY_FILTERS: Filters = {
  search: "",
  role: "",
  verified: "",
  from: "",
  to: "",
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

export default function UsersPage() {
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>("id");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [exporting, setExporting] = useState(false);

  const filter: UsersFilter = useMemo(
    () => ({
      page,
      per_page: applied.perPage,
      search: applied.search,
      role: applied.role,
      verified: applied.verified,
      from: applied.from,
      to: applied.to,
      sort,
      dir
    }),
    [applied, page, sort, dir]
  );

  const { data, isLoading, isFetching } = useGetUsersQuery(filter);

  const activeFilterCount = [
    applied.search,
    applied.role,
    applied.verified,
    applied.from,
    applied.to
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

  const handleExport = async () => {
    setExporting(true);

    try {
      const params = buildUsersParams({ ...filter, page: undefined, per_page: undefined });
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/users/export?${params.toString()}`, {
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
      link.download = `istifadeciler-${new Date().toISOString().slice(0, 10)}.csv`;
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
        <PageHeader
          title="İstifadəçilər"
          description="Qeydiyyatdan keçən bütün istifadəçilər"
        />
        <Button onClick={handleExport} disabled={exporting}>
          <DownloadIcon />
          {exporting ? "Hazırlanır..." : "CSV export"}
        </Button>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={applyFilters} className="grid gap-3 pb-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Axtarış</Label>
              <Input
                value={draft.search}
                onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                placeholder="Ad, soyad, email, telefon..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Rol</Label>
              <Select
                value={draft.role || "all"}
                onValueChange={(v) =>
                  setDraft({ ...draft, role: v === "all" ? "" : (v as "user" | "admin") })
                }>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hamısı</SelectItem>
                  <SelectItem value="user">İstifadəçi</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">E-poçt təsdiqi</Label>
              <Select
                value={draft.verified || "all"}
                onValueChange={(v) =>
                  setDraft({ ...draft, verified: v === "all" ? "" : (v as "yes" | "no") })
                }>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Fərqi yoxdur</SelectItem>
                  <SelectItem value="yes">Təsdiqlənib</SelectItem>
                  <SelectItem value="no">Təsdiqlənməyib</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Qeydiyyat tarixi</Label>
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
                      {n} istifadəçi
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
                  Cəmi: <b>{data.meta.total}</b> istifadəçi
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
                <TableHead>
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="flex cursor-pointer items-center gap-1">
                    Ad Soyad {sortIndicator("name")}
                  </button>
                </TableHead>
                <TableHead>E-poçt</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>E-poçt təsdiqi</TableHead>
                <TableHead className="text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort("orders_count")}
                    className="ml-auto flex cursor-pointer items-center gap-1">
                    Sifariş {sortIndicator("orders_count")}
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort("orders_total")}
                    className="ml-auto flex cursor-pointer items-center gap-1">
                    Xərclədiyi {sortIndicator("orders_total")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => toggleSort("created_at")}
                    className="flex cursor-pointer items-center gap-1">
                    Qeydiyyat {sortIndicator("created_at")}
                  </button>
                </TableHead>
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
              {data?.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">#{user.id}</TableCell>
                  <TableCell>
                    {user.name} {user.surname}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Admin" : "İstifadəçi"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.email_verified ? (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <BadgeCheckIcon className="size-4" />
                        Təsdiqlənib
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1 text-sm">
                        <BadgeXIcon className="size-4" />
                        Yox
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{user.orders_count ?? 0}</TableCell>
                  <TableCell className="text-right font-medium">
                    {(user.orders_total ?? 0).toFixed(2)} ₼
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(user.created_at)}
                  </TableCell>
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-muted-foreground py-8 text-center">
                    İstifadəçi tapılmadı.
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
