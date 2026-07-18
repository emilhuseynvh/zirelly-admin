"use client";

import { useState } from "react";
import { PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import {
  useCreatePromocodeMutation,
  useDeletePromocodeMutation,
  useGetPromocodesQuery,
  useUpdatePromocodeMutation
} from "@/lib/api/promocodes";
import type { Promocode, PromocodeType } from "@/lib/api/types";

const TYPE_LABELS: Record<PromocodeType, string> = {
  first_order: "İlk sifariş",
  single_use: "1 dəfəlik (hər user)",
  unlimited: "Limitsiz"
};

interface FormState {
  code: string;
  type: PromocodeType;
  discount_type: "percent" | "fixed";
  discount_value: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  code: "",
  type: "unlimited",
  discount_type: "percent",
  discount_value: "",
  starts_at: "",
  ends_at: "",
  is_active: true
};

const toInputDateTime = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

export default function PromocodesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetPromocodesQuery({ page });
  const [createPromocode, { isLoading: creating }] = useCreatePromocodeMutation();
  const [updatePromocode, { isLoading: updating }] = useUpdatePromocodeMutation();
  const [deletePromocode] = useDeletePromocodeMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Promocode | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const saving = creating || updating;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (promocode: Promocode) => {
    setEditing(promocode);
    setForm({
      code: promocode.code,
      type: promocode.type,
      discount_type: promocode.discount_type,
      discount_value: String(promocode.discount_value),
      starts_at: toInputDateTime(promocode.starts_at),
      ends_at: toInputDateTime(promocode.ends_at),
      is_active: promocode.is_active
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const body = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      starts_at: form.starts_at,
      ends_at: form.ends_at,
      is_active: form.is_active
    };

    try {
      if (editing) {
        await updatePromocode({ id: editing.id, body }).unwrap();
        toast.success("Promokod yeniləndi.");
      } else {
        await createPromocode(body).unwrap();
        toast.success("Promokod yaradıldı.");
      }
      setOpen(false);
    } catch (err: any) {
      const errors = err?.data?.errors;
      const firstError = errors ? (Object.values(errors)[0] as string[])[0] : null;
      toast.error(firstError ?? err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePromocode(id).unwrap();
      toast.success("Promokod silindi.");
    } catch {
      toast.error("Silinmə alınmadı.");
    }
  };

  const discountLabel = (p: Promocode) =>
    p.discount_type === "percent" ? `${p.discount_value}%` : `${p.discount_value.toFixed(2)} ₼`;

  return (
    <>
      <PageHeader title="Promokodlar" description="Endirim kodlarını idarə et">
        <Button onClick={openCreate}>
          <PlusIcon />
          Yeni promokod
        </Button>
      </PageHeader>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kod</TableHead>
                <TableHead>Növ</TableHead>
                <TableHead>Endirim</TableHead>
                <TableHead>Başlama</TableHead>
                <TableHead>Bitmə</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">İstifadə</TableHead>
                <TableHead className="text-right">Endirim cəmi</TableHead>
                <TableHead className="w-24" />
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
              {data?.data.map((promocode) => {
                const expired = new Date(promocode.ends_at) < new Date();

                return (
                  <TableRow key={promocode.id}>
                    <TableCell className="font-mono font-medium">{promocode.code}</TableCell>
                    <TableCell>{TYPE_LABELS[promocode.type]}</TableCell>
                    <TableCell>{discountLabel(promocode)}</TableCell>
                    <TableCell>{formatDate(promocode.starts_at)}</TableCell>
                    <TableCell>{formatDate(promocode.ends_at)}</TableCell>
                    <TableCell>
                      {!promocode.is_active ? (
                        <Badge variant="secondary">Deaktiv</Badge>
                      ) : expired ? (
                        <Badge variant="destructive">Vaxtı keçib</Badge>
                      ) : (
                        <Badge>Aktiv</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{promocode.uses_count}</TableCell>
                    <TableCell className="text-right">
                      {promocode.discount_total.toFixed(2)} ₼
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(promocode)}>
                          <PencilIcon />
                        </Button>
                        <ConfirmDelete onConfirm={() => handleDelete(promocode.id)} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-muted-foreground py-8 text-center">
                    Hələ promokod yoxdur.
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Promokodu redaktə et" : "Yeni promokod"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Kod</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME20"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Növ</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm({ ...form, type: value as FormState["type"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_order">İlk sifariş üçün</SelectItem>
                  <SelectItem value="single_use">Hər istifadəçi 1 dəfə</SelectItem>
                  <SelectItem value="unlimited">Limitsiz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Endirim növü</Label>
                <Select
                  value={form.discount_type}
                  onValueChange={(value) =>
                    setForm({ ...form, discount_type: value as FormState["discount_type"] })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Faiz (%)</SelectItem>
                    <SelectItem value="fixed">Məbləğ (₼)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount_value">
                  Dəyər {form.discount_type === "percent" ? "(%)" : "(₼)"}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={form.discount_type === "percent" ? 100 : undefined}
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="starts_at">Başlama tarixi</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ends_at">Bitmə tarixi</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Aktiv</Label>
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Ləğv et
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Yadda saxlanır..." : "Yadda saxla"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
