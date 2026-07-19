"use client";

import { useEffect, useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-header";
import { ImageUpload } from "@/components/admin/image-upload";
import { useGetLanguagesQuery } from "@/lib/api/languages";
import { useGetProductsPageQuery, useUpdateProductsPageMutation } from "@/lib/api/pages";
import { getTranslation, setTranslation } from "@/lib/translations";
import type { Language, Translations, Upload } from "@/lib/api/types";

interface SlideRow {
  image: Upload | null;
  link: string;
  translations: Translations;
}

function LanguageTabs({
  languages,
  children
}: {
  languages: Language[];
  children: (lang: Language) => React.ReactNode;
}) {
  if (languages.length === 0) return null;

  return (
    <Tabs defaultValue={languages[0].code}>
      <TabsList>
        {languages.map((lang) => (
          <TabsTrigger key={lang.code} value={lang.code}>
            {lang.code.toUpperCase()}
          </TabsTrigger>
        ))}
      </TabsList>
      {languages.map((lang) => (
        <TabsContent key={lang.code} value={lang.code} className="space-y-4 pt-2">
          {children(lang)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default function ProductsPageEditor() {
  const { data: languages, isLoading: languagesLoading } = useGetLanguagesQuery();
  const { data, isLoading } = useGetProductsPageQuery();
  const [updatePage, { isLoading: saving }] = useUpdateProductsPageMutation();

  const [translations, setTranslations] = useState<Translations>({});
  const [slides, setSlides] = useState<SlideRow[]>([]);
  const [sideImage, setSideImage] = useState<Upload | null>(null);

  useEffect(() => {
    if (!data) return;
    setTranslations(data.data.translations ?? {});
    setSlides(
      data.data.slides.map((s) => ({
        image: s.image,
        link: s.link ?? "",
        translations: s.translations ?? {}
      }))
    );
    setSideImage(data.data.side_image);
  }, [data]);

  const activeLanguages = languages?.data.filter((l) => l.is_active) ?? [];

  const handleField = (code: string, field: string, value: string) => {
    setTranslations((prev) => setTranslation(prev, code, field, value));
  };

  const patchSlide = (index: number, patch: Partial<SlideRow>) => {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const patchSlideText = (index: number, code: string, field: string, value: string) => {
    setSlides((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, translations: setTranslation(s.translations, code, field, value) } : s
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await updatePage({
        side_image_id: sideImage?.id ?? null,
        slides: slides.map((s) => ({
          image_id: s.image?.id ?? null,
          link: s.link || null,
          translations: s.translations
        })),
        translations
      }).unwrap();
      toast.success("Products səhifəsi yeniləndi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <>
      <PageHeader title="Products page" description="Manage the products page content" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            {activeLanguages.length === 0 && (
              <p className="text-muted-foreground text-sm">
                {languagesLoading
                  ? "Loading languages..."
                  : "Languages could not be loaded. Make sure the API is running."}
              </p>
            )}
            <LanguageTabs languages={activeLanguages}>
              {(lang) => (
                <>
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
                    <Label>Products section title</Label>
                    <Input
                      value={getTranslation(translations, lang.code, "products_title")}
                      onChange={(e) => handleField(lang.code, "products_title", e.target.value)}
                    />
                  </div>
                </>
              )}
            </LanguageTabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hero slides</CardTitle>
            <CardDescription>
              Slider shown at the top of the page. Each slide has an image, title and button.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {slides.map((slide, index) => (
              <div key={index} className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Slide {index + 1}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setSlides((prev) => prev.filter((_, i) => i !== index))}>
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ImageUpload
                    value={slide.image}
                    onChange={(image) => patchSlide(index, { image })}
                  />
                  <div className="space-y-2">
                    <Label>Button link</Label>
                    <Input
                      value={slide.link}
                      onChange={(e) => patchSlide(index, { link: e.target.value })}
                      placeholder="/products"
                    />
                  </div>
                </div>
                <LanguageTabs languages={activeLanguages}>
                  {(lang) => (
                    <>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={getTranslation(slide.translations, lang.code, "title")}
                          onChange={(e) => patchSlideText(index, lang.code, "title", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button text</Label>
                        <Input
                          value={getTranslation(slide.translations, lang.code, "button_text")}
                          onChange={(e) =>
                            patchSlideText(index, lang.code, "button_text", e.target.value)
                          }
                        />
                      </div>
                    </>
                  )}
                </LanguageTabs>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setSlides((prev) => [...prev, { image: null, link: "", translations: {} }])
              }>
              <PlusIcon />
              Add slide
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Side image</CardTitle>
            <CardDescription>Large image shown to the left of the product cards.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload value={sideImage} onChange={setSideImage} />
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </>
  );
}
