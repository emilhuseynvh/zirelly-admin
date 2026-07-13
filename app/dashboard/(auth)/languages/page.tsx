"use client";

import { useState } from "react";
import { PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import {
  useCreateLanguageMutation,
  useDeleteLanguageMutation,
  useGetLanguagesQuery,
  useUpdateLanguageMutation
} from "@/lib/api/languages";
import type { Language } from "@/lib/api/types";

interface FormState {
  code: string;
  name: string;
  native_name: string;
  is_default: boolean;
  is_active: boolean;
}

const emptyForm: FormState = {
  code: "",
  name: "",
  native_name: "",
  is_default: false,
  is_active: true
};

export default function LanguagesPage() {
  const { data, isLoading } = useGetLanguagesQuery();
  const [createLanguage, { isLoading: creating }] = useCreateLanguageMutation();
  const [updateLanguage, { isLoading: updating }] = useUpdateLanguageMutation();
  const [deleteLanguage] = useDeleteLanguageMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Language | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const saving = creating || updating;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (language: Language) => {
    setEditing(language);
    setForm({
      code: language.code,
      name: language.name,
      native_name: language.native_name ?? "",
      is_default: language.is_default,
      is_active: language.is_active
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const body = { ...form, native_name: form.native_name || null };

    try {
      if (editing) {
        await updateLanguage({ id: editing.id, body }).unwrap();
        toast.success("Dil yeniləndi.");
      } else {
        await createLanguage(body).unwrap();
        toast.success("Dil əlavə olundu.");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xəta baş verdi.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteLanguage(id).unwrap();
      toast.success("Dil silindi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Silinmə alınmadı.");
    }
  };

  return (
    <>
      <PageHeader title="Languages" description="Manage site languages">
        <Button onClick={openCreate}>
          <PlusIcon />
          New language
        </Button>
      </PageHeader>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Native name</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((language) => (
                <TableRow key={language.id}>
                  <TableCell className="font-medium uppercase">{language.code}</TableCell>
                  <TableCell>{language.name}</TableCell>
                  <TableCell>{language.native_name}</TableCell>
                  <TableCell>
                    {language.is_default && <Badge>Default</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={language.is_active ? "default" : "secondary"}>
                      {language.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(language)}>
                      <PencilIcon className="size-4" />
                    </Button>
                    {!language.is_default && (
                      <ConfirmDelete
                        description="All translations in this language will be deleted."
                        onConfirm={() => handleDelete(language.id)}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit language" : "New language"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                required
                maxLength={10}
                placeholder="en"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                required
                placeholder="English"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Native name</Label>
              <Input
                placeholder="English"
                value={form.native_name}
                onChange={(e) => setForm({ ...form, native_name: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_default}
                onCheckedChange={(v) => setForm({ ...form, is_default: v })}
              />
              <Label>Default language</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Active</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
