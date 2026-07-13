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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-header";
import { ImageUpload } from "@/components/admin/image-upload";
import { useGetLanguagesQuery } from "@/lib/api/languages";
import { useGetHomeQuery, useUpdateHomeMutation } from "@/lib/api/pages";
import { getTranslation, setTranslation } from "@/lib/translations";
import type { Language, Translations, Upload } from "@/lib/api/types";

interface SlideRow {
  image: Upload | null;
  link: string;
  translations: Translations;
}

interface StatRow {
  value: string;
  translations: Translations;
}

interface TestimonialRow {
  name: string;
  rating: number;
  image: Upload | null;
  translations: Translations;
}

interface FaqRow {
  translations: Translations;
}

const PAGE_FIELDS = [
  { key: "meta_title", label: "Meta title" },
  { key: "meta_description", label: "Meta description" },
  { key: "stats_title", label: "Stats section title" },
  { key: "banner_button_text", label: "Banner button text" },
  { key: "testimonials_title", label: "Testimonials section title" },
  { key: "faq_title", label: "FAQ section title" }
];

function LanguageTabs({
  languages,
  children
}: {
  languages: Language[];
  children: (lang: Language) => React.ReactNode;
}) {
  if (languages.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Languages could not be loaded. Make sure the API is running.
      </p>
    );
  }

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

