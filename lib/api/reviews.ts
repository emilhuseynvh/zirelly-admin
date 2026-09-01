import { api } from "./base";
import type { Paginated, ProductReview } from "./types";

export interface ReviewUpdatePayload {
  rating?: number;
  comment?: string | null;
  status?: "pending" | "approved" | "rejected";
}

export const reviewsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getReviews: build.query<
      Paginated<ProductReview>,
      { page?: number; status?: "pending" | "approved" | "rejected" | ""; productId?: number }
    >({
      query: ({ page = 1, status, productId }) =>
        `admin/reviews?page=${page}${status ? `&status=${status}` : ""}${
          productId ? `&product_id=${productId}` : ""
        }`,
      providesTags: ["Review"]
    }),
    updateReview: build.mutation<{ data: ProductReview }, { id: number; body: ReviewUpdatePayload }>({
      query: ({ id, body }) => ({ url: `admin/reviews/${id}`, method: "PUT", body }),
      invalidatesTags: ["Review"]
    }),
    deleteReview: build.mutation<void, number>({
      query: (id) => ({ url: `admin/reviews/${id}`, method: "DELETE" }),
      invalidatesTags: ["Review"]
    })
  })
});

export const { useGetReviewsQuery, useUpdateReviewMutation, useDeleteReviewMutation } = reviewsApi;
