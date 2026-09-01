"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/image-upload";
import { getTranslation } from "@/lib/translations";
import type { Language, Translations, Upload } from "@/lib/api/types";

interface OgFieldsCardProps {
  languages: Language[];
  translations: Translations;
  onField: (code: string, field: string, value: string) => void;
  image: Upload | null;
  onImageChange: (upload: Upload | null) => void;
}

export function OgFieldsCard({
  languages,
  translations,
  onField,
  image,
  onImageChange
}: OgFieldsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Graph (sosial paylaşım)</CardTitle>
        <p className="text-muted-foreground text-sm">
          Səhifə sosial şəbəkələrdə (Facebook, WhatsApp və s.) paylaşılanda görünən başlıq,
          təsvir və şəkil. Boş qalarsa meta title/description istifadə olunur.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {languages.length > 0 && (
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
                <div className="space-y-2">
                  <Label>OG title</Label>
                  <Input
                    value={getTranslation(translations, lang.code, "og_title")}
                    onChange={(e) => onField(lang.code, "og_title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>OG description</Label>
                  <Textarea
                    value={getTranslation(translations, lang.code, "og_description")}
                    onChange={(e) => onField(lang.code, "og_description", e.target.value)}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
        <div className="space-y-2">
          <Label>OG şəkil</Label>
          <p className="text-muted-foreground text-xs">Tövsiyə olunan ölçü: 1200×630 px</p>
          <ImageUpload value={image} onChange={onImageChange} />
        </div>
      </CardContent>
    </Card>
  );
}
