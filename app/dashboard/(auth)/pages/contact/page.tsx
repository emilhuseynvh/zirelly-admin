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
import { useGetLanguagesQuery } from "@/lib/api/languages";
import { useGetContactQuery, useUpdateContactMutation } from "@/lib/api/contact";
import { getTranslation, setTranslation } from "@/lib/translations";
import type { Translations } from "@/lib/api/types";

export default function ContactPageEditor() {
  const { data: languages, isLoading: languagesLoading } = useGetLanguagesQuery();
  const { data, isLoading } = useGetContactQuery();
  const [updateContact, { isLoading: saving }] = useUpdateContactMutation();

  const [translations, setTranslations] = useState<Translations>({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mapEmbedUrl, setMapEmbedUrl] = useState("");

  useEffect(() => {
    if (!data) return;
    setTranslations(data.data.translations ?? {});
    setEmail(data.data.email ?? "");
    setPhone(data.data.phone ?? "");
    setMapEmbedUrl(data.data.map_embed_url ?? "");
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
        map_embed_url: mapEmbedUrl || null,
        translations
      }).unwrap();
      toast.success("Contact səhifəsi yeniləndi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <>
      <PageHeader title="Contact page" description="Manage the contact page content" />

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
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact details</CardTitle>
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
            </div>
            <div className="space-y-2">
              <Label>Map embed URL</Label>
              <Textarea
                value={mapEmbedUrl}
                onChange={(e) => setMapEmbedUrl(e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </div>
            {mapEmbedUrl && (
              <iframe
                src={mapEmbedUrl}
                className="h-64 w-full rounded-md border"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
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
