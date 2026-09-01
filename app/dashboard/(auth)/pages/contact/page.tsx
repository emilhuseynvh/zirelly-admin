"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-header";
import { OgFieldsCard } from "@/components/admin/og-fields-card";
import { useGetLanguagesQuery } from "@/lib/api/languages";
import { useGetContactQuery, useUpdateContactMutation } from "@/lib/api/contact";
import { getTranslation, setTranslation } from "@/lib/translations";
import type { Translations, Upload } from "@/lib/api/types";

export default function ContactPageEditor() {
  const { data: languages, isLoading: languagesLoading } = useGetLanguagesQuery();
  const { data, isLoading } = useGetContactQuery();
  const [updateContact, { isLoading: saving }] = useUpdateContactMutation();

  const [translations, setTranslations] = useState<Translations>({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [ogImage, setOgImage] = useState<Upload | null>(null);

  useEffect(() => {
    if (!data) return;
    setTranslations(data.data.translations ?? {});
    setEmail(data.data.email ?? "");
    setPhone(data.data.phone ?? "");
    setWhatsappNumber(data.data.whatsapp_number ?? "");
    setFacebookUrl(data.data.facebook_url ?? "");
    setInstagramUrl(data.data.instagram_url ?? "");
    setTiktokUrl(data.data.tiktok_url ?? "");
    setLinkedinUrl(data.data.linkedin_url ?? "");
    setOgImage(data.data.og_image ?? null);
  }, [data]);

  const activeLanguages = languages?.data.filter((l) => l.is_active) ?? [];

  const handleField = (code: string, field: string, value: string) => {
    setTranslations((prev) => setTranslation(prev, code, field, value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await updateContact({
        email: email || null,
        phone: phone || null,
        whatsapp_number: whatsappNumber || null,
        facebook_url: facebookUrl || null,
        instagram_url: instagramUrl || null,
        tiktok_url: tiktokUrl || null,
        linkedin_url: linkedinUrl || null,
        og_image_id: ogImage?.id ?? null,
        translations
      }).unwrap();
      toast.success("Əlaqə səhifəsi yeniləndi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Yüklənir...</p>;

  return (
    <>
      <PageHeader title="Əlaqə" description="Əlaqə səhifəsinin məzmununu idarə et" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Məzmun</CardTitle>
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
                      <Label>Title</Label>
                      <Input
                        value={getTranslation(translations, lang.code, "title")}
                        onChange={(e) => handleField(lang.code, "title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Textarea
                        value={getTranslation(translations, lang.code, "subtitle")}
                        onChange={(e) => handleField(lang.code, "subtitle", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Footer mətni</Label>
                      <Textarea
                        value={getTranslation(translations, lang.code, "footer_description")}
                        onChange={(e) =>
                          handleField(lang.code, "footer_description", e.target.value)
                        }
                        placeholder="Footer-də loqonun altında görünən qısa mətn"
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
            <CardTitle>Əlaqə məlumatları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@zirelly.az"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+994 55 730 00 36"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp nömrəsi</Label>
                <Input
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+994 55 730 00 36"
                />
                <p className="text-muted-foreground text-xs">
                  Saytdakı üzən WhatsApp düyməsi bu nömrəyə yönləndirir. Boş olarsa düymə
                  görünmür.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sosial şəbəkələr (footer)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Facebook</Label>
              <Input
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/zirelly"
              />
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/zirelly"
              />
            </div>
            <div className="space-y-2">
              <Label>TikTok</Label>
              <Input
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://tiktok.com/@zirelly"
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/company/zirelly"
              />
            </div>
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
