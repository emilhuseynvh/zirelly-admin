"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/admin/page-header";
import {
  useGetDeliverySettingsQuery,
  useUpdateDeliverySettingsMutation
} from "@/lib/api/delivery";

interface FieldDef {
  key: "baku_fee" | "baku_free_threshold" | "region_fee" | "nakhchivan_fee" | "karabakh_fee";
  label: string;
  hint: string;
}

const FIELDS: FieldDef[] = [
  {
    key: "baku_fee",
    label: "Bakı — çatdırılma (₼)",
    hint: "Limitdən aşağı sifarişlər üçün Bakı daxilində çatdırılma haqqı."
  },
  {
    key: "baku_free_threshold",
    label: "Bakı — pulsuz çatdırılma limiti (₼)",
    hint: "Bu məbləğ və üzəri sifarişlərdə Bakıya çatdırılma pulsuzdur."
  },
  {
    key: "region_fee",
    label: "Regionlar — çatdırılma (₼)",
    hint: "Azərbaycanın regionlarına məntəqəyə çatdırılma haqqı."
  },
  {
    key: "nakhchivan_fee",
    label: "Naxçıvan — çatdırılma (₼)",
    hint: "Naxçıvan MR ərazilərinə (Naxçıvan, Culfa, Ordubad, Şərur) çatdırılma haqqı."
  },
  {
    key: "karabakh_fee",
    label: "Qarabağ — çatdırılma (₼)",
    hint: "Qarabağ ərazilərinə çatdırılma haqqı (kargo imkanından asılıdır)."
  }
];

export default function DeliverySettingsPage() {
  const { data, isLoading } = useGetDeliverySettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateDeliverySettingsMutation();

  const [form, setForm] = useState<Record<FieldDef["key"], string>>({
    baku_fee: "",
    baku_free_threshold: "",
    region_fee: "",
    nakhchivan_fee: "",
    karabakh_fee: ""
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      baku_fee: String(data.data.baku_fee ?? ""),
      baku_free_threshold: String(data.data.baku_free_threshold ?? ""),
      region_fee: String(data.data.region_fee ?? ""),
      nakhchivan_fee: String(data.data.nakhchivan_fee ?? ""),
      karabakh_fee: String(data.data.karabakh_fee ?? "")
    });
  }, [data]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await updateSettings({
        baku_fee: Number(form.baku_fee),
        baku_free_threshold: Number(form.baku_free_threshold),
        region_fee: Number(form.region_fee),
        nakhchivan_fee: Number(form.nakhchivan_fee),
        karabakh_fee: Number(form.karabakh_fee)
      }).unwrap();
      toast.success("Çatdırılma qiymətləri yeniləndi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Yüklənir...</p>;

  if (!data)
    return <p className="text-muted-foreground">Məlumat yüklənə bilmədi. Səhifəni yeniləyin.</p>;

  return (
    <>
      <PageHeader
        title="Çatdırılma qiymətləri"
        description="Saytda sifariş zamanı ünvana görə hesablanan çatdırılma haqları"
      />

      <form onSubmit={handleSubmit}>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Zonalara görə qiymətlər</CardTitle>
            <CardDescription>
              Çatdırılma haqqı müştərinin seçdiyi şəhər/rayona görə avtomatik hesablanır və yekun
              məbləğə əlavə olunur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form[field.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                />
                <p className="text-muted-foreground text-xs">{field.hint}</p>
              </div>
            ))}

            <Button type="submit" disabled={saving}>
              {saving ? "Yadda saxlanır..." : "Yadda saxla"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
