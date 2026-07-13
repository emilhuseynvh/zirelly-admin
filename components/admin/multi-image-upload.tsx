"use client";

import Image from "next/image";
import { useRef } from "react";
import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUploadImageMutation } from "@/lib/api/uploads";
import type { Upload } from "@/lib/api/types";

interface MultiImageUploadProps {
  value: Upload[];
  onChange: (uploads: Upload[]) => void;
}

export function MultiImageUpload({ value, onChange }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [upload, { isLoading }] = useUploadImageMutation();

  const handleFiles = async (files: FileList) => {
    for (const file of Array.from(files)) {
      try {
        const result = await upload(file).unwrap();
        value = [...value, result.data];
        onChange(value);
      } catch {
        toast.error(`${file.name} yüklənmədi.`);
      }
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap gap-3">
        {value.map((image) => (
          <div key={image.id} className="relative">
            <Image
              src={image.url}
              alt={image.original_name}
              width={120}
              height={90}
              unoptimized
              className="h-20 w-28 rounded-md border object-cover"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 size-6"
              onClick={() => onChange(value.filter((i) => i.id !== image.id))}>
              <Trash2Icon className="size-3" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={() => inputRef.current?.click()}>
        <ImagePlusIcon />
        {isLoading ? "Uploading..." : "Add images"}
      </Button>
    </div>
  );
}
