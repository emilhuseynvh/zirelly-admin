import { api } from "./base";
import type { Paginated, Product, Translations } from "./types";

export interface ProductPayload {
  slug?: string;
  price: number;
  discount?: number | null;
  discount_type?: "percent" | "fixed" | null;
  is_active?: boolean;
  image_ids?: number[];
  translations?: Translations;
  features?: { translations: Translations }[];
}

export const productsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<Paginated<Product>, { page?: number }>({
      query: ({ page = 1 }) => `products?page=${page}`,
      providesTags: ["Product"]
    }),
    getProduct: build.query<{ data: Product }, number>({
      query: (id) => `products/${id}?with_translations=1`,
      providesTags: (_r, _e, id) => [{ type: "Product", id }]
    }),
    createProduct: build.mutation<{ data: Product }, ProductPayload>({
      query: (body) => ({ url: "products", method: "POST", body }),
      invalidatesTags: ["Product"]
    }),
    updateProduct: build.mutation<{ data: Product }, { id: number; body: Partial<ProductPayload> }>({
      query: ({ id, body }) => ({ url: `products/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => ["Product", { type: "Product", id }]
    }),
    deleteProduct: build.mutation<void, number>({
      query: (id) => ({ url: `products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product"]
    })
  })
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} = productsApi;
