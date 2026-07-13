"use client";

import { useEffect, useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import TiptapEditor from "@/components/editor";
import { PageHeader } from "@/components/admin/page-header";
import { ImageUpload } from "@/components/admin/image-upload";
import { useGetLanguagesQuery } from "@/lib/api/languages";
import { useGetAboutQuery, useUpdateAboutMutation } from "@/lib/api/pages";
import { getTranslation, setTranslation } from "@/lib/translations";
import type { Translations, Upload } from "@/lib/api/types";

interface ItemRow {
  translations: Translations;
}

export default function AboutPageEditor() {
  const { data: languages } = useGetLanguagesQuery();
  const { data, isLoading } = useGetAboutQuery();
  const [updateAbout, { isLoading: saving }] = useUpdateAboutMutation();

  const [translations, setTranslations] = useState<Translations>({});
  const [heroImage, setHeroImage] = useState<Upload | null>(null);
  const [sectionImage, setSectionImage] = useState<Upload | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);

  useEffect(() => {
    if (!data) return;
    setTranslations(data.data.translations ?? {});
    setHeroImage(data.data.hero.image);
    setSectionImage(data.data.section.image);
    setItems(data.data.section.items.map((item) => ({ translations: item.translations ?? {} })));
  }, [data]);

  const activeLanguages = languages?.data.filter((l) => l.is_active) ?? [];

  const handleField = (code: string, field: string, value: string) => {
    setTranslations((prev) => setTranslation(prev, code, field, value));
  };

  const handleItemField = (index: number, code: string, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { translations: setTranslation(item.translations, code, field, value) } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await updateAbout({
        hero_image_id: heroImage?.id ?? null,
        section_image_id: sectionImage?.id ?? null,
        translations,
        items
      }).unwrap();
      toast.success("About səhifəsi yeniləndi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <>
      <PageHeader title="About page" description="Manage the about page content" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            {activeLanguages.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Languages could not be loaded. Make sure the API is running.
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
                      <Label>Meta title</Label>
                      <Input
                        value={getTranslation(translations, lang.code, "meta_title")}
                        onChange={(e) => handleField(lang.code, "meta_title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meta description</Label>
                      <Textarea
                        value={getTranslation(translations, lang.code, "meta_description")}
                        onChange={(e) => handleField(lang.code, "meta_description", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hero title</Label>
                      <Input
                        value={getTranslation(translations, lang.code, "hero_title")}
                        onChange={(e) => handleField(lang.code, "hero_title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hero description</Label>
                      <TiptapEditor
                        value={getTranslation(translations, lang.code, "hero_description")}
                        onChange={(val) => handleField(lang.code, "hero_description", val)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Section title</Label>
                      <Input
                        value={getTranslation(translations, lang.code, "section_title")}
                        onChange={(e) => handleField(lang.code, "section_title", e.target.value)}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Hero image</Label>
              <ImageUpload value={heroImage} onChange={setHeroImage} />
            </div>
            <div className="space-y-2">
              <Label>Section image</Label>
              <ImageUpload value={sectionImage} onChange={setSectionImage} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Section items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}>
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
                {activeLanguages.map((lang) => (
                  <div key={lang.code} className="grid gap-2 sm:grid-cols-[3rem_1fr_2fr]">
                    <span className="text-muted-foreground self-center text-sm font-medium">
                      {lang.code.toUpperCase()}
                    </span>
                    <Input
                      placeholder="Title"
                      value={getTranslation(item.translations, lang.code, "title")}
                      onChange={(e) => handleItemField(index, lang.code, "title", e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      value={getTranslation(item.translations, lang.code, "description")}
                      onChange={(e) =>
                        handleItemField(index, lang.code, "description", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setItems((prev) => [...prev, { translations: {} }])}>
              <PlusIcon />
              Add item
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </>
  );
}
