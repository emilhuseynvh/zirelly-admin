"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import TiptapEditor from "@/components/editor";
import { MultiImageUpload } from "@/components/admin/multi-image-upload";
import { useGetLanguagesQuery } from "@/lib/api/languages";
import { useCreateProductMutation, useUpdateProductMutation } from "@/lib/api/products";
import { getTranslation, setTranslation } from "@/lib/translations";
import type { Product, Translations, Upload } from "@/lib/api/types";

interface FeatureRow {
  translations: Translations;
}

interface HowToUseRow {
  translations: Translations;
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const { data: languages, isLoading: languagesLoading } = useGetLanguagesQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const [slug, setSlug] = useState(product?.slug ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [discount, setDiscount] = useState(product?.discount != null ? String(product.discount) : "");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(
    product?.discount_type ?? "percent"
  );
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [images, setImages] = useState<Upload[]>(product?.images ?? []);
  const [translations, setTranslations] = useState<Translations>(product?.translations ?? {});
  const [features, setFeatures] = useState<FeatureRow[]>(
    product?.features.map((f) => ({ translations: f.translations ?? {} })) ?? []
  );
  const [howToUse, setHowToUse] = useState<HowToUseRow[]>(
    product?.how_to_use?.map((s) => ({ translations: s.translations ?? {} })) ?? []
  );

  const saving = creating || updating;
  const activeLanguages = languages?.data.filter((l) => l.is_active) ?? [];

  const handleField = (code: string, field: string, value: string) => {
    setTranslations((prev) => setTranslation(prev, code, field, value));
  };

  const handleFeatureField = (index: number, code: string, field: string, value: string) => {
    setFeatures((prev) =>
      prev.map((feature, i) =>
        i === index
          ? { translations: setTranslation(feature.translations, code, field, value) }
          : feature
      )
    );
  };

  const handleHowToUseField = (index: number, code: string, field: string, value: string) => {
    setHowToUse((prev) =>
      prev.map((step, i) =>
        i === index
          ? { translations: setTranslation(step.translations, code, field, value) }
          : step
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const body = {
      slug: slug || undefined,
      price: Number(price),
      discount: discount === "" ? null : Number(discount),
      discount_type: discount === "" ? null : discountType,
      is_active: isActive,
      image_ids: images.map((i) => i.id),
      translations,
      features,
      how_to_use: howToUse
    };

    try {
      if (product) {
        await updateProduct({ id: product.id, body }).unwrap();
        toast.success("Məhsul yeniləndi.");
      } else {
        await createProduct(body).unwrap();
        toast.success("Məhsul yaradıldı.");
      }
      router.push("/dashboard/products");
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
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={getTranslation(translations, lang.code, "title")}
                      onChange={(e) => handleField(lang.code, "title", e.target.value)}
                    />
                  </div>
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
                    <Label>Description</Label>
                    <TiptapEditor
                      value={getTranslation(translations, lang.code, "description")}
                      onChange={(val) => handleField(lang.code, "description", val)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pro tip</Label>
                    <Textarea
                      value={getTranslation(translations, lang.code, "pro_tip")}
                      onChange={(e) => handleField(lang.code, "pro_tip", e.target.value)}
                      placeholder="Shown in the brown bar under the How to use section"
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
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Discount</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="No discount"
            />
          </div>
          <div className="space-y-2">
            <Label>Discount type</Label>
            <Select
              value={discountType}
              onValueChange={(v) => setDiscountType(v as "percent" | "fixed")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent (%)</SelectItem>
                <SelectItem value="fixed">Fixed (₼)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiImageUpload value={images} onChange={setImages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Feature {index + 1}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setFeatures((prev) => prev.filter((_, i) => i !== index))}>
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
              <div className="grid gap-3">
                {activeLanguages.map((lang) => (
                  <div key={lang.code} className="grid gap-2 sm:grid-cols-[3rem_1fr_1fr]">
                    <span className="text-muted-foreground self-center text-sm font-medium">
                      {lang.code.toUpperCase()}
                    </span>
                    <Input
                      placeholder="Name"
                      value={getTranslation(feature.translations, lang.code, "name")}
                      onChange={(e) => handleFeatureField(index, lang.code, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Value"
                      value={getTranslation(feature.translations, lang.code, "value")}
                      onChange={(e) =>
                        handleFeatureField(index, lang.code, "value", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setFeatures((prev) => [...prev, { translations: {} }])}>
            <PlusIcon />
            Add feature
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {howToUse.map((step, index) => (
            <div key={index} className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Step {String(index + 1).padStart(2, "0")}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setHowToUse((prev) => prev.filter((_, i) => i !== index))}>
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
              <div className="grid gap-3">
                {activeLanguages.map((lang) => (
                  <div key={lang.code} className="grid gap-2 sm:grid-cols-[3rem_1fr_2fr]">
                    <span className="text-muted-foreground self-center text-sm font-medium">
                      {lang.code.toUpperCase()}
                    </span>
                    <Input
                      placeholder="Title"
                      value={getTranslation(step.translations, lang.code, "title")}
                      onChange={(e) =>
                        handleHowToUseField(index, lang.code, "title", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Description"
                      value={getTranslation(step.translations, lang.code, "description")}
                      onChange={(e) =>
                        handleHowToUseField(index, lang.code, "description", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setHowToUse((prev) => [...prev, { translations: {} }])}>
            <PlusIcon />
            Add step
          </Button>
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
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>Active</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : product ? "Update product" : "Create product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
