"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TiptapEditor from "@/components/editor";
import { useGetLanguagesQuery } from "@/lib/api/languages";
import { useCreateBlogMutation, useUpdateBlogMutation } from "@/lib/api/blogs";
import { getTranslation, setTranslation } from "@/lib/translations";
import type { Blog, Translations } from "@/lib/api/types";

const FIELDS = [
  { key: "title", label: "Title" },
  { key: "meta_title", label: "Meta title" },
  { key: "meta_description", label: "Meta description" }
];

export function BlogForm({ blog }: { blog?: Blog }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: languages, isLoading: languagesLoading } = useGetLanguagesQuery();
  const [createBlog, { isLoading: creating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: updating }] = useUpdateBlogMutation();

  const [slug, setSlug] = useState(blog?.slug ?? "");
  const [isPublished, setIsPublished] = useState(blog?.is_published ?? false);
  const [translations, setTranslations] = useState<Translations>(blog?.translations ?? {});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(blog?.image ?? null);

  const saving = creating || updating;
  const activeLanguages = languages?.data.filter((l) => l.is_active) ?? [];

  const handleField = (code: string, field: string, value: string) => {
    setTranslations((prev) => setTranslation(prev, code, field, value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const body = new FormData();
    if (slug) body.append("slug", slug);
    body.append("is_published", isPublished ? "1" : "0");
    if (imageFile) body.append("image", imageFile);

    for (const [code, fields] of Object.entries(translations)) {
      for (const [field, value] of Object.entries(fields)) {
        if (value != null) body.append(`translations[${code}][${field}]`, value);
      }
    }

    try {
      if (blog) {
        body.append("_method", "PUT");
        await updateBlog({ id: blog.id, body }).unwrap();
        toast.success("Blog yeniləndi.");
      } else {
        await createBlog(body).unwrap();
        toast.success("Blog yaradıldı.");
      }
      router.push("/dashboard/blogs");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  return (
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
                  {FIELDS.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Input
                        value={getTranslation(translations, lang.code, field.key)}
                        onChange={(e) => handleField(lang.code, field.key, e.target.value)}
                      />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label>Content</Label>
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

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Auto-generated from title"
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
                e.target.value = "";
              }}
            />
            {imagePreview ? (
              <div className="relative w-fit">
                <Image
                  src={imagePreview}
                  alt="Blog image"
                  width={160}
                  height={120}
                  unoptimized
                  className="h-28 w-40 rounded-md border object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 size-6"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}>
                  <Trash2Icon className="size-3" />
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                <ImagePlusIcon />
                Upload image
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <Label>Published</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : blog ? "Update blog" : "Create blog"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
