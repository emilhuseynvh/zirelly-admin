import { api } from "./base";
import type { Order, OrderStats, OrderStatus, Paginated } from "./types";

export interface OrdersFilter {
  page?: number;
  status?: OrderStatus | "";
  search?: string;
  from?: string;
  to?: string;
}

export const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<Paginated<Order>, OrdersFilter>({
      query: ({ page = 1, status, search, from, to }) => {
        const params = new URLSearchParams({ page: String(page) });
        if (status) params.set("status", status);
        if (search) params.set("search", search);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        return `admin/orders?${params.toString()}`;
      },
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
