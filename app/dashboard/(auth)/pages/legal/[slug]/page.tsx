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
import TiptapEditor from "@/components/editor";
import { useGetLanguagesQuery } from "@/lib/api/languages";
import { useGetLegalPageQuery, useUpdateLegalPageMutation } from "@/lib/api/pages";
import { getTranslation, setTranslation } from "@/lib/translations";
import type { Translations } from "@/lib/api/types";

const PAGES: Record<string, { title: string; description: string }> = {
  "return-policy": {
    title: "Return & Exchange Policy",
    description: "Shown on the website at /return-policy"
  },
  "privacy-policy": {
    title: "Privacy Policy",
    description: "Shown on the website at /privacy-policy"
  }
};

export default function LegalPageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const meta = PAGES[slug];

  const { data: languages, isLoading: languagesLoading } = useGetLanguagesQuery();
  const { data, isLoading } = useGetLegalPageQuery(slug, { skip: !meta });
  const [updateLegalPage, { isLoading: saving }] = useUpdateLegalPageMutation();

  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    if (!data) return;
    setTranslations(data.data.translations ?? {});
  }, [data]);

  if (!meta) notFound();

  const activeLanguages = languages?.data.filter((l) => l.is_active) ?? [];

  const handleField = (code: string, field: string, value: string) => {
    setTranslations((prev) => setTranslation(prev, code, field, value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await updateLegalPage({ slug, translations }).unwrap();
      toast.success("Səhifə yeniləndi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <>
      <PageHeader title={meta.title} description={meta.description} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
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

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </>
  );
}
