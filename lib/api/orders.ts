import { api } from "./base";
import type { Order, OrderStats, OrderStatus, Paginated } from "./types";

export interface OrdersFilter {
  page?: number;
  per_page?: number;
  status?: OrderStatus | "";
  search?: string;
  from?: string;
  to?: string;
  min_total?: string;
  max_total?: string;
  promocode?: string;
  sort?: "id" | "total" | "created_at" | "paid_at";
  dir?: "asc" | "desc";
}

export function buildOrdersParams(filter: OrdersFilter): URLSearchParams {
  const params = new URLSearchParams();
  if (filter.page) params.set("page", String(filter.page));
  if (filter.per_page) params.set("per_page", String(filter.per_page));
  if (filter.status) params.set("status", filter.status);
  if (filter.search) params.set("search", filter.search);
  if (filter.from) params.set("from", filter.from);
  if (filter.to) params.set("to", filter.to);
  if (filter.min_total) params.set("min_total", filter.min_total);
  if (filter.max_total) params.set("max_total", filter.max_total);
  if (filter.promocode) params.set("promocode", filter.promocode);
  if (filter.sort) params.set("sort", filter.sort);
  if (filter.dir) params.set("dir", filter.dir);
  return params;
}

export const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<Paginated<Order>, OrdersFilter>({
      query: (filter) => `admin/orders?${buildOrdersParams(filter).toString()}`,
      providesTags: ["Order"]
    }),
    getOrder: build.query<{ data: Order }, number>({
      query: (id) => `admin/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Order", id }]
    }),
    updateOrderStatus: build.mutation<{ data: Order }, { id: number; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `admin/orders/${id}/status`,
        method: "PUT",
        body: { status }
      }),
      invalidatesTags: (_r, _e, { id }) => ["Order", "OrderStats", { type: "Order", id }]
    }),
    getOrderStats: build.query<{ data: OrderStats }, { days?: number }>({
      query: ({ days = 30 }) => `admin/orders/stats?days=${days}`,
      providesTags: ["OrderStats"]
    })
  })
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useGetOrderStatsQuery
} = ordersApi;
