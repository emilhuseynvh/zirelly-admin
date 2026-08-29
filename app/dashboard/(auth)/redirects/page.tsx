"use client";

import { useEffect, useState } from "react";
import { PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
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
  useCreateRedirectMutation,
  useDeleteRedirectMutation,
  useGetRedirectsQuery,
  useUpdateRedirectMutation,
  type RedirectRule
} from "@/lib/api/redirects";

export default function RedirectsPage() {
  const { data, isLoading } = useGetRedirectsQuery();
  const [createRedirect, { isLoading: creating }] = useCreateRedirectMutation();
  const [updateRedirect, { isLoading: updating }] = useUpdateRedirectMutation();
  const [deleteRedirect] = useDeleteRedirectMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RedirectRule | null>(null);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [code, setCode] = useState<301 | 302>(301);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setFromPath(editing?.from_path ?? "");
    setToPath(editing?.to_path ?? "");
    setCode(editing?.code ?? 301);
    setIsActive(editing?.is_active ?? true);
  }, [open, editing]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      from_path: fromPath.trim(),
      to_path: toPath.trim(),
      code,
      is_active: isActive
    };

    try {
      if (editing) {
        await updateRedirect({ id: editing.id, ...payload }).unwrap();
        toast.success("Yönləndirmə yeniləndi.");
      } else {
        await createRedirect(payload).unwrap();
        toast.success("Yönləndirmə yaradıldı.");
      }

      setOpen(false);
      setEditing(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Əməliyyat alınmadı.");
    }
  };

  const handleDelete = async (redirect: RedirectRule) => {
    try {
      await deleteRedirect(redirect.id).unwrap();
      toast.success("Yönləndirmə silindi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Silinmə alınmadı.");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Yönləndirmələr"
          description="Köhnə URL-lərdən yenilərinə 301/302 yönləndirmələr"
        />
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}>
          <PlusIcon />
          Yeni yönləndirmə
        </Button>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Köhnə ünvan</TableHead>
                <TableHead>Yeni ünvan</TableHead>
                <TableHead className="w-20">Kod</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                    Yüklənir...
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((redirect) => (
                <TableRow key={redirect.id}>
                  <TableCell className="font-mono text-sm">{redirect.from_path}</TableCell>
                  <TableCell className="font-mono text-sm">{redirect.to_path}</TableCell>
                  <TableCell>
                    <Badge variant={redirect.code === 301 ? "default" : "secondary"}>
                      {redirect.code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {redirect.is_active ? (
                      <Badge variant="outline" className="text-green-600">
                        Aktiv
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Deaktiv</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(redirect);
                          setOpen(true);
                        }}>
                        <PencilIcon />
                      </Button>
                      <ConfirmDelete
                        onConfirm={() => handleDelete(redirect)}
                        title="Yönləndirmə silinsin?"
                        description="Köhnə URL-ə daxil olanlar artıq yönləndirilməyəcək."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                    Hələ yönləndirmə yoxdur.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Yönləndirməni redaktə et" : "Yeni yönləndirmə"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Köhnə ünvan (saytdakı yol)</Label>
              <Input
                required
                value={fromPath}
                onChange={(e) => setFromPath(e.target.value)}
                placeholder="/kohne-sehife"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Yeni ünvan</Label>
              <Input
                required
                value={toPath}
                onChange={(e) => setToPath(e.target.value)}
                placeholder="/yeni-sehife və ya tam URL"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Yönləndirmə kodu</Label>
              <Select value={String(code)} onValueChange={(v) => setCode(Number(v) as 301 | 302)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="301">301 — daimi (SEO dəyəri ötürülür)</SelectItem>
                  <SelectItem value="302">302 — müvəqqəti</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Aktiv</Label>
            </div>

            <Button type="submit" className="w-full" disabled={creating || updating}>
              {creating || updating ? "Yadda saxlanır..." : "Yadda saxla"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