export default function HomePageEditor() {
  const { data: languages } = useGetLanguagesQuery();
  const { data, isLoading } = useGetHomeQuery();
  const [updateHome, { isLoading: saving }] = useUpdateHomeMutation();

  const [translations, setTranslations] = useState<Translations>({});
  const [bannerImage, setBannerImage] = useState<Upload | null>(null);
  const [bannerLink, setBannerLink] = useState("");
  const [slides, setSlides] = useState<SlideRow[]>([]);
  const [stats, setStats] = useState<StatRow[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [faqs, setFaqs] = useState<FaqRow[]>([]);

  useEffect(() => {
    if (!data) return;
    const page = data.data;
    setTranslations(page.translations ?? {});
    setBannerImage(page.banner.image);
    setBannerLink(page.banner.link ?? "");
    setSlides(
      page.slides.map((s) => ({
        image: s.image,
        link: s.link ?? "",
        translations: s.translations ?? {}
      }))
    );
    setStats(page.stats.items.map((s) => ({ value: s.value, translations: s.translations ?? {} })));
    setTestimonials(
      page.testimonials.items.map((t) => ({
        name: t.name,
        rating: t.rating,
        image: t.image,
        translations: t.translations ?? {}
      }))
    );
    setFaqs(page.faq.items.map((f) => ({ translations: f.translations ?? {} })));
  }, [data]);

  const activeLanguages = languages?.data.filter((l) => l.is_active) ?? [];

  const handleField = (code: string, field: string, value: string) => {
    setTranslations((prev) => setTranslation(prev, code, field, value));
  };

  const updateRow = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    return (index: number, patch: Partial<T>) =>
      setter((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const updateRowTranslation = <T extends { translations: Translations }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    return (index: number, code: string, field: string, value: string) =>
      setter((prev) =>
        prev.map((row, i) =>
          i === index
            ? { ...row, translations: setTranslation(row.translations, code, field, value) }
            : row
        )
      );
  };

  const patchSlide = updateRow(setSlides);
  const patchSlideText = updateRowTranslation(setSlides);
  const patchStat = updateRow(setStats);
  const patchStatText = updateRowTranslation(setStats);
  const patchTestimonial = updateRow(setTestimonials);
  const patchTestimonialText = updateRowTranslation(setTestimonials);
  const patchFaqText = updateRowTranslation(setFaqs);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await updateHome({
        banner_image_id: bannerImage?.id ?? null,
        banner_link: bannerLink || null,
        translations,
        slides: slides.map((s) => ({
          image_id: s.image?.id ?? null,
          link: s.link || null,
          translations: s.translations
        })),
        stats: stats.map((s) => ({ value: s.value, translations: s.translations })),
        testimonials: testimonials.map((t) => ({
          name: t.name,
          rating: t.rating,
          image_id: t.image?.id ?? null,
          translations: t.translations
        })),
        faqs
      }).unwrap();
      toast.success("Home səhifəsi yeniləndi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <>
      <PageHeader title="Home page" description="Manage the home page content" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General texts</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageTabs languages={activeLanguages}>
              {(lang) => (
                <>
                  {PAGE_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Input
                        value={getTranslation(translations, lang.code, field.key)}
                        onChange={(e) => handleField(lang.code, field.key, e.target.value)}
                      />
                    </div>
                  ))}
                </>
              )}
            </LanguageTabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hero slides</CardTitle>
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
                    <Label>Link</Label>
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
                        <Label>Description</Label>
                        <Textarea
                          value={getTranslation(slide.translations, lang.code, "description")}
                          onChange={(e) =>
                            patchSlideText(index, lang.code, "description", e.target.value)
                          }
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
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stat {index + 1}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setStats((prev) => prev.filter((_, i) => i !== index))}>
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    required
                    placeholder="300+"
                    value={stat.value}
                    onChange={(e) => patchStat(index, { value: e.target.value })}
                  />
                </div>
                {activeLanguages.map((lang) => (
                  <div key={lang.code} className="grid gap-2 sm:grid-cols-[3rem_1fr]">
                    <span className="text-muted-foreground self-center text-sm font-medium">
                      {lang.code.toUpperCase()}
                    </span>
                    <Input
                      placeholder="Label"
                      value={getTranslation(stat.translations, lang.code, "label")}
                      onChange={(e) => patchStatText(index, lang.code, "label", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setStats((prev) => [...prev, { value: "", translations: {} }])}>
              <PlusIcon />
              Add stat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banner</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <ImageUpload value={bannerImage} onChange={setBannerImage} />
            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                value={bannerLink}
                onChange={(e) => setBannerLink(e.target.value)}
                placeholder="/products"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testimonials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Testimonial {index + 1}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setTestimonials((prev) => prev.filter((_, i) => i !== index))}>
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      required
                      value={testimonial.name}
                      onChange={(e) => patchTestimonial(index, { name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <Select
                      value={String(testimonial.rating)}
                      onValueChange={(v) => patchTestimonial(index, { rating: Number(v) })}>
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
                    <Label>Avatar</Label>
                    <ImageUpload
                      value={testimonial.image}
                      onChange={(image) => patchTestimonial(index, { image })}
                    />
                  </div>
                </div>
                {activeLanguages.map((lang) => (
                  <div key={lang.code} className="grid gap-2 sm:grid-cols-[3rem_1fr]">
                    <span className="text-muted-foreground self-center text-sm font-medium">
                      {lang.code.toUpperCase()}
                    </span>
                    <Textarea
                      placeholder="Comment"
                      value={getTranslation(testimonial.translations, lang.code, "comment")}
                      onChange={(e) =>
                        patchTestimonialText(index, lang.code, "comment", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setTestimonials((prev) => [
                  ...prev,
                  { name: "", rating: 5, image: null, translations: {} }
                ])
              }>
              <PlusIcon />
              Add testimonial
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Question {index + 1}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setFaqs((prev) => prev.filter((_, i) => i !== index))}>
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
                {activeLanguages.map((lang) => (
                  <div key={lang.code} className="grid gap-2 sm:grid-cols-[3rem_1fr_2fr]">
                    <span className="text-muted-foreground self-center text-sm font-medium">
                      {lang.code.toUpperCase()}
                    </span>
                    <Input
                      placeholder="Question"
                      value={getTranslation(faq.translations, lang.code, "question")}
                      onChange={(e) => patchFaqText(index, lang.code, "question", e.target.value)}
                    />
                    <Input
                      placeholder="Answer"
                      value={getTranslation(faq.translations, lang.code, "answer")}
                      onChange={(e) => patchFaqText(index, lang.code, "answer", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setFaqs((prev) => [...prev, { translations: {} }])}>
              <PlusIcon />
              Add question
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
