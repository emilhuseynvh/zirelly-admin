import { api } from "./base";
import type { Paginated, Promocode } from "./types";

export interface PromocodePayload {
  code: string;
  type: "first_order" | "single_use" | "unlimited";
  discount_type: "percent" | "fixed";
  discount_value: number;
  starts_at: string;
  ends_at: string;
  is_active?: boolean;
}

export const promocodesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPromocodes: build.query<Paginated<Promocode>, { page?: number }>({
      query: ({ page = 1 }) => `promocodes?page=${page}`,
      providesTags: ["Promocode"]
    }),
    createPromocode: build.mutation<{ data: Promocode }, PromocodePayload>({
      query: (body) => ({ url: "promocodes", method: "POST", body }),
      invalidatesTags: ["Promocode"]
    }),
    updatePromocode: build.mutation<{ data: Promocode }, { id: number; body: Partial<PromocodePayload> }>({
      query: ({ id, body }) => ({ url: `promocodes/${id}`, method: "PUT", body }),
      invalidatesTags: ["Promocode"]
    }),
    deletePromocode: build.mutation<void, number>({
      query: (id) => ({ url: `promocodes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Promocode"]
    })
  })
});

export const {
  useGetPromocodesQuery,
  useCreatePromocodeMutation,
  useUpdatePromocodeMutation,
  useDeletePromocodeMutation
} = promocodesApi;
