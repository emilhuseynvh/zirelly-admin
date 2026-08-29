"use client";

import { useState } from "react";
import { EyeIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
  useDeleteMessageMutation,
  useGetContactMessagesQuery,
  useMarkMessageReadMutation
} from "@/lib/api/contact";
import type { ContactMessage } from "@/lib/api/types";

const SUBJECT_LABELS: Record<string, string> = {
  general: "Ümumi sual",
  order: "Sifariş",
  product: "Məhsul",
  other: "Digər"
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"read" | "unread" | "">("");
  const [subject, setSubject] = useState("all");
  const [viewing, setViewing] = useState<ContactMessage | null>(null);

  const { data, isLoading } = useGetContactMessagesQuery({
    page,
    status,
    subject: subject === "all" ? undefined : subject
  });
  const [markRead] = useMarkMessageReadMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const handleToggleRead = async (message: ContactMessage, isRead: boolean) => {
    try {
      await markRead({ id: message.id, is_read: isRead }).unwrap();
    } catch {
      toast.error("Əməliyyat alınmadı.");
    }
  };

  const handleView = (message: ContactMessage) => {
    setViewing(message);

    if (!message.is_read) {
      markRead({ id: message.id, is_read: true }).catch(() => null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMessage(id).unwrap();
      toast.success("Mesaj silindi.");
    } catch {
      toast.error("Silinmə alınmadı.");
    }
  };

  return (
    <>
      <PageHeader title="Mesajlar" description="Əlaqə formasından gələn mesajlar">
        <div className="flex items-center gap-3">
          <Select
            value={subject}
            onValueChange={(value) => {
              setSubject(value);
              setPage(1);
            }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Mövzu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün mövzular</SelectItem>
              {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status || "all"}
            onValueChange={(value) => {
              setStatus(value === "all" ? "" : (value as "read" | "unread"));
              setPage(1);
            }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hamısı</SelectItem>
              <SelectItem value="unread">Oxunmamışlar</SelectItem>
              <SelectItem value="read">Oxunmuşlar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Oxundu</TableHead>
                <TableHead>Ad</TableHead>
                <TableHead>E-poçt</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Mövzu</TableHead>
                <TableHead className="max-w-md">Mesaj</TableHead>
                <TableHead>Tarix</TableHead>
                <TableHead className="w-24 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground h-24 text-center">
                    Yüklənir...
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((message) => (
                <TableRow key={message.id} className={message.is_read ? "" : "bg-muted/40"}>
                  <TableCell>
                    <Checkbox
                      checked={message.is_read}
                      onCheckedChange={(checked) =>
                        handleToggleRead(message, checked === true)
                      }
                      aria-label="Oxunma statusu"
                    />
                  </TableCell>
                  <TableCell className={message.is_read ? "" : "font-semibold"}>
                    {message.name}
                  </TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell>{message.phone ?? "—"}</TableCell>
                  <TableCell>
                    {message.subject ? (
                      <Badge variant="outline">
                        {SUBJECT_LABELS[message.subject] ?? message.subject}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <span className="block truncate">{message.message}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(message.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Mesaja bax"
                        onClick={() => handleView(message)}>
                        <EyeIcon className="size-4" />
                      </Button>
                      <ConfirmDelete onConfirm={() => handleDelete(message.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground h-24 text-center">
                    Mesaj tapılmadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {data && data.meta.last_page > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}>
                Əvvəlki
              </Button>
              <span className="text-muted-foreground text-sm">
                {data.meta.current_page} / {data.meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.meta.last_page}
                onClick={() => setPage(page + 1)}>
                Növbəti
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewing !== null} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
          </DialogHeader>

          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="text-muted-foreground grid grid-cols-[6rem_1fr] gap-y-1">
                <span>E-poçt:</span>
                <span className="text-foreground">{viewing.email}</span>
                <span>Telefon:</span>
                <span className="text-foreground">{viewing.phone ?? "—"}</span>
                <span>Mövzu:</span>
                <span className="text-foreground">
                  {viewing.subject
                    ? (SUBJECT_LABELS[viewing.subject] ?? viewing.subject)
                    : "—"}
                </span>
                <span>Tarix:</span>
                <span className="text-foreground">{formatDate(viewing.created_at)}</span>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-md border p-3">
                <p className="whitespace-pre-wrap">{viewing.message}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
