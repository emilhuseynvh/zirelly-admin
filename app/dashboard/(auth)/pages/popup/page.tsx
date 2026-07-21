"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-header";
import { ImageUpload } from "@/components/admin/image-upload";
import { useGetLanguagesQuery } from "@/lib/api/languages";
import { useGetPopupQuery, useUpdatePopupMutation } from "@/lib/api/pages";
import { getTranslation, setTranslation } from "@/lib/translations";
import type { Translations, Upload } from "@/lib/api/types";

export default function PopupEditor() {
  const { data: languages, isLoading: languagesLoading } = useGetLanguagesQuery();
  const { data, isLoading } = useGetPopupQuery();
  const [updatePopup, { isLoading: saving }] = useUpdatePopupMutation();

  const [translations, setTranslations] = useState<Translations>({});
  const [image, setImage] = useState<Upload | null>(null);
  const [buttonLink, setButtonLink] = useState("");
  const [delaySeconds, setDelaySeconds] = useState("5");
  const [isActive, setIsActive] = useState(false);
  const [showOnce, setShowOnce] = useState(true);

  useEffect(() => {
    if (!data) return;
    const popup = data.data;
    setTranslations(popup.translations ?? {});
    setImage(popup.image);
    setButtonLink(popup.button_link ?? "");
    setDelaySeconds(String(popup.delay_seconds ?? 5));
    setIsActive(popup.is_active);
    setShowOnce(popup.show_once);
  }, [data]);

  const activeLanguages = languages?.data.filter((l) => l.is_active) ?? [];

  const handleField = (code: string, field: string, value: string) => {
    setTranslations((prev) => setTranslation(prev, code, field, value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await updatePopup({
        image_id: image?.id ?? null,
        button_link: buttonLink || null,
        delay_seconds: Number(delaySeconds) || 0,
        is_active: isActive,
        show_once: showOnce,
        translations
      }).unwrap();
      toast.success("Popup yeniləndi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <>
      <PageHeader title="Popup" description="Newsletter popup shown on the website" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>Title, description and button label per language.</CardDescription>
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
                      <Textarea
                        value={getTranslation(translations, lang.code, "title")}
                        onChange={(e) => handleField(lang.code, "title", e.target.value)}
                        placeholder="GET 15% OFF YOUR FIRST ORDER"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={getTranslation(translations, lang.code, "description")}
                        onChange={(e) => handleField(lang.code, "description", e.target.value)}
                        placeholder="Sign up to our newsletter to get 15% off your first order..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button text</Label>
                      <Input
                        value={getTranslation(translations, lang.code, "button_text")}
                        onChange={(e) => handleField(lang.code, "button_text", e.target.value)}
                        placeholder="Get My 15% Off"
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
            <CardTitle>Image</CardTitle>
            <CardDescription>Shown on the right side (top on mobile).</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload value={image} onChange={setImage} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Behaviour</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Button link</Label>
                <Input
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  placeholder="/products"
                />
              </div>
              <div className="space-y-2">
                <Label>Delay (seconds)</Label>
                <Input
                  type="number"
                  min="0"
                  max="600"
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(e.target.value)}
                />
                <p className="text-muted-foreground text-xs">
                  How long the visitor stays on the site before the popup appears.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Active</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={showOnce} onCheckedChange={setShowOnce} />
              <Label>Show only once per visitor</Label>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </>
  );
}
