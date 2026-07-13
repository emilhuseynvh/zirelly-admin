"use client";

import Image from "next/image";
import { useRef } from "react";
import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUploadImageMutation } from "@/lib/api/uploads";
import type { Upload } from "@/lib/api/types";

interface ImageUploadProps {
  value: Upload | null;
  onChange: (upload: Upload | null) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Upload image" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [upload, { isLoading }] = useUploadImageMutation();

  const handleFile = async (file: File) => {
    try {
      const result = await upload(file).unwrap();
      onChange(result.data);
    } catch {
      toast.error("Şəkil yüklənmədi.");
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
        <div className="relative w-fit">
          <Image
            src={value.url}
            alt={value.original_name}
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
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}>
          <ImagePlusIcon />
          {isLoading ? "Uploading..." : label}
        </Button>
      )}
    </div>
  );
}
