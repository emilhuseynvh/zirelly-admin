"use client";

import { useEffect, useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-header";
import { ImageUpload } from "@/components/admin/image-upload";
import { useGetLanguagesQuery } from "@/lib/api/languages";
import { useGetHomeQuery, useUpdateHomeMutation } from "@/lib/api/pages";
import { getTranslation, setTranslation } from "@/lib/translations";
import type { Translations, Upload } from "@/lib/api/types";

interface TestimonialRow {
  name: string;
  rating: number;
  image: Upload | null;
  translations: Translations;
}

export default function TestimonialsPage() {
  const { data: languages } = useGetLanguagesQuery();
  const { data, isLoading } = useGetHomeQuery();
  const [updateHome, { isLoading: saving }] = useUpdateHomeMutation();

  const [rows, setRows] = useState<TestimonialRow[]>([]);
  const [titleTranslations, setTitleTranslations] = useState<Translations>({});

  useEffect(() => {
    if (!data) return;
    const page = data.data;

    setRows(
      page.testimonials.items.map((t) => ({
        name: t.name,
        rating: t.rating,
        image: t.image,
        translations: t.translations ?? {}
      }))
    );

    const titles: Translations = {};
    for (const [code, fields] of Object.entries(page.translations ?? {})) {
      titles[code] = { testimonials_title: fields.testimonials_title ?? null };
    }
    setTitleTranslations(titles);
  }, [data]);

  const activeLanguages = languages?.data.filter((l) => l.is_active) ?? [];

  const patchRow = (index: number, patch: Partial<TestimonialRow>) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const patchRowText = (index: number, code: string, value: string) =>
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, translations: setTranslation(row.translations, code, "comment", value) }
          : row
      )
    );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await updateHome({
        translations: titleTranslations,
        testimonials: rows.map((t) => ({
          name: t.name,
          rating: t.rating,
          image_id: t.image?.id ?? null,
          translations: t.translations
        }))
      }).unwrap();
      toast.success("Rəylər yeniləndi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Yüklənir...</p>;

  return (
    <>
      <PageHeader title="Rəylər" description="Ana səhifədə göstərilən müştəri rəyləri" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bölmə başlığı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeLanguages.map((lang) => (
              <div key={lang.code} className="grid gap-2 sm:grid-cols-[3rem_1fr]">
                <span className="text-muted-foreground self-center text-sm font-medium">
                  {lang.code.toUpperCase()}
                </span>
                <Input
                  value={getTranslation(titleTranslations, lang.code, "testimonials_title")}
                  onChange={(e) =>
                    setTitleTranslations((prev) =>
                      setTranslation(prev, lang.code, "testimonials_title", e.target.value)
                    )
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rəylər ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rows.map((testimonial, index) => (
              <div key={index} className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rəy {index + 1}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}>
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Ad</Label>
                    <Input
                      required
                      value={testimonial.name}
                      onChange={(e) => patchRow(index, { name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reytinq</Label>
                    <Select
                      value={String(testimonial.rating)}
                      onValueChange={(v) => patchRow(index, { rating: Number(v) })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} ★
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Şəkil</Label>
                    <ImageUpload
                      value={testimonial.image}
                      onChange={(image) => patchRow(index, { image })}
                    />
                  </div>
                </div>
                {activeLanguages.map((lang) => (
                  <div key={lang.code} className="grid gap-2 sm:grid-cols-[3rem_1fr]">
                    <span className="text-muted-foreground self-center text-sm font-medium">
                      {lang.code.toUpperCase()}
                    </span>
                    <Textarea
                      placeholder="Rəy mətni"
                      value={getTranslation(testimonial.translations, lang.code, "comment")}
                      onChange={(e) => patchRowText(index, lang.code, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setRows((prev) => [...prev, { name: "", rating: 5, image: null, translations: {} }])
              }>
              <PlusIcon />
              Rəy əlavə et
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Yadda saxlanır..." : "Yadda saxla"}
        </Button>
      </form>
    </>
  );
}
