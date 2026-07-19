"use client";

import { useState } from "react";
import { MailOpenIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

const SUBJECT_LABELS: Record<string, string> = {
  general: "General question",
  order: "Order",
  product: "Product",
  other: "Other"
};

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [subject, setSubject] = useState("all");
  const { data, isLoading } = useGetContactMessagesQuery({
    page,
    unread: unreadOnly,
    subject: subject === "all" ? undefined : subject
  });
  const [markRead] = useMarkMessageReadMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const handleMarkRead = async (id: number) => {
    try {
      await markRead(id).unwrap();
    } catch {
      toast.error("Əməliyyat alınmadı.");
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
      <PageHeader title="Messages" description="Contact form submissions">
        <div className="flex items-center gap-4">
          <Select
            value={subject}
            onValueChange={(value) => {
              setSubject(value);
              setPage(1);
            }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch checked={unreadOnly} onCheckedChange={setUnreadOnly} />
            <Label>Unread only</Label>
          </div>
        </div>
      </PageHeader>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="max-w-md">Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((message) => (
                <TableRow key={message.id} className={message.is_read ? "" : "bg-muted/40"}>
                  <TableCell>
                    <Badge variant={message.is_read ? "secondary" : "default"}>
                      {message.is_read ? "Read" : "New"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{message.name}</TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell>{message.phone}</TableCell>
                  <TableCell>
                    {message.subject ? (
                      <Badge variant="outline">
                        {SUBJECT_LABELS[message.subject] ?? message.subject}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="max-w-md whitespace-normal">{message.message}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(message.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {!message.is_read && (
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Mark as read"
                        onClick={() => handleMarkRead(message.id)}>
                        <MailOpenIcon className="size-4" />
                      </Button>
                    )}
                    <ConfirmDelete onConfirm={() => handleDelete(message.id)} />
                  </TableCell>
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground h-24 text-center">
                    No messages.
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
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                {data.meta.current_page} / {data.meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.meta.last_page}
                onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
