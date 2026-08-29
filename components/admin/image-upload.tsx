"use client";

import Image from "next/image";
import { useRef } from "react";
import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateUploadAltMutation, useUploadImageMutation } from "@/lib/api/uploads";
import type { Upload } from "@/lib/api/types";

interface ImageUploadProps {
  value: Upload | null;
  onChange: (upload: Upload | null) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Şəkil yüklə" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [upload, { isLoading }] = useUploadImageMutation();
  const [updateAlt] = useUpdateUploadAltMutation();

  const handleFile = async (file: File) => {
    try {
      const result = await upload(file).unwrap();
      onChange(result.data);
    } catch {
      toast.error("Şəkil yüklənmədi.");
    }
  };

  const handleAltBlur = async (alt: string) => {
    if (!value || (value.alt ?? "") === alt) return;

    try {
      const result = await updateAlt({ id: value.id, alt: alt || null }).unwrap();
      onChange(result.data);
    } catch {
      toast.error("Alt mətn yadda saxlanmadı.");
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="w-fit space-y-2">
          <div className="relative w-fit">
            <Image
              src={value.url}
              alt={value.alt ?? value.original_name}
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
              onClick={() => onChange(null)}>
              <Trash2Icon className="size-3" />
            </Button>
          </div>
          <Input
            className="w-40"
            defaultValue={value.alt ?? ""}
            key={value.id}
            placeholder="Alt mətn (SEO)"
            onBlur={(e) => handleAltBlur(e.target.value.trim())}
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}>
          <ImagePlusIcon />
          {isLoading ? "Yüklənir..." : label}
        </Button>
      )}
    </div>
  );
}
