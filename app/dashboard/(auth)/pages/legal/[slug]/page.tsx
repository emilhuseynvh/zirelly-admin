"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { OgFieldsCard } from "@/components/admin/og-fields-card";
import TiptapEditor from "@/components/editor";
import { useGetLanguagesQuery } from "@/lib/api/languages";
import { useGetLegalPageQuery, useUpdateLegalPageMutation } from "@/lib/api/pages";
import { getTranslation, setTranslation } from "@/lib/translations";
import type { Translations, Upload } from "@/lib/api/types";

const PAGES: Record<string, { title: string; description: string }> = {
  "return-policy": {
    title: "Geri Qaytarma Siyasəti",
    description: "Saytda /geri-qaytarma ünvanında göstərilir"
  },
  "privacy-policy": {
    title: "Məxfilik Siyasəti",
    description: "Saytda /mexfilik-siyaseti ünvanında göstərilir"
  },
  "delivery-payment": {
    title: "Çatdırılma və Ödəmə",
    description: "Saytda /catdirilma-ve-odeme ünvanında göstərilir"
  },
  "terms-of-use": {
    title: "İstifadə Şərtləri",
    description: "Saytda /istifade-sertleri ünvanında göstərilir"
  }
};

export default function LegalPageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const meta = PAGES[slug];

  const { data: languages, isLoading: languagesLoading } = useGetLanguagesQuery();
  const { data, isLoading } = useGetLegalPageQuery(slug, { skip: !meta });
  const [updateLegalPage, { isLoading: saving }] = useUpdateLegalPageMutation();

  const [translations, setTranslations] = useState<Translations>({});
  const [ogImage, setOgImage] = useState<Upload | null>(null);

  useEffect(() => {
    if (!data) return;
    setTranslations(data.data.translations ?? {});
    setOgImage(data.data.og_image ?? null);
  }, [data]);

  if (!meta) notFound();

  const activeLanguages = languages?.data.filter((l) => l.is_active) ?? [];

  const handleField = (code: string, field: string, value: string) => {
    setTranslations((prev) => setTranslation(prev, code, field, value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await updateLegalPage({ slug, og_image_id: ogImage?.id ?? null, translations }).unwrap();
      toast.success("Səhifə yeniləndi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Yüklənir...</p>;

  return (
    <>
      <PageHeader title={meta.title} description={meta.description} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Məzmun</CardTitle>
            <CardDescription>Title and full text per language.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeLanguages.length === 0 && (
              <p className="text-muted-foreground text-sm">
                {languagesLoading
                  ? "Loading languages..."
                  : "Languages could not be loaded. Make sure the API is running."}
              </p>
            )}
            {activeLanguages.length > 0 && (
              <Tabs defaultValue={activeLanguages[0].code}>
                <TabsList>
                  {activeLanguages.map((lang) => (
                    <TabsTrigger key={lang.code} value={lang.code}>
                      {lang.code.toUpperCase()}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {activeLanguages.map((lang) => (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={getTranslation(translations, lang.code, "title")}
                        onChange={(e) => handleField(lang.code, "title", e.target.value)}
                        placeholder="Geri Qaytarma və Dəyişdirmə Siyasəti"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <TiptapEditor
                        value={getTranslation(translations, lang.code, "content")}
                        onChange={(val) => handleField(lang.code, "content", val)}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>

        <OgFieldsCard
          languages={activeLanguages}
          translations={translations}
          onField={handleField}
          image={ogImage}
          onImageChange={setOgImage}
        />

        <Button type="submit" disabled={saving}>
          {saving ? "Yadda saxlanır..." : "Yadda saxla"}
        </Button>
      </form>
    </>
  );
}
