"use client";

import { useState } from "react";
import { CheckIcon, PencilIcon, StarIcon, XIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import {
  useDeleteReviewMutation,
  useGetReviewsQuery,
  useUpdateReviewMutation
} from "@/lib/api/reviews";
import type { ProductReview } from "@/lib/api/types";

type ReviewStatus = "pending" | "approved" | "rejected";

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Təsdiq gözləyir",
  approved: "Təsdiqlənib",
  rejected: "Rədd edilib"
};

const STATUS_VARIANTS: Record<ReviewStatus, "outline" | "default" | "destructive"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive"
};

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("az-AZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ReviewStatus | "">("");
  const [editing, setEditing] = useState<ProductReview | null>(null);
  const [editRating, setEditRating] = useState("5");
  const [editComment, setEditComment] = useState("");

  const { data, isLoading } = useGetReviewsQuery({ page, status });
  const [updateReview, { isLoading: saving }] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const handleStatus = async (review: ProductReview, next: ReviewStatus) => {
    try {
      await updateReview({ id: review.id, body: { status: next } }).unwrap();
      toast.success(next === "approved" ? "Rəy təsdiqləndi." : "Rəy rədd edildi.");
    } catch {
      toast.error("Əməliyyat alınmadı.");
    }
  };

  const openEdit = (review: ProductReview) => {
    setEditing(review);
    setEditRating(String(review.rating));
    setEditComment(review.comment ?? "");
  };

  const handleEditSave = async () => {
    if (!editing) return;

    try {
      await updateReview({
        id: editing.id,
        body: { rating: Number(editRating), comment: editComment || null }
      }).unwrap();
      toast.success("Rəy yeniləndi.");
      setEditing(null);
    } catch {
      toast.error("Yadda saxlanmadı.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteReview(id).unwrap();
      toast.success("Rəy silindi.");
    } catch {
      toast.error("Silinmə alınmadı.");
    }
  };

  return (
    <>
      <PageHeader title="Rəylər" description="Məhsul rəylərinin moderasiyası">
        <Select
          value={status || "all"}
          onValueChange={(value) => {
            setStatus(value === "all" ? "" : (value as ReviewStatus));
            setPage(1);
          }}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bütün statuslar</SelectItem>
            <SelectItem value="pending">Təsdiq gözləyənlər</SelectItem>
            <SelectItem value="approved">Təsdiqlənmişlər</SelectItem>
            <SelectItem value="rejected">Rədd edilmişlər</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Məhsul</TableHead>
                <TableHead>İstifadəçi</TableHead>
                <TableHead className="w-24">Reytinq</TableHead>
                <TableHead className="max-w-md">Rəy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tarix</TableHead>
                <TableHead className="w-40 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                    Yüklənir...
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((review) => (
                <TableRow
                  key={review.id}
                  className={review.status === "pending" ? "bg-muted/40" : ""}>
                  <TableCell>{review.product?.title ?? "—"}</TableCell>
                  <TableCell>
                    {review.user
                      ? `${review.user.name} ${review.user.surname ?? ""}`.trim()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <StarIcon className="size-4 fill-amber-400 text-amber-400" />
                      {review.rating}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <span className="block truncate">{review.comment ?? "—"}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[review.status]}>
                      {STATUS_LABELS[review.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(review.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      {review.status !== "approved" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Təsdiqlə"
                          onClick={() => handleStatus(review, "approved")}>
                          <CheckIcon className="size-4 text-green-600" />
                        </Button>
                      )}
                      {review.status !== "rejected" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Rədd et"
                          onClick={() => handleStatus(review, "rejected")}>
                          <XIcon className="size-4 text-red-600" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Redaktə et"
                        onClick={() => openEdit(review)}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <ConfirmDelete onConfirm={() => handleDelete(review.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                    Rəy tapılmadı.
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

      <Dialog open={editing !== null} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Rəyi redaktə et</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reytinq</Label>
              <Select value={editRating} onValueChange={setEditRating}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} ulduz
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rəy mətni</Label>
              <Textarea
                rows={5}
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              İmtina
            </Button>
            <Button onClick={handleEditSave} disabled={saving}>
              {saving ? "Yadda saxlanır..." : "Yadda saxla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
